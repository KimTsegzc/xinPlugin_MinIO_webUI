window.__ModuleLoader__.load({
	id: 'xin-plugin-minio-webui',
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		let React = require('react');

		const inject = ['betterSidebar'];

		const CSS = `.kb-root{display:flex;flex-direction:column;height:100%;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base)}.kb-topbar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l1)}.kb-topbar-title{font-size:14px;font-weight:600}.kb-topbar-actions{display:flex;gap:6px}.kb-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer}.kb-iconbtn:hover{background:var(--dsw-alias-bg-layer-2)}.kb-body{flex:1;display:flex;min-height:0}.kb-tree{width:220px;flex:none;border-right:1px solid var(--dsw-alias-border-l1);padding:8px 6px;overflow:auto;background:var(--dsw-alias-bg-layer-1)}.kb-tree-title{font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary);padding:4px 8px;text-transform:uppercase;letter-spacing:.04em}.kb-node{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:7px;cursor:pointer;font-size:13px}.kb-node:hover{background:var(--dsw-alias-bg-layer-2)}.kb-node.sel{background:var(--dsw-alias-bg-layer-2);font-weight:500}.kb-explorer{flex:1;display:flex;flex-direction:column;min-width:0;background:var(--dsw-alias-bg-base)}.kb-toolbar{display:flex;align-items:center;gap:6px;padding:8px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);flex-wrap:wrap}.kb-breadcrumb{display:flex;align-items:center;gap:4px;font-size:13px;flex-wrap:wrap;min-width:0}.kb-crumb{color:var(--dsw-alias-label-secondary);cursor:pointer;padding:2px 4px;border-radius:5px}.kb-crumb:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}.kb-crumb-sep{color:var(--dsw-alias-label-secondary)}.kb-viewtoggle{display:flex;gap:2px;margin-left:auto}.kb-viewtoggle button{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;padding:5px 10px;border-radius:7px;font-size:12px}.kb-viewtoggle button.on{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}.kb-grid{flex:1;overflow:auto;padding:14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:12px;align-content:start}.kb-card{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border-radius:9px;cursor:pointer;text-align:center;border:1px solid transparent;font-size:12px;word-break:break-all}.kb-card:hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l1)}.kb-cardIcon{font-size:36px;line-height:1;color:var(--dsw-alias-brand-primary);display:flex;align-items:center;justify-content:center;height:44px}.kb-cardIcon.folder{color:var(--dsw-alias-state-warn-primary)}.kb-list{flex:1;overflow:auto}.kb-list table{width:100%;border-collapse:collapse;font-size:13px}.kb-list th{text-align:left;padding:8px 12px;border-bottom:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font-weight:600}.kb-list td{padding:8px 12px;border-bottom:1px solid var(--dsw-alias-border-l1)}.kb-list tr:hover{background:var(--dsw-alias-bg-layer-2)}.kb-empty{flex:1;display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary);font-size:13px;padding:24px}.kb-mask{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1100;pointer-events:auto}.kb-dialog{pointer-events:auto;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;box-shadow:0 16px 48px rgba(0,0,0,.35);width:min(460px,90vw);max-height:84vh;display:flex;flex-direction:column;overflow:hidden}.kb-dialog-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--dsw-alias-border-l1)}.kb-dialog-title{font-weight:600;font-size:14px}.kb-dialog-body{padding:14px 16px;display:flex;flex-direction:column;gap:12px}.kb-dialog-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--dsw-alias-border-l1)}.kb-field{display:flex;flex-direction:column;gap:5px}.kb-field-label{font-size:12px;color:var(--dsw-alias-label-secondary)}.kb-input{padding:7px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}.kb-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}.kb-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:13px}.kb-btn:hover{background:var(--dsw-alias-bg-layer-2)}.kb-btn-primary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}.kb-btn-primary:hover{filter:brightness(.92)}.kb-btn-danger{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-border-l2)}.kb-status{padding:6px 12px;font-size:12px;color:var(--dsw-alias-label-secondary)}.kb-footer-btn{display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:13px;text-align:left}.kb-footer-btn:hover{background:var(--dsw-alias-bg-layer-2)}.kb-footer-btn svg{flex:none}.kb-modal-pre{margin:0;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,Consolas,monospace;font-size:13px;padding:14px;background:var(--dsw-alias-bg-base);border-radius:8px;max-height:66vh;overflow:auto}.kb-modal-img{max-width:100%;max-height:70vh;display:block;margin:0 auto;border-radius:8px}.kb-modal-pdf{width:100%;height:70vh;border:none;background:var(--dsw-alias-bg-base);border-radius:8px}`;

		function bytesToBase64(bytes) {
			const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
			let out = '';
			let i = 0;
			const len = bytes.length;
			while (i + 3 <= len) {
				const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
				out += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + chars[(n >> 6) & 63] + chars[n & 63];
				i += 3;
			}
			const rem = len - i;
			if (rem === 1) { const n = bytes[i] << 16; out += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + '=='; }
			else if (rem === 2) { const n = (bytes[i] << 16) | (bytes[i + 1] << 8); out += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + chars[(n >> 6) & 63] + '='; }
			return out;
		}
		function formatSize(n) {
			n = Number(n) || 0;
			if (n < 1024) return n + ' B';
			if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
			return (n / 1024 / 1024).toFixed(2) + ' MB';
		}
		function formatTime(s) { if (!s) return ''; const d = new Date(s); if (isNaN(d.getTime())) return s; return d.toLocaleString(); }

		async function api(method, args) {
			const res = await fetch('/minio/api/' + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(args || {}) });
			return await res.json();
		}

		function apply(ctx) {
			const betterSidebar = ctx.get('betterSidebar');
			if (betterSidebar === undefined || typeof betterSidebar.registerTab !== 'function') return;

			if (typeof document !== 'undefined' && document.head && !document.getElementById('minio-kb-css')) {
				const tag = document.createElement('style');
				tag.id = 'minio-kb-css';
				tag.textContent = CSS;
				document.head.appendChild(tag);
			}

			const kbStore = {
				open: false,
				listeners: new Set(),
				toggle() { this.open = !this.open; this.listeners.forEach((l) => l()); },
				closePanel() { this.open = false; this.listeners.forEach((l) => l()); },
				subscribe(l) { this.listeners.add(l); return () => { this.listeners.delete(l); }; },
			};
			function useKbOpen() {
				const [open, setOpen] = React.useState(kbStore.open);
				React.useEffect(() => kbStore.subscribe(() => setOpen(kbStore.open)), []);
				return open;
			}

			const IconDatabase = React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
				React.createElement('ellipse', { cx: 12, cy: 5, rx: 9, ry: 3 }),
				React.createElement('path', { d: 'M21 5v14c0 1.66-4 3-9 3s-9-1.34-9-3V5' }),
				React.createElement('path', { d: 'M3 12c0 1.66 4 3 9 3s9-1.34 9-3' }));
			const IconGear = React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
				React.createElement('circle', { cx: 12, cy: 12, r: 3 }),
				React.createElement('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.089a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1' }));
			const IconPlus = React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }, React.createElement('path', { d: 'M12 5v14M5 12h14' }));
			const IconFolder = React.createElement('svg', { width: 40, height: 40, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }, React.createElement('path', { d: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }));
			const IconFile = React.createElement('svg', { width: 40, height: 40, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }, React.createElement('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }), React.createElement('path', { d: 'M14 2v6h6' }));
			const IconClose = React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }, React.createElement('path', { d: 'M18 6 6 18M6 6l12 12' }));

			function KbFooterButton() {
				return React.createElement('button', { className: 'kb-footer-btn', onClick: () => kbStore.toggle() }, IconDatabase, React.createElement('span', null, 'Knowledge Base'));
			}

			function PreviewModal({ item, bucket, onClose }) {
				const [content, setContent] = React.useState(null);
				React.useEffect(() => {
					const t = item.type;
					if (t === 'txt' || t === 'md' || t === 'csv' || t === 'json') {
						api('readText', { bucket, key: item.key }).then((r) => setContent(r && r.ok ? { kind: 'text', text: r.text } : { kind: 'err', msg: (r && r.error) || '加载失败' })).catch((e) => setContent({ kind: 'err', msg: String(e && e.message || e) }));
					} else if (t === 'png' || t === 'jpg' || t === 'jpeg' || t === 'gif') {
						api('download', { bucket, key: item.key }).then((r) => setContent(r && r.ok ? { kind: 'img', url: 'data:' + (r.contentType || 'image/png') + ';base64,' + r.base64 } : { kind: 'err', msg: (r && r.error) || '加载失败' })).catch((e) => setContent({ kind: 'err', msg: String(e && e.message || e) }));
					} else if (t === 'pdf') {
						api('download', { bucket, key: item.key }).then((r) => setContent(r && r.ok ? { kind: 'pdf', url: 'data:application/pdf;base64,' + r.base64 } : { kind: 'err', msg: (r && r.error) || '加载失败' })).catch((e) => setContent({ kind: 'err', msg: String(e && e.message || e) }));
					} else {
						setContent({ kind: 'err', msg: '暂不支持预览该类型' });
					}
				}, []);
				let body = null;
				if (!content) body = React.createElement('div', { className: 'kb-empty' }, '加载中…');
				else if (content.kind === 'text') body = React.createElement('pre', { className: 'kb-modal-pre' }, content.text);
				else if (content.kind === 'img') body = React.createElement('img', { className: 'kb-modal-img', src: content.url, alt: item.name });
				else if (content.kind === 'pdf') body = React.createElement('iframe', { className: 'kb-modal-pdf', src: content.url, title: item.name });
				else body = React.createElement('div', { className: 'kb-empty' }, content.msg);
				return React.createElement('div', { className: 'kb-mask', onClick: onClose },
					React.createElement('div', { className: 'kb-dialog', style: { width: 'min(760px,90vw)' }, onClick: (e) => e.stopPropagation() },
						React.createElement('div', { className: 'kb-dialog-head' },
							React.createElement('span', { className: 'kb-dialog-title' }, item.name),
							React.createElement('button', { className: 'kb-iconbtn', onClick: onClose, 'aria-label': '关闭' }, IconClose)),
						React.createElement('div', { className: 'kb-dialog-body' }, body)));
			}

			function ConfigDialog({ state, onClose, onSaved }) {
				const [form, setForm] = React.useState({ endpoint: state.endpoint, accessKey: state.accessKey, secretKey: state.secretKey, region: state.region, ssl: !!state.ssl });
				const [status, setStatus] = React.useState('');
				const set = (k, v) => setForm((p) => { const n = {}; for (const key in p) n[key] = p[key]; n[k] = v; return n; });
				const field = (label, key, secret) => React.createElement('label', { className: 'kb-field', key },
					React.createElement('span', { className: 'kb-field-label' }, label),
					React.createElement('input', { className: 'kb-input', type: secret ? 'password' : 'text', value: form[key], onChange: (e) => set(key, e.target.value), autoComplete: 'off', spellCheck: false }));
				const test = () => { setStatus('测试中…'); api('testConnection', { config: form }).then((r) => setStatus(r && r.ok ? '连接成功' : ('连接失败：' + ((r && r.error) || '')))).catch((e) => setStatus('连接失败：' + String(e && e.message || e))); };
				const save = () => { setStatus('保存中…'); api('saveConfig', { config: form }).then((r) => { if (r && r.ok) { setStatus('已保存'); if (onSaved) onSaved(); } else setStatus('保存失败：' + ((r && r.error) || '')); }).catch((e) => setStatus('保存失败：' + String(e && e.message || e))); };
				return React.createElement('div', { className: 'kb-mask', onClick: onClose },
					React.createElement('div', { className: 'kb-dialog', onClick: (e) => e.stopPropagation() },
						React.createElement('div', { className: 'kb-dialog-head' }, React.createElement('span', { className: 'kb-dialog-title' }, 'MinIO 配置'), React.createElement('button', { className: 'kb-iconbtn', onClick: onClose }, IconClose)),
						React.createElement('div', { className: 'kb-dialog-body' },
							field('Endpoint', 'endpoint', false), field('AccessKey', 'accessKey', false), field('SecretKey', 'secretKey', true), field('Region', 'region', false),
							React.createElement('label', { className: 'kb-field' }, React.createElement('span', { className: 'kb-field-label' }, 'SSL'), React.createElement('input', { type: 'checkbox', checked: form.ssl, onChange: (e) => set('ssl', e.target.checked) })),
							status ? React.createElement('div', { className: 'kb-status' }, status) : null),
						React.createElement('div', { className: 'kb-dialog-foot' }, React.createElement('button', { className: 'kb-btn', onClick: test }, '测试连接'), React.createElement('button', { className: 'kb-btn kb-btn-primary', onClick: save }, '保存'), React.createElement('button', { className: 'kb-btn', onClick: onClose }, '关闭'))));
			}

			function AddBucketDialog({ onClose, onAdded }) {
				const [buckets, setBuckets] = React.useState(null);
				const [status, setStatus] = React.useState('');
				React.useEffect(() => {
					setStatus('拉取 MinIO Bucket 列表…');
					api('testConnection', {}).then((r) => {
						if (r && r.ok) { setBuckets(r.allBuckets || []); setStatus(''); }
						else setStatus((r && r.error) || '获取列表失败');
					}).catch((e) => setStatus('获取列表失败：' + String(e && e.message || e)));
				}, []);
				const add = (name) => {
					setStatus('添加中…');
					api('addBucket', { name }).then((r2) => {
						if (r2 && r2.ok) { if (onAdded) onAdded(); onClose(); }
						else setStatus((r2 && r2.error) || '添加失败');
					}).catch((e) => setStatus('添加失败：' + String(e && e.message || e)));
				};
				let list;
				if (buckets === null) list = React.createElement('div', { className: 'kb-status', style: { padding: '8px' } }, status);
				else if (!buckets.length) list = React.createElement('div', { className: 'kb-status', style: { padding: '8px' } }, 'MinIO 中暂无 Bucket');
				else list = buckets.map((b) => React.createElement('div', { key: b, className: 'kb-node', onClick: () => add(b) },
					React.createElement('span', { style: { color: 'var(--dsw-alias-state-warn-primary)' } }, IconFolder),
					React.createElement('span', null, b)));
				return React.createElement('div', { className: 'kb-mask', onClick: onClose },
					React.createElement('div', { className: 'kb-dialog', onClick: (e) => e.stopPropagation() },
						React.createElement('div', { className: 'kb-dialog-head' }, React.createElement('span', { className: 'kb-dialog-title' }, '添加 Bucket（点击选择）'), React.createElement('button', { className: 'kb-iconbtn', onClick: onClose }, IconClose)),
						React.createElement('div', { className: 'kb-dialog-body', style: { maxHeight: '48vh', overflow: 'auto' } },
							React.createElement('div', { className: 'kb-tree-title' }, '可用 Bucket'),
							list,
							status ? React.createElement('div', { className: 'kb-status' }, status) : null)));
			}

			function KnowledgeBasePanel() {
				const [state, setState] = React.useState(null);
				const [sel, setSel] = React.useState(null);
				const [prefix, setPrefix] = React.useState('');
				const [view, setView] = React.useState('icon');
				const [list, setList] = React.useState(null);
				const [listErr, setListErr] = React.useState('');
				const [configOpen, setConfigOpen] = React.useState(false);
				const [addOpen, setAddOpen] = React.useState(false);
				const [preview, setPreview] = React.useState(null);

				const loadState = () => api('getState', {}).then((r) => { if (r && r.ok) setState(r.state); else setListErr((r && r.error) || '加载失败'); }).catch((e) => setListErr(String(e && e.message || e)));
				React.useEffect(() => { loadState(); }, []);

				React.useEffect(() => {
					if (!sel) { setList(null); return; }
					setListErr('');
					api('listObjects', { bucket: sel.name, prefix }).then((r) => {
						if (r && r.ok) setList({ folders: r.folders || [], files: r.files || [] });
						else setListErr((r && r.error) || '加载失败');
					}).catch((e) => setListErr(String(e && e.message || e)));
				}, [sel && sel.name, prefix]);

				const crumbs = [];
				if (sel) {
					const parts = prefix ? prefix.split('/').filter(Boolean) : [];
					let acc = '';
					crumbs.push({ label: sel.name, prefix: '' });
					for (let i = 0; i < parts.length; i++) { acc += parts[i] + '/'; crumbs.push({ label: parts[i], prefix: acc }); }
				}

				const openFile = (item) => {
					if (item.isFolder) { setPrefix(item.key || (prefix ? prefix + item.name + '/' : item.name + '/')); return; }
					setPreview(item);
				};

				const header = React.createElement('div', { className: 'kb-topbar' },
					React.createElement('span', { className: 'kb-topbar-title' }, 'Knowledge Base 知识库'),
					React.createElement('div', { className: 'kb-topbar-actions' },
						React.createElement('button', { className: 'kb-iconbtn', onClick: () => setConfigOpen(true), title: '加MinIO配置' }, IconGear),
						React.createElement('button', { className: 'kb-iconbtn', onClick: () => setAddOpen(true), title: '加Bucket' }, IconPlus),
						React.createElement('button', { className: 'kb-iconbtn', onClick: () => kbStore.closePanel(), title: '关闭' }, IconClose)));

				const tree = React.createElement('div', { className: 'kb-tree' },
					React.createElement('div', { className: 'kb-tree-title' }, 'Buckets'),
					(state && state.buckets && state.buckets.length) ? state.buckets.map((b) => React.createElement('div', { key: b.id, className: 'kb-node' + (sel && sel.id === b.id ? ' sel' : ''), onClick: () => { setSel(b); setPrefix(''); }, onContextMenu: (e) => { e.preventDefault(); if (window.confirm('移除对该 Bucket 的本地绑定？')) api('removeBucket', { id: b.id }).then(() => { loadState(); if (sel && sel.id === b.id) setSel(null); }); } },
						React.createElement('span', { style: { color: 'var(--dsw-alias-state-warn-primary)' } }, IconFolder),
						React.createElement('span', null, b.name)))
						: React.createElement('div', { className: 'kb-status', style: { padding: '8px' } }, '尚未添加 Bucket，点右上角 ➕ '));

				let explorer;
				if (!sel) {
					explorer = React.createElement('div', { className: 'kb-empty' }, '选择左侧 Bucket 开始浏览');
				} else {
					const toolbar = React.createElement('div', { className: 'kb-toolbar' },
						React.createElement('div', { className: 'kb-breadcrumb' },
							React.createElement('span', { className: 'kb-crumb', onClick: () => setPrefix('') }, 'Knowledge Base'),
							crumbs.map((c, i) => React.createElement(React.Fragment, { key: i },
								React.createElement('span', { className: 'kb-crumb-sep' }, ' / '),
								React.createElement('span', { className: 'kb-crumb', onClick: () => setPrefix(c.prefix) }, c.label)))),
						React.createElement('div', { className: 'kb-viewtoggle' },
							React.createElement('button', { className: view === 'icon' ? 'on' : '', onClick: () => setView('icon') }, '图标'),
							React.createElement('button', { className: view === 'list' ? 'on' : '', onClick: () => setView('list') }, '列表')));
					if (listErr) explorer = React.createElement('div', { className: 'kb-empty' }, '加载失败：' + listErr);
					else if (!list) explorer = React.createElement('div', { className: 'kb-empty' }, '加载中…');
					else {
						const folders = list.folders.map((k) => ({ isFolder: true, key: k, name: k.split('/').filter(Boolean).pop(), type: 'folder' }));
						const files = list.files;
						const all = folders.concat(files);
						if (!all.length) explorer = React.createElement('div', { className: 'kb-empty' }, '空目录');
						else if (view === 'icon') {
							explorer = React.createElement('div', { className: 'kb-grid' }, all.map((item) => React.createElement('div', { key: item.isFolder ? item.key : 'f:' + item.key, className: 'kb-card', onClick: () => openFile(item) },
								React.createElement('div', { className: 'kb-cardIcon' + (item.isFolder ? ' folder' : '') }, item.isFolder ? IconFolder : IconFile),
								React.createElement('span', null, item.name))));
						} else {
							explorer = React.createElement('div', { className: 'kb-list' }, React.createElement('table', null,
								React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', null, '名称'), React.createElement('th', null, '类型'), React.createElement('th', null, '大小'), React.createElement('th', null, '修改时间'))),
								React.createElement('tbody', null, all.map((item) => React.createElement('tr', { key: item.isFolder ? item.key : 'f:' + item.key, onClick: () => openFile(item), style: { cursor: 'pointer' } },
									React.createElement('td', null, item.name), React.createElement('td', null, item.isFolder ? '文件夹' : (item.type || '-')), React.createElement('td', null, item.isFolder ? '-' : formatSize(item.size)), React.createElement('td', null, formatTime(item.lastModified)))))));
						}
					}
					explorer = React.createElement('div', { className: 'kb-explorer' }, toolbar, explorer);
				}

				return React.createElement('div', { className: 'kb-root' },
					header,
					React.createElement('div', { className: 'kb-body' }, tree, explorer),
					configOpen && state ? React.createElement(ConfigDialog, { state, onClose: () => setConfigOpen(false), onSaved: loadState }) : null,
					addOpen ? React.createElement(AddBucketDialog, { onClose: () => setAddOpen(false), onAdded: loadState }) : null,
					preview && sel ? React.createElement(PreviewModal, { item: preview, bucket: sel.name, onClose: () => setPreview(null) }) : null);
			}

			function KbOverlay() {
				const open = useKbOpen();
				if (!open) return null;
				return React.createElement('div', { className: 'kb-mask', onClick: () => kbStore.closePanel() },
					React.createElement('div', { className: 'kb-dialog', style: { width: 'min(1080px,94vw)', height: '82vh' }, onClick: (e) => e.stopPropagation() },
						React.createElement('div', { className: 'kb-dialog-body', style: { padding: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } },
							React.createElement(KnowledgeBasePanel, null))));
			}

			ctx.effect(() => betterSidebar.registerTab({
				id: 'minio-kb:kb',
				title: () => 'Knowledge Base',
				icon: IconDatabase,
				order: 45,
				single: true,
				component: () => React.createElement(KnowledgeBasePanel),
			}));
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
