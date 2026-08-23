// MinIO KnowledgeBase — Host 半（挂载包）
// 通过 webServer.register 提供 /minio/api/* JSON 路由，对 MinIO 做只读浏览 + 预览 + 上传/下载/删除。
import { promises as nodeFs } from 'node:fs'
import nodePath from 'node:path'
import { spawn as nodeSpawn } from 'node:child_process'
import { createHash, createHmac, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import os from 'node:os'

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
    // 联动 Chroma 向量入库（可选）：上传成功后调用 ingest.py 抽文本入库。
    ragEnabled: true,
    chromaPython: 'python',
    chromaIngestScript: 'C:/Users/kimtse/.dsh/xinPlugin_Chroma_fastMCP/ingest.py',
    ragMcpUrl: 'http://127.0.0.1:8000/mcp',
    ragServerName: 'chroma',
    // 入库状态记录：key -> { ok, time, chunks, error, skipped }
    ingestions: {},
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

  // 清理上传/下载产生的临时文件（.minio-*.bin/.b64），避免残留占用磁盘。
  async function cleanupTemp() {
    for (const p of [UP_B64, UP_BIN, DL_BIN, DL_B64]) {
      try { await nodeFs.unlink(p) } catch (e) { /* ignore */ }
    }
  }
  function friendlyError(stderr) {
    const s = String(stderr || '')
    if (s.indexOf('could not resolve host') !== -1 || s.indexOf('Could not resolve') !== -1) return '无法解析 MinIO 端点地址'
    if (s.indexOf('Failed to connect') !== -1 || s.indexOf('Connection refused') !== -1) return '无法连接 MinIO 端点'
    if (s.indexOf('timed out') !== -1 || s.indexOf('Timeout') !== -1) return '连接 MinIO 超时'
    if (s.indexOf('SignatureDoesNotMatch') !== -1) return '签名校验失败，请检查 AccessKey/SecretKey/Region'
    if (s.indexOf('AccessDenied') !== -1 || s.indexOf('403') !== -1) return '访问被拒绝，请检查凭据与桶权限'
    if (s.indexOf('NoSuchBucket') !== -1) return 'Bucket 不存在'
    return s.trim()
  }

  // 配置密钥加密存储：AES-256-GCM，密钥由本机 hostname + 固定盐派生（同机可解，异机不可解）。
  function encKey() { return createHash('sha256').update((os.hostname() || 'dsh') + ':minio-kb:v1').digest() }
  function encryptSecret(plain) {
    try {
      const iv = randomBytes(12)
      const c = createCipheriv('aes-256-gcm', encKey(), iv)
      const enc = Buffer.concat([c.update(String(plain), 'utf8'), c.final()])
      return 'enc:v1:' + iv.toString('hex') + ':' + c.getAuthTag().toString('hex') + ':' + enc.toString('hex')
    } catch (e) { return String(plain) }
  }
  function decryptSecret(v) {
    if (typeof v !== 'string' || v.indexOf('enc:v1:') !== 0) return v
    try {
      const parts = v.split(':')
      const iv = Buffer.from(parts[2], 'hex')
      const tag = Buffer.from(parts[3], 'hex')
      const data = Buffer.from(parts[4], 'hex')
      const d = createDecipheriv('aes-256-gcm', encKey(), iv)
      d.setAuthTag(tag)
      return Buffer.concat([d.update(data), d.final()]).toString('utf8')
    } catch (e) { return v }
  }

  async function readState() {
    try {
      const t = await fs.resolve(STATE_PATH)
      const txt = await fs.readText(t)
      const parsed = JSON.parse(txt)
      const out = {}
      for (const k in DEFAULT_STATE) out[k] = (parsed && parsed[k] !== undefined) ? parsed[k] : DEFAULT_STATE[k]
      if (!Array.isArray(out.buckets)) out.buckets = []
      out.secretKey = decryptSecret(out.secretKey)
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
    const toStore = {}
    for (const k in clean) toStore[k] = clean[k]
    toStore.secretKey = encryptSecret(clean.secretKey)
    const t = await fs.resolve(STATE_PATH)
    await fs.writeText(t, JSON.stringify(toStore, null, 2))
    return clean
  }

  function run(argv, opt) {
    const o = opt || {}
    // 环境里有 HTTP_PROXY(127.0.0.1:7890)，curl 会走代理；代理会挂起 SigV4 ListObjects。
    // 所有 MinIO 请求一律 `--noproxy *` 直连（certutil 不走），并加连接/总超时防挂死。
    if (argv && argv[0] === CURL && argv.indexOf('--noproxy') === -1) {
      const extra = ['--noproxy', '*', '--connect-timeout', '5', '--max-time', '180']
      if (o.retries) extra.push('--retry', String(o.retries), '--retry-connrefused', '--retry-delay', '1')
      const lastUrl = argv[argv.length - 1]
      if (typeof lastUrl === 'string' && lastUrl.indexOf('https://') === 0) extra.push('-k')
      argv = argv.slice(0, 1).concat(extra, argv.slice(1))
    }
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
  const EMPTY_SHA = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  function sha256Hex(d) { return createHash('sha256').update(d).digest('hex') }
  // 自实现 AWS SigV4，密钥只在进程内参与签名，不再经 `--user` 暴露进 curl 命令行。
  function authHeaderArgs(cfg, method, url, payloadHash) {
    const u = new URL(url)
    const region = String(cfg.region || 'us-east-1')
    const ak = String(cfg.accessKey || '')
    const sk = String(cfg.secretKey || '')
    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.slice(0, 8)
    const qp = [...u.searchParams.entries()].map(([k, v]) => [encodeURIComponent(k), encodeURIComponent(v)]).sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1]))
    const query = qp.map(([k, v]) => k + '=' + v).join('&')
    const canonicalHeaders = 'host:' + u.host + '\n' + 'x-amz-content-sha256:' + payloadHash + '\n' + 'x-amz-date:' + amzDate + '\n'
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'
    const canonicalRequest = [method, u.pathname, query, canonicalHeaders, signedHeaders, payloadHash].join('\n')
    const scope = dateStamp + '/' + region + '/s3/aws4_request'
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256Hex(canonicalRequest)].join('\n')
    const kDate = createHmac('sha256', 'AWS4' + sk).update(dateStamp).digest()
    const kRegion = createHmac('sha256', kDate).update(region).digest()
    const kService = createHmac('sha256', kRegion).update('s3').digest()
    const kSigning = createHmac('sha256', kService).update('aws4_request').digest()
    const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex')
    const authorization = 'AWS4-HMAC-SHA256 Credential=' + ak + '/' + scope + ', SignedHeaders=' + signedHeaders + ', Signature=' + signature
    return ['-H', 'Authorization: ' + authorization, '-H', 'x-amz-content-sha256: ' + payloadHash, '-H', 'x-amz-date: ' + amzDate]
  }
  async function fileSha256(p) { return sha256Hex(await nodeFs.readFile(p)) }
  // 联动 Chroma 向量入库：上传成功后调用 ingest.py（抽文本→分块→向量入库）。
  async function runIngest(state, localFile, sourceName) {
    if (state.ragEnabled === false) return { skipped: true }
    const py = String(state.chromaPython || 'python')
    const script = String(state.chromaIngestScript || '')
    if (!script) return { skipped: true }
    const res = await run([py, script, localFile, sourceName], { graceMs: 180000 })
    let parsed = null
    try { parsed = JSON.parse(String(res.stdout || '').trim()) } catch (e) { /* not json */ }
    return { exitCode: res.exitCode, parsed, stderr: String(res.stderr || '').slice(0, 300) }
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
        for (const k in ['endpoint', 'accessKey', 'secretKey', 'region', 'ssl', 'ragEnabled', 'chromaPython', 'chromaIngestScript', 'ragMcpUrl', 'ragServerName']) if (patch[k] !== undefined) cur[k] = patch[k]
        const saved = await writeState(cur)
        return { ok: true, state: saved }
      } catch (e) { return { ok: false, error: String((e && e.message) || e) } }
    },
    async testConnection(payload) {
      try {
        const cfg = (payload && payload.config) ? payload.config : await readState()
        const ep = String(cfg.endpoint || '').replace(/\/+$/, '')
        const res = await run([CURL, '-s', '-S'].concat(authHeaderArgs(cfg, 'GET', ep + '/', EMPTY_SHA), [ep + '/']), { retries: 2 })
        if (res.exitCode !== 0) return { ok: false, error: friendlyError(res.stderr) + ' (exit ' + res.exitCode + ')' }
        const xml = res.stdout
        const e = xmlError(xml)
        if (e) return { ok: false, error: e, detail: xml.slice(0, 500) }
        return { ok: true, allBuckets: parseBucketNames(xml) }
      } catch (err) { return { ok: false, error: String((err && err.message) || err) } }
    },
    async testRag(payload) {
      try {
        const cfg = (payload && payload.config) ? payload.config : await readState()
        const py = String(cfg.chromaPython || 'python')
        const script = String(cfg.chromaIngestScript || '')
        const checks = []
        // 1) Python
        try {
          const v = await run([py, '--version'])
          checks.push({ name: 'Python', ok: v.exitCode === 0, msg: v.exitCode === 0 ? ('可用 v' + String(v.stdout || '').replace(/\s+/g, ' ').trim()) : '未找到或不可执行:' + (v.stderr || '').slice(0, 80) })
        } catch (e) { checks.push({ name: 'Python', ok: false, msg: String((e && e.message) || e) }) }
        // 2) Ingest 脚本
        try {
          await nodeFs.access(await fs.resolve(script))
          checks.push({ name: 'Ingest 脚本', ok: true, msg: script || '(未配置)' })
        } catch (e) { checks.push({ name: 'Ingest 脚本', ok: false, msg: '未找到: ' + (script || '(未配置)') }) }
        // 3) Chroma 模块
        try {
          const im = await run([py, '-c', 'import chromadb,fastmcp,pypdf'])
          checks.push({ name: 'Chroma 模块', ok: im.exitCode === 0, msg: im.exitCode === 0 ? 'chromadb/fastmcp/pypdf 可导入' : (im.stderr || '').slice(0, 120) || 'import 失败' })
        } catch (e) { checks.push({ name: 'Chroma 模块', ok: false, msg: String((e && e.message) || e) }) }
        // 4) MCP HTTP 端点
        const url = String(cfg.ragMcpUrl || '')
        if (url) {
          try {
            const probe = await run([CURL, '-s', '-o', 'NUL', '-w', '%{http_code}', '-m', '6', url])
            const code = String(probe.stdout || '').trim()
            const alive = !!code && ['200', '204', '400', '405', '406'].indexOf(code) !== -1
            checks.push({ name: 'MCP 端点', ok: alive, msg: url + ' → HTTP ' + (code || '无响应/超时') })
          } catch (e) { checks.push({ name: 'MCP 端点', ok: false, msg: url + ' 探测失败: ' + String((e && e.message) || e) }) }
        }
        return { ok: checks.every((c) => c.ok), checks }
      } catch (err) { return { ok: false, error: String((err && err.message) || err), checks: [] } }
    },
    async reconcileIngest(payload) {
      // 从 Chroma 的 list_sources 对齐入库状态，修正「先前命令行/standalone 入库的文件在 UI 显示未入库」。
      try {
        const state = await readState()
        const py = String(state.chromaPython || 'python')
        const script = String(state.chromaIngestScript || '')
        if (!script) return { ok: true, reconciled: 0, note: '未配置 ingest 脚本' }
        const repoDir = nodePath.dirname(script).replace(/\\/g, '/')
        const code = 'import sys,json; sys.path.insert(0,' + JSON.stringify(repoDir) + '); from chroma_store import list_sources; print(json.dumps(list_sources(), ensure_ascii=False))'
        const res = await run([py, '-c', code])
        if (res.exitCode !== 0) return { ok: false, error: (res.stderr || '').slice(0, 200) || ('exit ' + res.exitCode) }
        const sources = JSON.parse(String(res.stdout || '').trim())
        const ing = state.ingestions || {}
        let n = 0
        for (const s of (Array.isArray(sources) ? sources : [])) {
          const key = s.source
          if (!key) continue
          const prev = ing[key] || {}
          if (!prev.fromChroma || prev.chunks !== s.chunks) {
            ing[key] = Object.assign({}, prev, { ok: true, chunks: s.chunks, fromChroma: true, time: prev.time || '' })
            n++
          }
        }
        state.ingestions = ing
        await writeState(state)
        return { ok: true, reconciled: n, sources: (sources || []).map((s) => s.source) }
      } catch (err) { return { ok: false, error: String((err && err.message) || err) } }
    },
    async bucketExists(payload) {
      try {
        const state = await readState()
        const name = String((payload && payload.name) || '')
        if (!name) return { ok: false, error: 'no bucket name' }
        const res = await run([CURL, '-s', '--head', '-o', 'NUL', '-w', '%{http_code}'].concat(authHeaderArgs(state, 'HEAD', bucketUrl(state, name), EMPTY_SHA), [bucketUrl(state, name)]), { retries: 2 })
        const code = (res.stdout || '').trim()
        if (code === '200') return { ok: true, exists: true }
        if (code === '404') return { ok: true, exists: false }
        return { ok: false, error: friendlyError(res.stderr) + ' (http ' + code + ')' }
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
        const res = await run([CURL, '-s', '-S'].concat(authHeaderArgs(state, 'GET', url, EMPTY_SHA), [url]), { retries: 2 })
        if (res.exitCode !== 0) return { ok: false, error: friendlyError(res.stderr) + ' (exit ' + res.exitCode + ')' }
        const xml = res.stdout
        const e = xmlError(xml)
        if (e) return { ok: false, error: e, detail: xml.slice(0, 500) }
        const parsed = parseListV2(xml)
        const ing = state.ingestions || {}
        const files = parsed.files.map((f) => ing[f.key] ? Object.assign({}, f, { ingest: ing[f.key] }) : f)
        return { ok: true, folders: parsed.folders, files }
      } catch (err) { return { ok: false, error: String((err && err.message) || err) } }
    },
    async readText(payload) {
      try {
        const state = await readState()
        const bucket = String((payload && payload.bucket) || '')
        const key = String((payload && payload.key) || '')
        if (!bucket || !key) return { ok: false, error: 'no bucket/key' }
        const dl = await run([CURL, '-s', '-S', '-f', '-o', DL_BIN].concat(authHeaderArgs(state, 'GET', objectUrl(state, bucket, key), EMPTY_SHA), [objectUrl(state, bucket, key)]), { retries: 2 })
        if (dl.exitCode !== 0) return { ok: false, error: friendlyError(dl.stderr) + ' (exit ' + dl.exitCode + ')' }
        const t = await fs.resolve(DL_BIN)
        const txt = await fs.readText(t)
        await cleanupTemp()
        return { ok: true, name: key.split('/').pop(), text: txt }
      } catch (err) { return { ok: false, error: String((err && err.message) || err) } }
    },
    async download(payload) {
      try {
        const state = await readState()
        const bucket = String((payload && payload.bucket) || '')
        const key = String((payload && payload.key) || '')
        if (!bucket || !key) return { ok: false, error: 'no bucket/key' }
        const dl = await run([CURL, '-s', '-S', '-f', '-o', DL_BIN].concat(authHeaderArgs(state, 'GET', objectUrl(state, bucket, key), EMPTY_SHA), [objectUrl(state, bucket, key)]), { retries: 2 })
        if (dl.exitCode !== 0) return { ok: false, error: friendlyError(dl.stderr) + ' (exit ' + dl.exitCode + ')' }
        const enc = await run([CERTUTIL, '-f', '-encode', DL_BIN, DL_B64])
        if (enc.exitCode !== 0) return { ok: false, error: 'encode failed: ' + (enc.stderr || enc.stdout || 'exit ' + enc.exitCode) }
        const t = await fs.resolve(DL_B64)
        const txt = await fs.readText(t)
        const b64 = txt.split(/\r?\n/).filter((l) => l && l.indexOf('-----') !== 0).join('')
        await cleanupTemp()
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
        const payloadHash = await fileSha256(UP_BIN)
        const up = await run([CURL, '-s', '-S', '-f', '-X', 'PUT', '--data-binary', '@' + UP_BIN, '-H', 'Content-Type: ' + contentType].concat(authHeaderArgs(state, 'PUT', objectUrl(state, bucket, key), payloadHash), [objectUrl(state, bucket, key)]))
        if (up.exitCode !== 0) return { ok: false, error: friendlyError(up.stderr) + ' (exit ' + up.exitCode + ')' }
        let ingested = null
        try { ingested = await runIngest(state, UP_BIN, safe) } catch (e) { ingested = { error: String((e && e.message) || e) } }
        await cleanupTemp()
        // 持久化入库状态（供知识库下拉菜单展示）。
        try {
          const ing = state.ingestions || {}
          const parsed = ingested && ingested.parsed
          ing[key] = {
            ok: !!(parsed && parsed.ok),
            skipped: !!(ingested && ingested.skipped),
            time: new Date().toISOString(),
            chunks: (parsed && parsed.chunks) || 0,
            error: (ingested && (ingested.error || (parsed && !parsed.ok ? parsed.error : ''))) || '',
          }
          state.ingestions = ing
          await writeState(state)
        } catch (e) { /* 状态写失败不影响上传 */ }
        return { ok: true, key, name: safe, ingested }
      } catch (err) { return { ok: false, error: String((err && err.message) || err) } }
    },
    async remove(payload) {
      try {
        const state = await readState()
        const bucket = String((payload && payload.bucket) || '')
        const key = String((payload && payload.key) || '')
        if (!bucket || !key) return { ok: false, error: 'no bucket/key' }
        const res = await run([CURL, '-s', '-S', '-f', '-X', 'DELETE'].concat(authHeaderArgs(state, 'DELETE', objectUrl(state, bucket, key), EMPTY_SHA), [objectUrl(state, bucket, key)]))
        if (res.exitCode !== 0) return { ok: false, error: friendlyError(res.stderr) + ' (exit ' + res.exitCode + ')' }
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
