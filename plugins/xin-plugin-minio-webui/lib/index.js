// MinIO KnowledgeBase — Host 半（挂载包）
// 通过 webServer.register 提供 /minio/api/* JSON 路由，对 MinIO 做只读浏览 + 预览。
export function apply(ctx) {
  const webServer = ctx.get('webServer')
  const fs = ctx.get('fs')
  const subprocess = ctx.get('subprocess')
  if (webServer === undefined || fs === undefined || subprocess === undefined) return

  const sandboxPolicy = ctx.get('sandboxPolicy')
  const rawRoot = (sandboxPolicy && sandboxPolicy.workspaceRoot) || ''
  const baseDir = (rawRoot || 'C:/Users/kimtse/.dsh/xinPlugin_MinIO_webUI').replace(/\\/g, '/').replace(/\/+$/, '')

  const CURL = 'C:/Windows/System32/curl.exe'
  const CERTUTIL = 'C:/Windows/System32/certutil.exe'

  const STATE_PATH = baseDir + '/minio-config.json'
  const DL_BIN = baseDir + '/.minio-download.bin'
  const DL_B64 = baseDir + '/.minio-download.b64'

  const DEFAULT_STATE = {
    endpoint: 'http://127.0.0.1:9000',
    accessKey: 'admin',
    secretKey: 'Admin123456',
    region: 'us-east-1',
    ssl: false,
    buckets: [],
  }

  async function readState() {
    try {
      const t = await fs.resolve(STATE_PATH)
      const txt = await fs.readText(t)
      const parsed = JSON.parse(txt)
      const out = {}
      for (const k in DEFAULT_STATE) out[k] = (parsed && parsed[k] !== undefined) ? parsed[k] : DEFAULT_STATE[k]
      if (!Array.isArray(out.buckets)) out.buckets = []
      return out
    } catch (e) {
      const out = {}
      for (const k in DEFAULT_STATE) out[k] = DEFAULT_STATE[k]
      return out
    }
  }

  async function writeState(state) {
    const clean = {}
    for (const k in DEFAULT_STATE) clean[k] = (state && state[k] !== undefined) ? state[k] : DEFAULT_STATE[k]
    clean.buckets = Array.isArray(clean.buckets) ? clean.buckets : []
    const t = await fs.resolve(STATE_PATH)
    await fs.writeText(t, JSON.stringify(clean, null, 2))
    return clean
  }

  function run(argv, opt) {
    const o = opt || {}
    return new Promise((resolve) => {
      let handle
      try {
        handle = subprocess.spawn({
          argv: argv,
          cwd: baseDir,
          stdio: { stdin: 'ignore', stdout: { maxBytes: o.maxOut || (32 * 1024 * 1024) }, stderr: { maxBytes: 64 * 1024 } },
          graceMs: o.graceMs || 60000,
        })
      } catch (e) {
        resolve({ exitCode: -1, stdout: '', stderr: String((e && e.message) || e) })
        return
      }
      handle.done.then((outcome) => {
        const out = (handle.collected && handle.collected.stdout) ? handle.collected.stdout.readFrom(0).text : ''
        const err = (handle.collected && handle.collected.stderr) ? handle.collected.stderr.readFrom(0).text : ''
        resolve({ exitCode: (outcome && outcome.exitCode != null) ? outcome.exitCode : -1, stdout: out, stderr: err })
      }).catch((e) => {
        resolve({ exitCode: -1, stdout: '', stderr: String((e && e.message) || e) })
      })
    })
  }

  function bucketUrl(cfg, bucket) {
    const ep = String(cfg.endpoint || '').replace(/\/+$/, '')
    return ep + '/' + encodeURIComponent(String(bucket))
  }
  function objectUrl(cfg, bucket, key) {
    return bucketUrl(cfg, bucket) + '/' + String(key).split('/').map((p) => encodeURIComponent(p)).join('/')
  }
  function sigArgs(cfg) {
    return ['--aws-sigv4', 'aws:amz:' + (cfg.region || 'us-east-1') + ':s3', '--user', String(cfg.accessKey || '') + ':' + String(cfg.secretKey || '')]
  }
  function decodeXml(s) {
    return String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
  }
  function xmlError(xml) {
    const m = /<Code>([\s\S]*?)<\/Code>/.exec(xml)
    if (m) return m[1]
    const m2 = /<Message>([\s\S]*?)<\/Message>/.exec(xml)
    return m2 ? m2[1] : ''
  }
  function guessType(key) {
    const m = /\.([A-Za-z0-9]+)$/.exec(String(key))
    const ext = m ? m[1].toLowerCase() : ''
    if (ext === 'txt' || ext === 'md' || ext === 'csv') return 'text/plain'
    if (ext === 'json') return 'application/json'
    if (ext === 'png') return 'image/png'
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
    if (ext === 'gif') return 'image/gif'
    if (ext === 'pdf') return 'application/pdf'
    return 'application/octet-stream'
  }
  function parseListV2(xml) {
    const folders = []
    const files = []
    let m
    const re = /<CommonPrefixes>([\s\S]*?)<\/CommonPrefixes>/g
    while ((m = re.exec(xml)) !== null) {
      const p = /<Prefix>([\s\S]*?)<\/Prefix>/.exec(m[1])
      if (p) folders.push(decodeXml(p[1]))
    }
    const re2 = /<Contents>([\s\S]*?)<\/Contents>/g
    while ((m = re2.exec(xml)) !== null) {
      const block = m[1]
      const k = /<Key>([\s\S]*?)<\/Key>/.exec(block)
      if (!k) continue
      const key = decodeXml(k[1])
      const sz = /<Size>([\s\S]*?)<\/Size>/.exec(block)
      const lm = /<LastModified>([\s\S]*?)<\/LastModified>/.exec(block)
      const name = key.split('/').pop()
      const em = /\.([A-Za-z0-9]+)$/.exec(name)
      files.push({ key, name, size: sz ? parseInt(sz[1], 10) : 0, lastModified: lm ? lm[1] : '', type: em ? em[1].toLowerCase() : '' })
    }
    return { folders, files }
  }
  function parseBucketNames(xml) {
    const out = []
    const re = /<Bucket>[\s\S]*?<Name>([\s\S]*?)<\/Name>[\s\S]*?<\/Bucket>/g
    let m
    while ((m = re.exec(xml)) !== null) out.push(decodeXml(m[1]))
    return out
  }

  const api = {
    async getState() {
      try { return { ok: true, state: await readState() } }
      catch (e) { return { ok: false, error: String((e && e.message) || e) } }
    },
    async saveConfig(payload) {
      try {
        const cur = await readState()
        const patch = (payload && payload.config) || {}
        for (const k in ['endpoint', 'accessKey', 'secretKey', 'region', 'ssl']) if (patch[k] !== undefined) cur[k] = patch[k]
        const saved = await writeState(cur)
        return { ok: true, state: saved }
      } catch (e) { return { ok: false, error: String((e && e.message) || e) } }
    },
    async testConnection(payload) {
      try {
        const cfg = (payload && payload.config) ? payload.config : await readState()
        const ep = String(cfg.endpoint || '').replace(/\/+$/, '')
        const res = await run([CURL, '-s', '-S'].concat(sigArgs(cfg), [ep + '/']))
        if (res.exitCode !== 0) return { ok: false, error: (res.stderr || '') + ' (exit ' + res.exitCode + ')' }
        const xml = res.stdout
        const e = xmlError(xml)
        if (e) return { ok: false, error: e, detail: xml.slice(0, 500) }
        return { ok: true, allBuckets: parseBucketNames(xml) }
      } catch (err) { return { ok: false, error: String((err && err.message) || err) } }
    },
    async bucketExists(payload) {
      try {
        const state = await readState()
        const name = String((payload && payload.name) || '')
        if (!name) return { ok: false, error: 'no bucket name' }
        const res = await run([CURL, '-s', '--head', '-o', 'NUL', '-w', '%{http_code}'].concat(sigArgs(state), [bucketUrl(state, name)]))
        const code = (res.stdout || '').trim()
        if (code === '200') return { ok: true, exists: true }
        if (code === '404') return { ok: true, exists: false }
        return { ok: false, error: (res.stderr || '') + ' (http ' + code + ')' }
      } catch (err) { return { ok: false, error: String((err && err.message) || err) } }
    },
    async addBucket(payload) {
      try {
        const state = await readState()
        const name = String((payload && payload.name) || '')
        if (!name) return { ok: false, error: 'no name' }
        if (state.buckets.some((b) => b.name === name)) return { ok: true, state: state }
        state.buckets.push({ id: 'bkt_' + Date.now().toString(36), name })
        const saved = await writeState(state)
        return { ok: true, state: saved }
      } catch (err) { return { ok: false, error: String((err && err.message) || err) } }
    },
    async removeBucket(payload) {
      try {
        const state = await readState()
        const id = String((payload && payload.id) || '')
        state.buckets = state.buckets.filter((b) => b.id !== id)
        const saved = await writeState(state)
        return { ok: true, state: saved }
      } catch (err) { return { ok: false, error: String((err && err.message) || err) } }
    },
    async listObjects(payload) {
      try {
        const state = await readState()
        const bucket = String((payload && payload.bucket) || '')
        const prefix = (payload && payload.prefix) ? String(payload.prefix) : ''
        if (!bucket) return { ok: false, error: 'no bucket' }
        const url = bucketUrl(state, bucket) + '?list-type=2&delimiter=/' + (prefix ? '&prefix=' + encodeURIComponent(prefix) : '')
        const res = await run([CURL, '-s', '-S'].concat(sigArgs(state), [url]))
        if (res.exitCode !== 0) return { ok: false, error: (res.stderr || '') + ' (exit ' + res.exitCode + ')' }
        const xml = res.stdout
        const e = xmlError(xml)
        if (e) return { ok: false, error: e, detail: xml.slice(0, 500) }
        const parsed = parseListV2(xml)
        return { ok: true, folders: parsed.folders, files: parsed.files }
      } catch (err) { return { ok: false, error: String((err && err.message) || err) } }
    },
    async readText(payload) {
      try {
        const state = await readState()
        const bucket = String((payload && payload.bucket) || '')
        const key = String((payload && payload.key) || '')
        if (!bucket || !key) return { ok: false, error: 'no bucket/key' }
        const dl = await run([CURL, '-s', '-S', '-f', '-o', DL_BIN].concat(sigArgs(state), [objectUrl(state, bucket, key)]))
        if (dl.exitCode !== 0) return { ok: false, error: (dl.stderr || '') + ' (exit ' + dl.exitCode + ')' }
        const t = await fs.resolve(DL_BIN)
        const txt = await fs.readText(t)
        return { ok: true, name: key.split('/').pop(), text: txt }
      } catch (err) { return { ok: false, error: String((err && err.message) || err) } }
    },
    async download(payload) {
      try {
        const state = await readState()
        const bucket = String((payload && payload.bucket) || '')
        const key = String((payload && payload.key) || '')
        if (!bucket || !key) return { ok: false, error: 'no bucket/key' }
        const dl = await run([CURL, '-s', '-S', '-f', '-o', DL_BIN].concat(sigArgs(state), [objectUrl(state, bucket, key)]))
        if (dl.exitCode !== 0) return { ok: false, error: (dl.stderr || '') + ' (exit ' + dl.exitCode + ')' }
        const enc = await run([CERTUTIL, '-f', '-encode', DL_BIN, DL_B64])
        if (enc.exitCode !== 0) return { ok: false, error: 'encode failed: ' + (enc.stderr || enc.stdout || 'exit ' + enc.exitCode) }
        const t = await fs.resolve(DL_B64)
        const txt = await fs.readText(t)
        const b64 = txt.split(/\r?\n/).filter((l) => l && l.indexOf('-----') !== 0).join('')
        return { ok: true, name: key.split('/').pop(), base64: b64, contentType: guessType(key) }
      } catch (err) { return { ok: false, error: String((err && err.message) || err) } }
    },
  }

  ctx.effect(() => webServer.register({
    kind: 'prefix',
    path: '/minio/api',
    handler: async (req, res) => {
      if (req.method !== 'POST') {
        res.writeHead(405, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, error: 'method not allowed' }))
        return
      }
      const pathname = new URL(req.url ?? '/', 'http://dsh.internal').pathname
      const method = pathname.startsWith('/minio/api/') ? pathname.slice('/minio/api/'.length) : undefined
      if (!method || method.includes('/')) {
        res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, error: 'unknown method' }))
        return
      }
      let payload = {}
      try {
        const chunks = []
        for await (const chunk of req) chunks.push(Buffer.from(chunk))
        const text = Buffer.concat(chunks).toString('utf8')
        if (text.trim() !== '') payload = JSON.parse(text)
      } catch (e) {
        res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, error: 'invalid json body' }))
        return
      }
      const handler = api[method]
      if (typeof handler !== 'function') {
        res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, error: 'unknown method ' + method }))
        return
      }
      try {
        const result = await handler(payload)
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify(result))
      } catch (e) {
        res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, error: String((e && e.message) || e) }))
      }
    },
  }), 'minio-kb: /minio/api routes')
}
