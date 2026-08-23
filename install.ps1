# =============================================================================
# xinPlugin_MinIO_webUI - V1.0 一键安装 + 启动 (Windows)
#
# 作用:
#   1. 检查依赖 (Node >= 20 / pnpm / dsh)
#   2. 构建 DSH-better-sidebar (处理 Windows 的 rm -rf lib / pnpm allowBuilds)
#   3. 把 DSH-better-sidebar 与 xin-plugin-minio-webui 挂载进 DSH profile
#   4. 校验组合 (dsh --dump-config)
#   5. 启动 dsh web
#
# 用法: powershell -ExecutionPolicy Bypass -File .\install.ps1
# 可选参数: -Profile web  -MinioEndpoint http://127.0.0.1:9000  -SkipBuild  -NoLaunch
#
# 前置: 目标机已装 Node.js >= 20、pnpm、DSH (dsh 在 PATH)。MinIO 另行部署。
# =============================================================================
param(
  [string]$Profile = 'web',
  [string]$MinioEndpoint = 'http://127.0.0.1:9000',
  [switch]$SkipBuild,
  [switch]$NoLaunch
)
$ErrorActionPreference = 'Stop'

function Say([string]$m)  { Write-Host "[install] $m" -ForegroundColor Green }
function Warn([string]$m) { Write-Host "[warn] $m"  -ForegroundColor Yellow }
function Die([string]$m)  { Write-Host "[error] $m" -ForegroundColor Red; exit 1 }

$REPO_DIR = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($REPO_DIR)) { $REPO_DIR = (Get-Location).Path }
if ($env:DSH_HOME) { $DSH_HOME = $env:DSH_HOME }
elseif ($env:USERPROFILE) { $DSH_HOME = Join-Path $env:USERPROFILE '.dsh' }
else { $DSH_HOME = Join-Path $HOME '.dsh' }

$PROFILE_DIR = Join-Path $DSH_HOME "profiles\$Profile"
$SIDEBAR_DIR = Join-Path $REPO_DIR 'plugins\DSH-better-sidebar'
$PLUGIN_DIR  = Join-Path $REPO_DIR 'plugins\xin-plugin-minio-webui'
$SIDEBAR_LIB = Join-Path $SIDEBAR_DIR 'lib\index.js'

Say "仓库目录 : $REPO_DIR"
Say "profile  : $Profile  ($PROFILE_DIR)"

# ---- 1. 依赖检查 -----------------------------------------------------------
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Die '未找到 node。请安装 Node.js >= 20 并加入 PATH。' }
$nv = node --version
$major = [int]$nv.TrimStart('v').Split('.')[0]
if ($major -lt 20) { Die "node 版本过低: $(node --version)。需要 >= 20。" }
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) { Die '未找到 pnpm。请安装: npm install -g pnpm。' }
if (-not (Get-Command dsh -ErrorAction SilentlyContinue)) { Die '未找到 dsh。请安装 DeepSeek Harness 并确保 dsh 在 PATH。' }
Say "依赖 OK: node $(node --version) / pnpm $(pnpm --version)"

if (-not (Test-Path $PROFILE_DIR)) { Die "找不到 profile 目录: $PROFILE_DIR (请先运行过一次 dsh web 初始化)" }

# ---- 2. 构建 sidebar (处理 Windows 坑) --------------------------------------
if (-not $SkipBuild) {
  Say '构建 DSH-better-sidebar ...'
  if (-not (Test-Path $SIDEBAR_DIR)) { Die "缺少 sidebar 源码: $SIDEBAR_DIR" }

  # 2a. pnpm-workspace.yaml 放行 node-pty / protobufjs 构建脚本 (pnpm 11 会拦)
  $ws = Join-Path $SIDEBAR_DIR 'pnpm-workspace.yaml'
  if (-not (Test-Path $ws)) { New-Item -ItemType File -Path $ws -Force | Out-Null }
  $wsText = ''
  if (Test-Path $ws) { $wsText = Get-Content $ws -Raw }
  $nl = [Environment]::NewLine
  if ($wsText -notmatch 'allowBuilds:') {
    $wsText = $wsText + $nl + 'allowBuilds:' + $nl + '  node-pty: true' + $nl + '  protobufjs: true' + $nl
    Set-Content -Path $ws -Value $wsText -Encoding UTF8 -NoNewline
  }
  if ($wsText -notmatch 'minimumReleaseAgeExclude:') {
    $wsText = $wsText + $nl + 'minimumReleaseAgeExclude:' + $nl + '  - dsh-better-sidebar' + $nl
    Set-Content -Path $ws -Value $wsText -Encoding UTF8 -NoNewline
  }
  Say '已确保 pnpm-workspace.yaml: allowBuilds + minimumReleaseAgeExclude'

  Push-Location $SIDEBAR_DIR
  try {
    Say 'pnpm install ...'
    pnpm install
    if ($LASTEXITCODE -ne 0) { Die 'pnpm install 失败。请确认网络与 pnpm 可用。' }

    if (Test-Path 'lib') { Remove-Item 'lib' -Recurse -Force }
    Say 'tsc -p tsconfig.build.json ...'
    pnpm exec tsc -p tsconfig.build.json
    if ($LASTEXITCODE -ne 0) { Die 'tsc 失败。' }
    Say 'tsdown ...'
    pnpm exec tsdown
    if ($LASTEXITCODE -ne 0) { Die 'tsdown 失败。' }
  }
  finally { Pop-Location }

  if (-not (Test-Path $SIDEBAR_LIB)) { Die 'sidebar 构建未生成 lib/index.js' }
  Say 'sidebar 构建完成'
}
else {
  if (-not (Test-Path $SIDEBAR_LIB)) { Warn '已跳过构建, 但 lib/index.js 不存在 -- 请先构建。' }
  else { Say '跳过构建 (-SkipBuild)' }
}

