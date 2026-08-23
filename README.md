# xinPlugin_MinIO_webUI

DSH（DeepSeek Harness）原生融合的 **知识库 / MinIO 文件管理插件** —— V1.5

> 在 DSH 内嵌一个「Knowledge Base」侧边面板（基于 dsh-better-sidebar）：绑定 Bucket → 目录树浏览 → 资源管理器式文件管理（上传/下载/预览/删除 + 更多菜单）。纯插件、零内核侵入，配置本地持久化，不侵入 DSH 数据库。

| 项 | 值 |
|---|---|
| 版本 | **1.5.0** |
| 日期 | **2026-08-24** |
| 目标 | Windows（Node/pnpm/DSH 已装，MinIO 已部署） |
| 依赖 | dsh-better-sidebar（随本仓库提供） |

> 📌 **V1.5 文件名过长缩写**：文件卡片/列表的名称过长时不再换行撑高卡片——主名过长自动省略号（`…`），但**始终完整显示后缀**（如 `.pdf`）。实现：名称拆成「主名（可省略）」+「后缀（固定完整）」两个 span，主名用 `text-overflow:ellipsis` 单行裁剪、后缀 `flex:none` 恒显示；列表视图 `table-layout:fixed` 分摊列宽不溢出。两个视图均单行。
>
> 📌 **V1.4 拖放上传提示**：拖文件进 Knowledge Base 面板时显示全屏拖放提示（上传图标 + "松开以上传 N 个文件" + 上传位置 + 限制说明）。作用逻辑：把文件拖到右侧文件区，松手即上传到当前目录（`Bucket/当前文件夹`）；未选 Bucket 时提示先选择。限制：最多一次 20 个文件、单个不超过 20MB（超出在面板提示，不静默丢弃）。上传后自动刷新列表。
>
> 📌 **V1.3.1 修复**：修复「加载中…/测试中…」一直不落。根因是宿主环境里设了 `HTTP_PROXY(127.0.0.1:7890)`，宿主用 curl 调 MinIO 时走了该代理，代理会**挂起 SigV4 ListObjects**（`GET /bucket?list-type=2`），导致 `listObjects`（面板加载、上传后刷新）永不返回；`GET /`（ListBuckets 测试连接）代理能放行所以看似正常。修法：宿主 `run()` 里给**所有 curl 请求注入 `--noproxy *` 直连 MinIO**（certutil 不受影响）。
>
> 📌 **V1.3 文件下拉菜单优化**：① 下拉单不再被 Buckets 列表/网格裁剪——改用 `ReactDOM.createPortal` 渲染到 `document.body`（`position:fixed`），彻底脱离 `.kb-grid{overflow:auto}` 的裁剪上下文；② 「⋯」移到文件卡片**右上角**（图标/名称上方不再占位）；③ 点击菜单外任意空白自动关闭（document 级 click-outside）；④ 切换图标/列表视图时重置下拉单与「确认删除」状态，不带着切换。
>
> 📌 **V1.2.1 修复**：修复「⚙️ 加MinIO配置」点没反应。根因是宿主 half 用 `ctx.get('webServer')` 却未声明 `inject`，在宿主级作用域解析不到服务导致 `apply()` 提前退出、`/minio/api` 路由从未注册（客户端 `getState` 落回 fallback 被 405，`state` 恒为空，配置弹窗因 `configOpen && state` 不渲染）。改为 `export const inject=['webServer']` + `ctx.webServer` 注册（同 client-connection 标准写法），`fs`/`subprocess` 改用 Node 内建 `node:fs` + `node:child_process` 兜底，`baseDir` 固定为部署目录；客户端 `api()` 改为防御式（非 2xx/空 body 返回结构化错误）。

---

## 一、主要功能

1. **侧边栏入口**：DSH 内嵌「Knowledge Base」Tab（`dsh-better-sidebar.registerTab`，带数据库图标），点击即打开资源管理器面板。
2. **Bucket 管理**：
   - 右上 **⚙️ 加MinIO配置**：Endpoint / AccessKey / SecretKey / Region / SSL + 测试连接 + 保存（本地持久化 `minio-config.json`）。
   - 右上 **➕ 加Bucket**：**从 MinIO 拉回可用 Bucket 列表**，点击一个即绑定（仅本地绑定，不删真实桶）。
   - 左侧 `Buckets` 树：点选进入浏览；右键移除本地绑定。
3. **资源管理器式文件浏览**：
   - 面包屑 `Knowledge Base > bucket / 目录`，可点击回退。
   - **图标 / 列表** 视图切换；图标视图文件夹置顶（黄色文件夹)。
   - 点击文件预览：`md/txt/csv/json` 文本、`png/jpg/gif` 图片、`pdf` iframe —— 预览弹窗**内嵌在面板内**。
4. 添加/移除 Bucket、保存配置后**树/配置立即热更新**，无需重开面板。

---

## 二、实现方式（架构）

