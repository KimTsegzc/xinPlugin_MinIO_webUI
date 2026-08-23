# issues_0824_midnight

> MinIO v3.0 + Chroma fastMCP v1.0 联动开发期间遇到的问题汇总。
> 记录时间：2026-08-24 深夜。状态：✅ 已解决 / ⚠️ 已绕过（不影响本功能）/ 📌 需用户操作。

## 1. Python 依赖冲突（⚠️ 已绕过，不影响 chromadb/fastmcp）

安装 `chromadb` 和 `fastmcp` 后，与环境中既有的 streamlit / gradio / paddlepaddle / fastapi / msal / pyopenssl 产生版本冲突：

```
streamlit 1.43.1 requires protobuf<6,>=3.20, but you have protobuf 7.35.1
paddlepaddle 2.6.2 requires protobuf<=3.20.2,>=3.1.0 (Windows)
fastapi 0.115.11 requires starlette<0.47.0, but you have starlette 1.6.0
gradio 5.13.2 requires starlette<1.0 and websockets<15.0 (you have 17.0.1)
msal 1.31.1 requires cryptography<46 (you have 50.0.0)
pyopenssl 24.2.1 requires cryptography<44 (you have 50.0.0)
```

**结论**：这些冲突来自 streamlit/gradio/paddle 等旧包，`chromadb`（1.5.9）和 `fastmcp`（3.4.7）本身**导入与运行正常**，本功能不用 streamlit/gradio/paddle，因此不影响。若要彻底清理，需另行对齐这些旧包，不在本任务范围。

## 2. 默认 embedding 对中文偏弱（✅ 已解决：混合检索）

chromadb 默认 embedding 是 `all-MiniLM-L6-v2`（英文模型），对中文语义检索偏弱——"数据要素"这类精确词曾命中被"预期性/约束性"表格噪声干扰。

**解决**：在 `chroma_store.py` 实现**混合检索**——语义向量（余弦）+ 字符二元组 BM25 稀疏检索，用 RRF 融合。中文关键词（大模型/算力/数据要素）由 BM25 兜底，召回稳定。检索 <1s（826 块）。

## 3. Chroma 新 repo 默认分支是 `main`（✅ 已解决）

`git push origin master` 报 `src refspec master does not match any`——新仓库默认分支为 `main`。已改推 `main`，tag 与分支均指向同一 commit。

## 4. 需用户重启才能生效（📌 需用户操作）

- **MinIO v3.0**：宿主 `lib/index.js` 增加了「上传后调用 ingest.py 入库」，宿主改动需重启 dsh web。
- **DSH 集成**：新建 agent preset `standard-chroma`（`C:\Users\kimtse\.dsh\.agent-presets\standard-chroma\`），在 `agent.cordis.yml` 追加了 `dsh-mcp-client` 行（serverName=chroma，stdio 连 `server.py`）。需**新开会话并选择该 preset**（或重启后切换）才会出现 `mcp__chroma__search` 等工具。

## 5. DSH 组合文件的 `!!js` 标签（📌 说明）

agent preset 的 `agent.cordis.yml` 含 `!!js process.platform === 'win32'` 这类 DSH 自定义 YAML 标签，PyYAML 等标准解析器会报 `could not determine a constructor for the tag 'tag:yaml.org,2002:js'`。这是 DSH 方言，加载器能正常解析，非文件损坏；工具链校验时需用 DSH 的 `standingKeyFor` 而非标准 YAML 解析。

## 6. Chroma 入库数据不入库版本库（✅ 已处理）

`chroma_data/`（向量库）和测试用 `sample_*.pdf` 已加入 `.gitignore`，不入库。