# ---- 3. 挂载: junction + cordis.patch.yml -----------------------------------
function Mount-Plugin([string]$name, [string]$srcDir) {
  $nm = Join-Path $PROFILE_DIR 'node_modules'
  if (-not (Test-Path $nm)) { New-Item -ItemType Directory -Path $nm | Out-Null }
  $link = Join-Path $nm $name
  if (Test-Path $link) { Remove-Item $link -Force -Recurse }
  New-Item -ItemType Junction -Path $link -Target $srcDir | Out-Null
  Say "已挂载 $name -> $srcDir"
}

Mount-Plugin 'dsh-better-sidebar' $SIDEBAR_DIR
Mount-Plugin 'xin-plugin-minio-webui' $PLUGIN_DIR

$patch = Join-Path $PROFILE_DIR 'cordis.patch.yml'
$existing = ''
if (Test-Path $patch) { $existing = Get-Content $patch -Raw }
$nl = [Environment]::NewLine
$addLines = New-Object System.Collections.ArrayList
if ($existing -notmatch 'id:\s*better-sidebar') { [void]$addLines.Add("    - id: better-sidebar$nl      name: 'dsh-better-sidebar'") }
if ($existing -notmatch 'id:\s*minio-kb')        { [void]$addLines.Add("    - id: minio-kb$nl      name: 'xin-plugin-minio-webui'") }
if ($addLines.Count -gt 0) {
  if ($existing.Trim() -eq '' -or $existing -notmatch 'insert:') {
    $newText = '- insert:' + $nl + ($addLines -join $nl) + $nl
  }
  else {
    $newText = $existing.TrimEnd() + $nl + ($addLines -join $nl) + $nl
  }
  Set-Content -Path $patch -Value $newText -Encoding UTF8 -NoNewline
  Say '已更新 cordis.patch.yml (追加插件 insert)'
}
else {
  Say 'cordis.patch.yml 已含插件行, 跳过'
}

Write-Host 'cordis.patch.yml 现内容:'
Get-Content $patch | ForEach-Object { Write-Host ("  " + $_) }

# ---- 4. 校验组合 ------------------------------------------------------------
Say '校验 profile 组合 (dsh --dump-config) ...'
$dump = dsh --profile $Profile --dump-config 2>&1
$dumpExit = $LASTEXITCODE
$dump | Out-String | Write-Host
if ($dumpExit -ne 0) { Die 'profile 组合校验失败。' }
if ($dump -notmatch 'xin-plugin-minio-webui') {
  Warn 'dump-config 未见 xin-plugin-minio-webui -- 挂载可能未生效 (clientModules 缓存, 需重启 dsh web)'
}
else { Say '组合校验通过: xin-plugin-minio-webui 已挂载' }

# ---- 5. 启动 dsh web --------------------------------------------------------
if (-not $NoLaunch) {
  Say '启动 dsh web (新窗口) ... 浏览器访问 http://127.0.0.1:3080'
  Start-Process -FilePath (Get-Command dsh).Source -ArgumentList 'web' -WorkingDirectory $PROFILE_DIR
  Say '已发起启动。'
}
Say '安装完成。'
Say '提示:'
Say '  首次启动后, 打开 better-sidebar (右侧) 的 + 菜单, 选 Knowledge Base。'
Say "  面板右上 齿轮, 把 MinIO Endpoint 填成 $MinioEndpoint (或你的端点), 保存。"
Say '  若 Knowledge Base 未出现, 硬刷新 Ctrl+Shift+R; 仍无则重启 dsh web (clientModules 缓存 package 元数据)。'