- **挂载式插件**（非动态插件）：`xin-plugin-minio-webui` 以 bundle 形式挂进 DSH profile，CLIENT 在页面启动时注册，**刷新不失效**。
- **Host 半**（`lib/index.js`）：用 `ctx.webServer.register({ kind:'prefix', path:'/minio/api', handler })` 提供 JSON 路由（`getState/saveConfig/testConnection/listObjects/readText/download/...`），所有 MinIO 请求经 `curl --aws-sigv4` + `certutil`（base64）完成。
- **Client 半**（`lib/client.js`）：`fetch('/minio/api/...')` 调后端；`React.createElement` 渲染；`dsh-better-sidebar.registerTab` 注册「Knowledge Base」Tab。
- **配置持久化**：工作区根 `minio-config.json`（不侵入 DSH 数据库）。

```
DSH 前端 → better-sidebar Tab(Client) → /minio/api HTTP (Host) → curl(SigV4) → MinIO
```

---

## 三、一键安装 + 启动（Windows）

### 环境要求
- Node.js **>= 20**
- **pnpm**（`npm install -g pnpm`）
- **dsh**（DeepSeek Harness，`dsh` 在 PATH；至少跑过一次 `dsh web` 初始化 profile）
- **MinIO 服务**（另行部署，本插件连它的 S3 端点）

### 步骤
```powershell
# 在仓库根目录（含 install.ps1 的那层）运行：
powershell -ExecutionPolicy Bypass -File .\install.ps1
```
脚本会自动：检查依赖 → 构建 `DSH-better-sidebar`（处理 Windows 的 `rm -rf lib`、pnpm `allowBuilds`）→ 把两个插件 junction 挂载进 profile + 追加 `cordis.patch.yml` → 校验组合 → 启动 `dsh web`。

可选参数：
```powershell
.\install.ps1 -Profile web -MinioEndpoint http://127.0.0.1:9000   # 默认值
.\install.ps1 -SkipBuild      # 已构建过则跳过 rebuild
.\install.ps1 -NoLaunch       # 只安装，不启动
```

启动后：浏览器打开 `http://127.0.0.1:3080`，打开 better-sidebar（右侧）→ `+` 菜单 → **Knowledge Base**。若首次没出现，**硬刷新（Ctrl+Shift+R）**；仍无则**重启 dsh web**（clientModules 会缓存 package 元数据，见坑#4）。

---

## 四、目录结构

```
xinPlugin_MinIO_webUI/
├── README.md
├── install.ps1                          # 一键安装+启动（Windows）
└── plugins/
    ├── DSH-better-sidebar/              # dsh-better-sidebar 源码（含 src/scripts/dsh.plugin.json 等）
    └── xin-plugin-minio-webui/          # 本插件 V1.0
        ├── package.json                 # dsh.client 声明 + exports ./client
        └── lib/
            ├── index.js                 # Host：/minio/api/* HTTP 路由
            └── client.js                # Client：better-sidebar Tab + 资源管理器 UI
```

---

## 五、踩到的坑（重要）

1. **`dsh-better-sidebar` 的 `pnpm build` 在 Windows 跑不了**：它的 build script 是 `rm -rf lib && tsc ... && tsdown`，`rm -rf` 是 Unix 命令。解决：`install.ps1` 直接 `Remove-Item lib -Recurse -Force` 后分别跑 `tsc -p tsconfig.build.json` 和 `tsdown`。
2. **pnpm 11 `strict-dep-builds` 拦构建脚本**：`node-pty`/`protobufjs` 会被拒。需在 `pnpm-workspace.yaml` 写 `allowBuilds: { node-pty: true, protobufjs: true }`（`install.ps1` 已处理）。
3. **`dsh registry install/enable` 只存在于内网 DSH-SH**，公开 DSH 没有该子命令（公开 DSH 只有 `web`/`plugin`）。所以不用 registry，改用 **junction 挂载 + `cordis.patch.yml` insert**（`install.ps1` 实现）。两个插件需目录联结进 `profile/node_modules`。
4. **clientModules 缓存 package 元数据直到重启**：`package.json` 的 `dsh.client.inject`（模块加载顺序）改了要重启才生效；但 bundle 内容改动（`lib/client.js`）通过 HMR 即时生效。所以改 JS 只需硬刷新，改 inject/加插件建议重启。
5. **动态插件 client 刷新即失效**：早期用 `cordis_define/run`（动态插件）注册 UI，刷新后 client 丢失、外壳槽位不重绘。因此最终改为**挂载包**（bundle 进 profile），启动即注册、刷新稳定。
6. **`sidebar.footer.action` 槽位只渲染 cordis-panel 一个默认动作**：想加第二个动作（KnowledgeBase 底部按钮）注册成功但不渲染。所以改走 **better-sidebar**（`registerTab`，已验证可用）。
7. **`shell.overlay` 是点击穿透层**：条目需显式 `pointer-events:auto` 才可交互。
8. **client Modules 只能过 JSON**：文件预览走 Host 下载后再 base64 传给前端（`certutil` 编解码），非真·流式；大文件受限。
9. **密钥经 `--user` 传参进 curl 命令行**（进程列表可见）——生产环境建议改自实现 SigV4 签名（本 MVP 未做）。

---

## 六、MinIO 前置说明

插件默认端点 `http://127.0.0.1:9000`（可在面板 ⚙️ 改）。MinIO 需已存在至少一个桶（`dsh-plugin` 等），并在「加Bucket」里从列表选中绑定。插件**只读浏览 + 预览**（V1.0 不实现上传/删除；后续可扩展）。
