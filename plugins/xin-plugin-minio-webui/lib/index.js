// MinIO KnowledgeBase — Host 半（挂载包）
// 通过 webServer.register 提供 /minio/api/* JSON 路由，对 MinIO 做只读浏览 + 预览 + 上传/下载/删除。
import { promises as nodeFs } from 'node:fs'
import nodePath from 'node:path'
import { spawn as nodeSpawn } from 'node:child_process'

// 用标准 Cordis inject 规范接入 webServer（同 dsh-client-connection 的做法），
// 避免在宿主作用域里 ctx.get('webServer') 解析不到。
export const inject = ['webServer']

export function apply(ctx) {
  const webServer = ctx.webServer || ctx.get('webServer')
  if (webServer === undefined) return

  // 宿主级组合不一定暴露 ctx.fs / ctx.subprocess（它们多在 agent 会话上下文）。
  // 这里用 Node 内建能力兜底：文件读写走 node:fs，进程执行走 node:child_process。
  const subprocessSvc = ctx.get('subprocess')

  // 固定到部署目录，保证状态文件 minio-config.json 位置确定。
  const baseDir = 'C:/Users/kimtse/.dsh/xinPlugin_MinIO_webUI'

  const CURL = 'C:/Windows/System32/curl.exe'
  const CERTUTIL = 'C:/Windows/System32/certutil.exe'

  const STATE_PATH = baseDir + '/minio-config.json'
  const UP_B64 = baseDir + '/.minio-upload.b64'
  const UP_BIN = baseDir + '/.minio-upload.bin'
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

  // 启动标记：用于事后确认宿主 half 是否执行、服务是否解析到。
  try {
    nodeFs.writeFile(baseDir + '/.minio-host.marker', JSON.stringify({
      loaded: true,
      time: new Date().toISOString(),
      webServer: !!webServer,
      subprocess: !!subprocessSvc,
      mode: 'node-builtins-fs',
    })).catch(() => {})
  } catch (e) { /* ignore */ }

  // 统一的文件 API（string path + utf8 text），与本插件使用方式一致。
  const fs = {
    resolve: async (p) => nodePath.resolve(p),
    readText: async (p) => nodeFs.readFile(p, 'utf8'),
    writeText: async (p, t) => { await nodeFs.writeFile(p, t, 'utf8') },
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
    if (subprocessSvc && typeof subprocessSvc.spawn === 'function') return runService(argv, o)
    return runNode(argv, o)
  }

  function runService(argv, o) {
    return new Promise((resolve) => {
      let handle
      try {
        handle = subprocessSvc.spawn({
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

  function runNode(argv, o) {
    return new Promise((resolve) => {
      if (!argv || argv.length === 0) { resolve({ exitCode: -1, stdout: '', stderr: 'no argv' }); return }
      const stdout = []
      const stderr = []
      let proc
      try {
        proc = nodeSpawn(argv[0], argv.slice(1), { cwd: baseDir, windowsHide: true })
      } catch (e) {
        resolve({ exitCode: -1, stdout: '', stderr: String((e && e.message) || e) })
        return
      }
      proc.stdout.on('data', (c) => stdout.push(c))
      proc.stderr.on('data', (c) => stderr.push(c))
      proc.on('error', (e) => resolve({ exitCode: -1, stdout: Buffer.concat(stdout).toString('utf8'), stderr: String((e && e.message) || e) }))
      proc.on('close', (code) => resolve({ exitCode: code == null ? -1 : code, stdout: Buffer.concat(stdout).toString('utf8'), stderr: Buffer.concat(stderr).toString('utf8') }))
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
    async upload(payload) {
      try {
        const state = await readState()
        const bucket = String((payload && payload.bucket) || '')
        const prefix = (payload && payload.prefix) ? String(payload.prefix) : ''
        const rawName = String((payload && payload.name) || 'file')
        const base64 = String((payload && payload.base64) || '')
        const contentType = (payload && payload.contentType) ? String(payload.contentType) : guessType(rawName)
        if (!bucket) return { ok: false, error: 'no bucket' }
        const safe = rawName.split('/').pop().replace(/[\\]/g, '_') || 'file'
        const key = (prefix ? prefix : '') + safe
        if (!base64) return { ok: false, error: 'empty content' }
        const b64t = await fs.resolve(UP_B64)
        await fs.writeText(b64t, base64)
        const dec = await run([CERTUTIL, '-f', '-decode', UP_B64, UP_BIN])
        if (dec.exitCode !== 0) return { ok: false, error: 'decode failed: ' + (dec.stderr || dec.stdout || 'exit ' + dec.exitCode) }
        const up = await run([CURL, '-s', '-S', '-f', '-X', 'PUT', '--data-binary', '@' + UP_BIN, '-H', 'Content-Type: ' + contentType].concat(sigArgs(state), [objectUrl(state, bucket, key)]))
        if (up.exitCode !== 0) return { ok: false, error: (up.stderr || '') + ' (exit ' + up.exitCode + ')' }
        return { ok: true, key, name: safe }
      } catch (err) { return { ok: false, error: String((err && err.message) || err) } }
    },
    async remove(payload) {
      try {
        const state = await readState()
        const bucket = String((payload && payload.bucket) || '')
        const key = String((payload && payload.key) || '')
        if (!bucket || !key) return { ok: false, error: 'no bucket/key' }
        const res = await run([CURL, '-s', '-S', '-f', '-X', 'DELETE'].concat(sigArgs(state), [objectUrl(state, bucket, key)]))
        if (res.exitCode !== 0) return { ok: false, error: (res.stderr || '') + ' (exit ' + res.exitCode + ')' }
        return { ok: true }
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
        const text = await new Promise((resolve, reject) => {
          const chunks = []
          req.on('data', (c) => { chunks.push(Buffer.from(c)) })
          req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
          req.on('error', reject)
        })
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
