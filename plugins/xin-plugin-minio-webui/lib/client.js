window.__ModuleLoader__.load({
	id: 'xin-plugin-minio-webui',
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		let React = require('react');
		let ReactDOM = require('react-dom');

		const MAX_FILES = 20;
		const MAX_SIZE_BYTES = 20 * 1024 * 1024;

		const inject = ['betterSidebar'];

		const CSS = `.kb-root{display:flex;flex-direction:column;height:100%;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base)}.kb-topbar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l1)}.kb-topbar-title{font-size:14px;font-weight:600}.kb-topbar-actions{display:flex;gap:6px}.kb-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer}.kb-iconbtn:hover{background:var(--dsw-alias-bg-layer-2)}.kb-body{flex:1;display:flex;min-height:0}.kb-tree{width:220px;flex:none;border-right:1px solid var(--dsw-alias-border-l1);padding:8px 6px;overflow:auto;background:var(--dsw-alias-bg-layer-1)}.kb-tree-title{font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary);padding:4px 8px;text-transform:uppercase;letter-spacing:.04em}.kb-node{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:7px;cursor:pointer;font-size:13px}.kb-node:hover{background:var(--dsw-alias-bg-layer-2)}.kb-node.sel{background:var(--dsw-alias-bg-layer-2);font-weight:500}.kb-explorer{flex:1;display:flex;flex-direction:column;min-width:0;background:var(--dsw-alias-bg-base)}.kb-toolbar{display:flex;align-items:center;gap:6px;padding:8px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);flex-wrap:wrap}.kb-breadcrumb{display:flex;align-items:center;gap:4px;font-size:13px;flex-wrap:wrap;min-width:0}.kb-crumb{color:var(--dsw-alias-label-secondary);cursor:pointer;padding:2px 4px;border-radius:5px}.kb-crumb:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}.kb-crumb-sep{color:var(--dsw-alias-label-secondary)}.kb-viewtoggle{display:flex;gap:2px;margin-left:auto}.kb-viewtoggle button{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;padding:5px 10px;border-radius:7px;font-size:12px}.kb-viewtoggle button.on{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}.kb-grid{flex:1;overflow:auto;padding:14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:12px;align-content:start}.kb-card{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border-radius:9px;cursor:pointer;text-align:center;border:1px solid transparent;font-size:12px;word-break:break-all}.kb-card:hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l1)}.kb-cardIcon{font-size:36px;line-height:1;color:var(--dsw-alias-brand-primary);display:flex;align-items:center;justify-content:center;height:44px}.kb-cardIcon.folder{color:var(--dsw-alias-state-warn-primary)}.kb-list{flex:1;overflow:auto}.kb-list table{width:100%;border-collapse:collapse;font-size:13px}.kb-list th{text-align:left;padding:8px 12px;border-bottom:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font-weight:600}.kb-list td{padding:8px 12px;border-bottom:1px solid var(--dsw-alias-border-l1)}.kb-list tr:hover{background:var(--dsw-alias-bg-layer-2)}.kb-empty{flex:1;display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary);font-size:13px;padding:24px}.kb-mask{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1100;pointer-events:auto}.kb-dialog{pointer-events:auto;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;box-shadow:0 16px 48px rgba(0,0,0,.35);width:min(460px,90vw);max-height:84vh;display:flex;flex-direction:column;overflow:hidden}.kb-dialog-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--dsw-alias-border-l1)}.kb-dialog-title{font-weight:600;font-size:14px}.kb-dialog-body{padding:14px 16px;display:flex;flex-direction:column;gap:12px;flex:1;min-height:0;overflow-y:auto}.kb-dialog-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--dsw-alias-border-l1)}.kb-field{display:flex;flex-direction:column;gap:5px}.kb-field-label{font-size:12px;color:var(--dsw-alias-label-secondary)}.kb-input{padding:7px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}.kb-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}.kb-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:13px}.kb-btn:hover{background:var(--dsw-alias-bg-layer-2)}.kb-btn-primary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}.kb-btn-primary:hover{filter:brightness(.92)}.kb-btn-danger{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-border-l2)}.kb-status{padding:6px 12px;font-size:12px;color:var(--dsw-alias-label-secondary)}.kb-footer-btn{display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:13px;text-align:left}.kb-footer-btn:hover{background:var(--dsw-alias-bg-layer-2)}.kb-footer-btn svg{flex:none}.kb-modal-pre{margin:0;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,Consolas,monospace;font-size:13px;padding:14px;background:var(--dsw-alias-bg-base);border-radius:8px;max-height:66vh;overflow:auto}.kb-modal-img{max-width:100%;max-height:70vh;display:block;margin:0 auto;border-radius:8px}.kb-modal-pdf{width:100%;height:70vh;border:none;background:var(--dsw-alias-bg-base);border-radius:8px}.kb-tabs{display:flex;gap:4px;border-bottom:1px solid var(--dsw-alias-border-l1);margin-bottom:4px}.kb-tab{flex:1;padding:9px 10px;border:none;border-bottom:2px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:13px;font-weight:500;text-align:center}.kb-tab:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}.kb-tab.on{color:var(--dsw-alias-brand-primary);border-bottom-color:var(--dsw-alias-brand-primary);font-weight:600}.kb-config-page{display:flex;flex-direction:column;gap:12px}.kb-test-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.kb-test-row .kb-status{margin:0}.kb-list table{table-layout:fixed;width:100%;min-width:600px}.kb-list th,.kb-list td{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kb-list th:nth-child(1),.kb-list td:nth-child(1){width:30%}.kb-list th:nth-child(2),.kb-list td:nth-child(2){width:8%}.kb-list th:nth-child(3),.kb-list td:nth-child(3){width:9%}.kb-list th:nth-child(4),.kb-list td:nth-child(4){width:15%}.kb-list th:nth-child(5),.kb-list td:nth-child(5){width:24%}.kb-list th:nth-child(6),.kb-list td:nth-child(6){width:8%}.kb-ing{font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:18em}.kb-namecell{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}`;

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
		function nameParts(name) {
			const s = String(name);
			const dot = s.lastIndexOf('.');
			const hasExt = dot > 0 && s.length - dot <= 8;
			if (!hasExt) return { base: s, ext: '' };
			return { base: s.slice(0, dot), ext: s.slice(dot) };
		}

		async function api(method, args, signal) {
			const res = await fetch('/minio/api/' + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(args || {}), signal });
			const text = await res.text();
			if (!text) return { ok: false, error: 'empty response (http ' + res.status + ')' };
			try { return JSON.parse(text); }
			catch (e) { return { ok: false, error: 'bad response: ' + text.slice(0, 200) }; }
		}
		// base64 → Blob object URL（避免大文件 data URL 超出 iframe/img 大小限制而空白）。
		function b64ToObjectUrl(base64, mime) {
			try {
				const bin = atob(base64);
				const bytes = new Uint8Array(bin.length);
				for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
				return URL.createObjectURL(new Blob([bytes], { type: mime || 'application/octet-stream' }));
			} catch (e) { return 'data:' + (mime || 'application/octet-stream') + ';base64,' + base64; }
		}

		function apply(ctx) {
			const betterSidebar = ctx.get('betterSidebar');
			if (betterSidebar === undefined || typeof betterSidebar.registerTab !== 'function') return;

			if (typeof document !== 'undefined' && document.head && !document.getElementById('minio-kb-css')) {
				const tag = document.createElement('style');
				tag.id = 'minio-kb-css';
				tag.textContent = CSS + '.kb-tree{width:150px}.kb-menu-wrap{position:relative;display:inline-block}.kb-menu{position:absolute;right:0;top:calc(100% + 4px);background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.25);min-width:120px;z-index:50;overflow:hidden}.kb-menu-item{display:block;width:100%;text-align:left;padding:8px 12px;border:none;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font-size:13px}.kb-menu-item:hover{background:var(--dsw-alias-bg-layer-2)}.kb-menu-danger{color:var(--dsw-alias-state-error-primary)}.kb-toolbar-actions{display:flex;align-items:center;gap:6px}.kb-mini{padding:3px 8px;border-radius:6px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font-size:12px;line-height:1.2}.kb-mini:hover{background:var(--dsw-alias-bg-layer-2)}.kb-mini-danger{color:var(--dsw-alias-state-error-primary)}.kb-card-actions{display:flex;gap:4px;margin-top:4px;justify-content:center}.kb-actions{display:inline-flex;gap:6px}.kb-notice{padding:6px 12px;font-size:12px;color:var(--dsw-alias-label-secondary)}.kb-card{position:relative;padding-top:32px}.kb-card-corner{position:absolute;top:6px;right:6px;z-index:5}.kb-corner-btn{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border-radius:6px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}.kb-corner-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}.kb-menu-fixed{position:fixed;z-index:1000;transform:translateX(-100%);background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.25);min-width:120px;overflow:hidden}.kb-explorer{position:relative}.kb-drop-overlay{position:absolute;inset:0;z-index:90;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:var(--dsw-alias-bg-overlay);border:2px dashed var(--dsw-alias-brand-primary);border-radius:10px;padding:24px;text-align:center;pointer-events:none}.kb-drop-icon{width:52px;height:52px;color:var(--dsw-alias-brand-primary);display:flex;align-items:center;justify-content:center}.kb-drop-icon svg{width:52px;height:52px}.kb-drop-title{font-size:16px;font-weight:600;color:var(--dsw-alias-label-primary)}.kb-drop-sub{font-size:12px;color:var(--dsw-alias-label-secondary)}.kb-drop-limit{font-size:12px;color:var(--dsw-alias-state-warn-primary)}.kb-card-name{display:flex;align-items:baseline;justify-content:center;width:100%;min-width:0;font-size:12px;word-break:keep-all}.kb-card-base{flex:0 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kb-card-ext{flex:none;white-space:nowrap}.kb-list td{white-space:nowrap}.kb-list table{table-layout:fixed}.kb-namecell{display:flex;align-items:center;gap:6px;min-width:0;width:100%}.kb-list .kb-card-name{justify-content:flex-start;flex:1;min-width:0;width:auto}.kb-modal-pre{max-height:70vh;overflow:auto}.kb-modal-csv{overflow:auto;max-height:70vh}.kb-modal-csv table{width:100%;border-collapse:collapse;font-size:12px}.kb-modal-csv th,.kb-modal-csv td{border:1px solid var(--dsw-alias-border-l2);padding:6px 8px;text-align:left;white-space:nowrap}.kb-modal-csv th{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-weight:600}.kb-modal-csv td{color:var(--dsw-alias-label-primary)}.kb-sort{display:flex;gap:4px;align-items:center}.kb-detail-bar{display:flex;flex-wrap:wrap;gap:12px;padding:10px 18px;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:12px;color:var(--dsw-alias-label-secondary)}.kb-search{min-width:120px;flex:0 1 auto;padding:5px 10px;border-radius:6px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;outline:none}.kb-bulk{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--dsw-alias-bg-layer-1);border-bottom:1px solid var(--dsw-alias-border-l1);font-size:12px;color:var(--dsw-alias-label-secondary)}.kb-check{position:absolute;top:6px;left:6px;width:18px;height:18px;border:1px solid var(--dsw-alias-border-l2);border-radius:4px;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-brand-primary);font-size:12px;z-index:4}.kb-card.sel{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-brand-primary)}.kb-rowcheck{display:inline-block;width:16px;margin-right:4px;color:var(--dsw-alias-brand-primary);font-weight:700}.kb-list tr.sel td{background:var(--dsw-alias-bg-layer-2)}.kb-uploading{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--dsw-alias-label-secondary)}.kb-progress{width:120px;height:6px;border-radius:3px;background:var(--dsw-alias-bg-layer-2);overflow:hidden}.kb-progress-fill{height:100%;background:var(--dsw-alias-brand-primary);transition:width .15s}.kb-menu-status{display:block;padding:8px 12px;font-size:12px;color:var(--dsw-alias-label-secondary);border-bottom:1px solid var(--dsw-alias-border-l1);white-space:nowrap;max-width:240px;overflow:hidden;text-overflow:ellipsis;cursor:default}.kb-section{margin:14px 0 6px;padding-bottom:6px;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}.kb-rag-check{margin-top:8px;padding:8px 10px;background:var(--dsw-alias-bg-layer-1);border-radius:8px;font-size:12px}.kb-rag-item{padding:2px 0;color:var(--dsw-alias-label-secondary)}.kb-rag-item.ok{color:#2f9e63}.kb-rag-item.bad{color:var(--dsw-alias-state-error-primary)}';
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
			const IconUpload = React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M12 16V4M6 10l6-6 6 6' }), React.createElement('path', { d: 'M4 20h16' }));
			const IconMore = React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }, React.createElement('circle', { cx: 12, cy: 5, r: 1.2 }), React.createElement('circle', { cx: 12, cy: 12, r: 1.2 }), React.createElement('circle', { cx: 12, cy: 19, r: 1.2 }));

			function fileCategory(ext) {
				const e = String(ext || '').toLowerCase();
				if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'].indexOf(e) !== -1) return 'image';
				if (e === 'pdf') return 'pdf';
				if (['doc', 'docx'].indexOf(e) !== -1) return 'word';
				if (['xls', 'xlsx', 'csv', 'tsv'].indexOf(e) !== -1) return 'excel';
				if (['ppt', 'pptx'].indexOf(e) !== -1) return 'ppt';
				if (['js', 'mjs', 'ts', 'tsx', 'jsx', 'py', 'go', 'java', 'c', 'cpp', 'h', 'cs', 'rs', 'rb', 'php', 'swift', 'kt', 'scala', 'sh', 'ps1', 'bat', 'sql', 'graphql', 'html', 'htm', 'css', 'scss', 'less'].indexOf(e) !== -1) return 'code';
				if (['txt', 'md', 'markdown', 'log', 'yaml', 'yml', 'xml', 'json', 'toml', 'ini', 'conf', 'env', 'cfg'].indexOf(e) !== -1) return 'text';
				if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz', 'iso'].indexOf(e) !== -1) return 'archive';
				if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].indexOf(e) !== -1) return 'audio';
				if (['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv'].indexOf(e) !== -1) return 'video';
				return 'unknown';
			}
			function mkTypeIcon(cat) {
				const c = { image: '#2aa198', pdf: '#d64545', word: '#2b7cd3', excel: '#2f9e63', ppt: '#e0802f', code: '#8250df', text: '#7a828e', archive: '#a1774b', audio: '#b05fd0', video: '#e0506a', unknown: '#7a828e' }[cat] || '#7a828e';
				const P = (d) => React.createElement('path', { d });
				const R = (x, y, w, h, rx) => React.createElement('rect', { x, y, width: w, height: h, rx: rx || 0 });
				const C = (cx, cy, r) => React.createElement('circle', { cx, cy, r });
				const attrs = { width: 40, height: 40, viewBox: '0 0 24 24', fill: 'none', stroke: c, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
				let kids;
				if (cat === 'image') kids = [R(3, 5, 18, 14, 2), C(8.5, 9.5, 1.3), P('M6 17l4-4 3 3 3-4 3 3')];
				else if (cat === 'excel') kids = [R(4, 4, 16, 16, 2), P('M4 9h16M4 14h16M4 19h16M9 4v16')];
				else if (cat === 'archive') kids = [P('M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z'), P('M4 8l2-4h12l2 4'), P('M10 12h4')];
				else if (cat === 'audio') kids = [C(10, 17, 1.6), P('M11.6 17V7l5-1')];
				else if (cat === 'video') kids = [R(3, 5, 18, 14, 2), React.createElement('polygon', { points: '10,9 15,12 10,15', fill: c })];
				else if (cat === 'code') kids = [P('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'), P('M14 2v6h6'), P('M9.5 11l-2 2 2 2M14.5 11l2 2-2 2')];
				else if (cat === 'text') kids = [P('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'), P('M14 2v6h6'), P('M9 13h6M9 16h4')];
				else kids = [P('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'), P('M14 2v6h6')];
				return React.createElement('svg', attrs, kids);
			}
			function fileIcon(item) {
				return mkTypeIcon(fileCategory((item && item.type) || (item && item.name)));
			}

			function KbFooterButton() {
				return React.createElement('button', { className: 'kb-footer-btn', onClick: () => kbStore.toggle() }, IconDatabase, React.createElement('span', null, 'Knowledge Base'));
			}

			function PreviewModal({ item, bucket, onClose }) {
				const [content, setContent] = React.useState(null);
				const urlRef = React.useRef(null);
				const setMediaContent = (kind, base64, mime) => {
					const url = b64ToObjectUrl(base64, mime);
					if (urlRef.current) URL.revokeObjectURL(urlRef.current);
					urlRef.current = url;
					setContent({ kind, url });
				};
				React.useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);
				const csvSplit = (l) => { const o = []; let c = ''; let q = false; for (let i = 0; i < l.length; i++) { const ch = l[i]; if (ch === '"') q = !q; else if (ch === ',' && !q) { o.push(c); c = ''; } else c += ch; } o.push(c); return o; };
				React.useEffect(() => {
					const t = item.type;
					const textLike = ['txt', 'md', 'markdown', 'csv', 'json', 'yaml', 'yml', 'xml', 'log', 'toml', 'ini', 'conf', 'env', 'cfg', 'js', 'mjs', 'ts', 'tsx', 'jsx', 'py', 'go', 'java', 'c', 'cpp', 'h', 'cs', 'rs', 'rb', 'php', 'swift', 'kt', 'scala', 'sh', 'ps1', 'bat', 'sql', 'graphql', 'html', 'htm', 'css', 'scss', 'less'].indexOf(t) !== -1;
					const imgLike = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'].indexOf(t) !== -1;
					if (textLike) {
						api('readText', { bucket, key: item.key }).then((r) => {
							if (!r || !r.ok) { setContent({ kind: 'err', msg: (r && r.error) || '加载失败' }); return; }
							if (t === 'json') { try { setContent({ kind: 'json', text: JSON.stringify(JSON.parse(r.text), null, 2) }); } catch (e) { setContent({ kind: 'text', text: r.text }); } }
							else if (t === 'csv') { const lines = String(r.text).split(/\r?\n/).filter((x) => x.trim() !== ''); setContent({ kind: 'csv', head: lines.length ? csvSplit(lines[0]) : [], rows: lines.slice(1).map(csvSplit) }); }
							else setContent({ kind: 'text', text: r.text });
						}).catch((e) => setContent({ kind: 'err', msg: String(e && e.message || e) }));
					} else if (imgLike) {
						api('download', { bucket, key: item.key }).then((r) => r && r.ok ? setMediaContent('img', r.base64, r.contentType || 'image/png') : setContent({ kind: 'err', msg: (r && r.error) || '加载失败' })).catch((e) => setContent({ kind: 'err', msg: String(e && e.message || e) }));
					} else if (t === 'pdf') {
						api('download', { bucket, key: item.key }).then((r) => r && r.ok ? setMediaContent('pdf', r.base64, 'application/pdf') : setContent({ kind: 'err', msg: (r && r.error) || '加载失败' })).catch((e) => setContent({ kind: 'err', msg: String(e && e.message || e) }));
					} else {
						setContent({ kind: 'binary' });
					}
				}, []);
				const downloadFile = () => { api('download', { bucket, key: item.key }).then((r) => { if (r && r.ok) { const u = b64ToObjectUrl(r.base64, r.contentType || 'application/octet-stream'); triggerDownload(u, r.name || item.name); setTimeout(() => { try { URL.revokeObjectURL(u); } catch (e) {} }, 30000); } }).catch(() => {}); };
				let body = null;
				if (!content) body = React.createElement('div', { className: 'kb-empty' }, '加载中…');
				else if (content.kind === 'json') body = React.createElement('pre', { className: 'kb-modal-pre' }, content.text);
				else if (content.kind === 'text') body = React.createElement('pre', { className: 'kb-modal-pre' }, content.text);
				else if (content.kind === 'csv') body = React.createElement('div', { className: 'kb-modal-csv' }, React.createElement('table', null,
					content.head.length ? React.createElement('thead', null, React.createElement('tr', null, content.head.map((h, i) => React.createElement('th', { key: i }, h)))) : null,
					React.createElement('tbody', null, content.rows.map((row, ri) => React.createElement('tr', { key: ri }, row.map((c, ci) => React.createElement('td', { key: ci }, c)))))));
				else if (content.kind === 'img') body = React.createElement('img', { className: 'kb-modal-img', src: content.url, alt: item.name });
				else if (content.kind === 'pdf') body = React.createElement('iframe', { className: 'kb-modal-pdf', src: content.url, title: item.name });
				else if (content.kind === 'binary') body = React.createElement('div', { className: 'kb-empty' },
					React.createElement('div', null, '该类型暂不支持在线预览，可直接下载查看。'),
					React.createElement('button', { className: 'kb-btn', onClick: downloadFile, style: { marginTop: 12 } }, '下载查看'));
				else body = React.createElement('div', { className: 'kb-empty' }, content.msg);
				return React.createElement('div', { className: 'kb-mask', onClick: onClose },
					React.createElement('div', { className: 'kb-dialog', style: { width: 'min(760px,90vw)' }, onClick: (e) => e.stopPropagation() },
						React.createElement('div', { className: 'kb-dialog-head' },
							React.createElement('span', { className: 'kb-dialog-title' }, item.name),
							React.createElement('button', { className: 'kb-iconbtn', onClick: onClose, 'aria-label': '关闭' }, IconClose)),
						React.createElement('div', { className: 'kb-detail-bar' },
							React.createElement('span', null, '类型：' + (item.type || '未知')),
							React.createElement('span', null, '大小：' + formatSize(item.size)),
							React.createElement('span', null, '修改：' + formatTime(item.lastModified))),
						React.createElement('div', { className: 'kb-dialog-body' }, body)));
			}

			function ConfigDialog({ state, onClose, onSaved }) {
				const [form, setForm] = React.useState({ endpoint: state.endpoint, accessKey: state.accessKey, secretKey: state.secretKey, region: state.region, ssl: !!state.ssl, ragEnabled: state.ragEnabled !== false, chromaPython: state.chromaPython || 'python', chromaIngestScript: state.chromaIngestScript || '', ragMcpUrl: state.ragMcpUrl || '', ragServerName: state.ragServerName || 'chroma' });
				const [status, setStatus] = React.useState('');
				const [saveMsg, setSaveMsg] = React.useState('');
				const [ragResult, setRagResult] = React.useState(null);
				const [tab, setTab] = React.useState('minio');
				const set = (k, v) => setForm((p) => { const n = {}; for (const key in p) n[key] = p[key]; n[k] = v; return n; });
				const field = (label, key, secret, ph) => React.createElement('label', { className: 'kb-field', key },
					React.createElement('span', { className: 'kb-field-label' }, label),
					React.createElement('input', { className: 'kb-input', type: secret ? 'password' : 'text', value: form[key] === undefined ? '' : String(form[key]), placeholder: ph || '', onChange: (e) => set(key, e.target.value), autoComplete: 'off', spellCheck: false }));
				const test = () => { setStatus('测试中…'); api('testConnection', { config: form }).then((r) => setStatus(r && r.ok ? '连接成功' : ('连接失败：' + ((r && r.error) || '')))).catch((e) => setStatus('连接失败：' + String(e && e.message || e))); };
				const testRag = () => { setRagResult(null); api('testRag', { config: form }).then((r) => setRagResult(r)).catch((e) => setRagResult({ error: String(e && e.message || e) })); };
				const save = () => { setSaveMsg('保存中…'); api('saveConfig', { config: form }).then((r) => { if (r && r.ok) { setSaveMsg('已保存'); if (onSaved) onSaved(); } else setSaveMsg('保存失败：' + ((r && r.error) || '')); }).catch((e) => setSaveMsg('保存失败：' + String(e && e.message || e))); };
				const ragChecks = ragResult && ragResult.checks ? ragResult.checks.map((c, i) => React.createElement('div', { key: i, className: 'kb-rag-item ' + (c.ok ? 'ok' : 'bad') }, (c.ok ? '✅ ' : '⚠️ ') + c.name + '：' + c.msg)) : null;
				const tabBtn = (id, label) => React.createElement('button', { key: id, type: 'button', className: 'kb-tab' + (tab === id ? ' on' : ''), onClick: () => setTab(id) }, label);
				return React.createElement('div', { className: 'kb-mask', onClick: onClose },
					React.createElement('div', { className: 'kb-dialog', onClick: (e) => e.stopPropagation() },
						React.createElement('div', { className: 'kb-dialog-head' }, React.createElement('span', { className: 'kb-dialog-title' }, 'MinIO 配置'), React.createElement('button', { className: 'kb-iconbtn', onClick: onClose }, IconClose)),
						React.createElement('div', { className: 'kb-dialog-body' },
							React.createElement('div', { className: 'kb-tabs' }, tabBtn('minio', '对象存储MinIO配置'), tabBtn('rag', 'RAG-MCP配置')),
							tab === 'minio' ? React.createElement('div', { className: 'kb-config-page' },
								field('Endpoint', 'endpoint', false, 'http://127.0.0.1:9000'), field('AccessKey', 'accessKey', false, 'admin'), field('SecretKey', 'secretKey', true), field('Region', 'region', false, 'us-east-1'),
								React.createElement('label', { className: 'kb-field' }, React.createElement('span', { className: 'kb-field-label' }, 'SSL'), React.createElement('input', { type: 'checkbox', checked: !!form.ssl, onChange: (e) => set('ssl', e.target.checked) })),
								React.createElement('div', { className: 'kb-test-row' }, React.createElement('button', { className: 'kb-btn', onClick: test }, '测试连接'), status ? React.createElement('span', { className: 'kb-status' }, status) : null)) :
								React.createElement('div', { className: 'kb-config-page' },
									field('Python', 'chromaPython', false, 'python'), field('Ingest 脚本', 'chromaIngestScript', false, 'C:/.../ingest.py'), field('MCP 端点 URL', 'ragMcpUrl', false, 'http://127.0.0.1:8000/mcp'), field('ServerName', 'ragServerName', false, 'chroma'),
									React.createElement('label', { className: 'kb-field' }, React.createElement('span', { className: 'kb-field-label' }, '启用 RAG 入库'), React.createElement('input', { type: 'checkbox', checked: !!form.ragEnabled, onChange: (e) => set('ragEnabled', e.target.checked) })),
									React.createElement('div', { className: 'kb-test-row' }, React.createElement('button', { className: 'kb-btn', onClick: testRag }, '测试RAG-MCP'), ragResult ? React.createElement('div', { className: 'kb-rag-check' }, ragChecks, ragResult.error ? React.createElement('div', { className: 'kb-rag-item bad' }, '⚠️ ' + ragResult.error) : null) : null))),
						React.createElement('div', { className: 'kb-dialog-foot' }, saveMsg ? React.createElement('span', { className: 'kb-status' }, saveMsg) : null, React.createElement('button', { className: 'kb-btn kb-btn-primary', onClick: save }, '保存'), React.createElement('button', { className: 'kb-btn', onClick: onClose }, '关闭'))));
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

			function triggerDownload(href, name) {
				try {
					const a = document.createElement('a');
					a.href = href;
					a.download = name;
					a.style.display = 'none';
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
				} catch (e) {}
			}

			function KnowledgeBasePanel() {
				const [state, setState] = React.useState(null);
				const [sel, setSel] = React.useState(null);
				const [prefix, setPrefix] = React.useState('');
				const PREFS_KEY = 'minio-kb-prefs';
				const readPrefs = () => { try { const v = JSON.parse(localStorage.getItem(PREFS_KEY)); return v || {}; } catch (e) { return {}; } };
				const [view, setView] = React.useState(() => readPrefs().view || 'icon');
				const [sortKey, setSortKey] = React.useState(() => readPrefs().sortKey || 'name');
				const [sortDir, setSortDir] = React.useState(() => readPrefs().sortDir || 'asc');
				React.useEffect(() => { try { localStorage.setItem(PREFS_KEY, JSON.stringify({ view, sortKey, sortDir })); } catch (e) { /* ignore */ } }, [view, sortKey, sortDir]);
				const [list, setList] = React.useState(null);
				const [listErr, setListErr] = React.useState('');
				const [search, setSearch] = React.useState('');
				const [notice, setNotice] = React.useState('');
				const [configOpen, setConfigOpen] = React.useState(false);
				const [addOpen, setAddOpen] = React.useState(false);
				const [preview, setPreview] = React.useState(null);
				const [confirmKey, setConfirmKey] = React.useState('');
				const [menu, setMenu] = React.useState(null);
				const [uploading, setUploading] = React.useState(false);
				const uploadAbort = React.useRef(null);
				const uploadCancelled = React.useRef(false);
				const [uploadTotal, setUploadTotal] = React.useState(0);
				const [uploadDone, setUploadDone] = React.useState(0);
				const [multiMode, setMultiMode] = React.useState(false);
				const [selected, setSelected] = React.useState(new Set());
				const [confirmBulk, setConfirmBulk] = React.useState(false);
				const [dragActive, setDragActive] = React.useState(false);
				const [dragInfo, setDragInfo] = React.useState(null);
				const dragDepth = React.useRef(0);

				const loadState = () => api('getState', {}).then((r) => { if (r && r.ok) setState(r.state); else setListErr((r && r.error) || '加载失败'); }).catch((e) => setListErr(String(e && e.message || e)));
				React.useEffect(() => { loadState(); }, []);
				React.useEffect(() => {
					if (!menu) return undefined;
					const onDoc = () => setMenu(null);
					document.addEventListener('click', onDoc);
					return () => document.removeEventListener('click', onDoc);
				}, [menu]);

				const loadList = () => {
					if (!sel) { setList(null); return; }
					setListErr('');
					api('listObjects', { bucket: sel.name, prefix }).then((r) => {
						if (r && r.ok) setList({ folders: r.folders || [], files: r.files || [] });
						else setListErr((r && r.error) || '加载失败');
					}).catch((e) => setListErr(String(e && e.message || e)));
				};
				React.useEffect(() => { loadList(); }, [sel && sel.name, prefix]);

				const uploadFiles = (fileList) => {
					if (!sel) { setNotice('请先选择左侧 Bucket 再拖放上传'); return; }
					if (!fileList || !fileList.length) return;
					const files = Array.from(fileList);
					if (files.length > MAX_FILES) { setNotice('最多一次上传 ' + MAX_FILES + ' 个文件（当前 ' + files.length + ' 个）'); return; }
					const over = files.filter((f) => f.size > MAX_SIZE_BYTES);
					if (over.length) { setNotice('单个文件不能超过 20MB：' + over.map((f) => f.name).join('、')); return; }
					const ac = new AbortController();
					uploadAbort.current = ac;
					uploadCancelled.current = false;
					setUploadTotal(files.length); setUploadDone(0); setUploading(true); setNotice('');
					let ok = 0, bad = 0, err = '';
					const jobs = files.map((file) => file.arrayBuffer().then((buf) => api('upload', { bucket: sel.name, prefix, name: file.name, base64: bytesToBase64(new Uint8Array(buf)), contentType: file.type || '' }, ac.signal)).then((r) => {
						setUploadDone((d) => d + 1);
						if (r && r.ok) ok++; else { bad++; if (!err) err = (r && r.error) || '上传失败'; }
					}));
					Promise.all(jobs).then(() => {
						setUploading(false);
						if (uploadCancelled.current) { setNotice('已取消上传'); return; }
						setNotice(ok + ' 个上传成功' + (bad ? '，' + bad + ' 个失败' + (err ? '（' + err + '）' : '') : ''));
						loadList();
					}).catch((e) => { setUploading(false); if (uploadCancelled.current) setNotice('已取消上传'); else setNotice('上传失败：' + String(e && e.message || e)); });
				};
				const cancelUpload = () => { uploadCancelled.current = true; if (uploadAbort.current) uploadAbort.current.abort(); };
				const doReconcile = () => { setNotice('扫描未入库文件…'); api('reconcileIngest', {}).then((r) => { setNotice(r && r.ok ? ('扫描 ' + (r.scanned || 0) + ' 个文件 → 入库 ' + (r.ingested || 0) + '，暂不支持 ' + (r.unsupported || 0) + '，失败 ' + (r.failed || 0) + '，跳过已入库 ' + (r.skipped || 0)) : ('入库失败：' + ((r && r.error) || ''))); loadList(); }).catch((e) => setNotice('入库失败：' + String(e && e.message || e))); };
				const dragHasFiles = (e) => !!(e.dataTransfer && Array.from((e.dataTransfer.types || [])).indexOf('Files') !== -1);
				const dragInfoOf = (e) => {
					const dt = e.dataTransfer;
					const files = (dt && dt.files) ? Array.from(dt.files) : [];
					const count = files.length || ((dt && dt.items) ? dt.items.length : 0);
					const totalSize = files.reduce((a, f) => a + (f.size || 0), 0);
					return { count, totalSize };
				};
				const onDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); if (dragHasFiles(e)) { dragDepth.current++; setDragActive(true); setDragInfo(dragInfoOf(e)); } };
				const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); if (dragHasFiles(e) && !dragActive) { setDragActive(true); } };
				const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); dragDepth.current = Math.max(0, dragDepth.current - 1); if (dragDepth.current === 0) { setDragActive(false); setDragInfo(null); } };
				const onDrop = (e) => { e.preventDefault(); e.stopPropagation(); dragDepth.current = 0; setDragActive(false); setDragInfo(null); if (dragHasFiles(e) && e.dataTransfer) uploadFiles(e.dataTransfer.files); };

				const doReference = (item) => {
					// 引用：V1.2 暂以文件预览承载，完整「引用到 DSH 对话/附件」见 V2。
					setMenu(null);
					if (sel) setPreview(item);
				};
				const doDownload = (item) => {
					if (!sel) return;
					setNotice('');
					api('download', { bucket: sel.name, key: item.key }).then((r) => {
						if (r && r.ok) triggerDownload('data:' + (r.contentType || 'application/octet-stream') + ';base64,' + r.base64, r.name || item.name);
						else setNotice((r && r.error) || '下载失败');
					}).catch((e) => setNotice('下载失败：' + String(e && e.message || e)));
				};
				const doDelete = (item) => {
					if (!sel) return;
					setNotice('');
					api('remove', { bucket: sel.name, key: item.key }).then((r) => {
						setNotice(r && r.ok ? '已删除 ' + item.name : ((r && r.error) || '删除失败'));
						setConfirmKey(''); setMenu(null); loadList();
					}).catch((e) => { setNotice('删除失败：' + String(e && e.message || e)); setConfirmKey(''); setMenu(null); });
				};
				const toggleSel = (item) => { if (item.isFolder) return; setSelected((prev) => { const next = new Set(prev); if (next.has(item.key)) next.delete(item.key); else next.add(item.key); return next; }); };
				const selectableAll = (arr) => arr.filter((x) => !x.isFolder);
				const allFilesSelected = (arr) => { const fs = selectableAll(arr); return fs.length > 0 && fs.every((x) => selected.has(x.key)); };
				const toggleAllSelected = (arr) => { const fs = selectableAll(arr); setSelected(allFilesSelected(arr) ? new Set() : new Set(fs.map((x) => x.key))); };
				const doBulkDelete = () => {
					if (!sel || !selected.size) return;
					const targets = allSelectable.filter((x) => selected.has(x.key));
					if (!targets.length) { setNotice('未选中可删除的文件'); return; }
					setNotice('');
					let done = 0, bad = 0, err = '';
					const jobs = targets.map((item) => api('remove', { bucket: sel.name, key: item.key }).then((r) => { if (r && r.ok) done++; else { bad++; if (!err) err = (r && r.error) || '删除失败'; } }));
					Promise.all(jobs).then(() => { setNotice(done + ' 个已删除' + (bad ? '，' + bad + ' 个失败' + (err ? '（' + err + '）' : '') : '')); setMultiMode(false); setSelected(new Set()); setConfirmBulk(false); loadList(); });
				};

				const sortLabels = { name: '名称', size: '大小', time: '时间' };
				const cycleSortField = () => setSortKey(sortKey === 'name' ? 'size' : sortKey === 'size' ? 'time' : 'name');
				const sortAll = (arr) => {
					const folders = arr.filter((x) => x.isFolder);
					const files = arr.filter((x) => !x.isFolder);
					files.sort((a, b) => {
						let r = 0;
						if (sortKey === 'size') r = ((a.size || 0)) - ((b.size || 0));
						else if (sortKey === 'time') r = String(a.lastModified || '').localeCompare(String(b.lastModified || ''));
						else r = String(a.name || '').localeCompare(String(b.name || ''), 'zh', { numeric: true });
						return sortDir === 'asc' ? r : -r;
					});
					return folders.concat(files);
				};

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
						React.createElement('button', { className: 'kb-iconbtn', onClick: () => setAddOpen(true), title: '加Bucket' }, IconPlus)));

				const tree = React.createElement('div', { className: 'kb-tree' },
					React.createElement('div', { className: 'kb-tree-title' }, 'Buckets'),
					(state && state.buckets && state.buckets.length) ? state.buckets.map((b) => React.createElement('div', { key: b.id, className: 'kb-node' + (sel && sel.id === b.id ? ' sel' : ''), onClick: () => { setSel(b); setPrefix(''); }, onContextMenu: (e) => { e.preventDefault(); if (window.confirm('移除对该 Bucket 的本地绑定？')) api('removeBucket', { id: b.id }).then(() => { loadState(); if (sel && sel.id === b.id) setSel(null); }); } },
						React.createElement('span', { style: { color: 'var(--dsw-alias-state-warn-primary)' } }, IconFolder),
						React.createElement('span', null, b.name)))
						: React.createElement('div', { className: 'kb-status', style: { padding: '8px' } }, '尚未添加 Bucket，点右上角 ➕ '));

				let explorer;
				let bulkBar = null;
				if (!sel) {
					explorer = React.createElement('div', { className: 'kb-empty' }, '选择左侧 Bucket 开始浏览');
				} else {
					const toolbar = React.createElement('div', { className: 'kb-toolbar' },
						uploading
							? React.createElement('div', { className: 'kb-uploading' },
								React.createElement('span', null, '上传中 ' + uploadDone + '/' + uploadTotal),
								React.createElement('div', { className: 'kb-progress' }, React.createElement('div', { className: 'kb-progress-fill', style: { width: (uploadTotal ? (uploadDone / uploadTotal * 100) : 0) + '%' } })),
								React.createElement('button', { className: 'kb-mini kb-mini-danger', onClick: cancelUpload }, '取消'))
							: React.createElement('label', { className: 'kb-btn' }, React.createElement(React.Fragment, null, IconUpload, '上传'),
								React.createElement('input', { type: 'file', multiple: true, style: { display: 'none' }, onChange: (e) => { uploadFiles(e.target.files); e.target.value = ''; } })),
						React.createElement('div', { className: 'kb-breadcrumb' },
							React.createElement('span', { className: 'kb-crumb', onClick: () => setPrefix('') }, 'Knowledge Base'),
							crumbs.map((c, i) => React.createElement(React.Fragment, { key: i },
								React.createElement('span', { className: 'kb-crumb-sep' }, ' / '),
								React.createElement('span', { className: 'kb-crumb', onClick: () => setPrefix(c.prefix) }, c.label)))),
						React.createElement('input', { className: 'kb-search', type: 'text', placeholder: '搜索文件名/类型', value: search, onChange: (e) => setSearch(e.target.value) }),
						React.createElement('div', { className: 'kb-sort' },
							React.createElement('button', { className: 'kb-mini', title: '切换排序字段', onClick: cycleSortField }, '排序：' + sortLabels[sortKey]),
							React.createElement('button', { className: 'kb-mini', title: '切换升降序', onClick: () => setSortDir(sortDir === 'asc' ? 'desc' : 'asc') }, sortDir === 'asc' ? '↑' : '↓')),
						React.createElement('div', { className: 'kb-viewtoggle' },
							React.createElement('button', { className: view === 'icon' ? 'on' : '', onClick: () => { setMenu(null); setConfirmKey(''); setView('icon'); } }, '图标'),
							React.createElement('button', { className: view === 'list' ? 'on' : '', onClick: () => { setMenu(null); setConfirmKey(''); setView('list'); } }, '列表')),
						React.createElement('button', { className: 'kb-mini' + (multiMode ? ' on' : ''), title: '多选', onClick: () => { setMultiMode(!multiMode); setSelected(new Set()); setConfirmBulk(false); setMenu(null); } }, multiMode ? '退出多选' : '多选'),
						React.createElement('button', { className: 'kb-mini', title: '从 Chroma 核对入库状态', onClick: doReconcile }, '刷新入库'));
					if (listErr) explorer = React.createElement('div', { className: 'kb-empty' }, '加载失败：' + listErr);
					else if (!list) explorer = React.createElement('div', { className: 'kb-empty' }, '加载中…');
					else {
						const folders = list.folders.map((k) => ({ isFolder: true, key: k, name: k.split('/').filter(Boolean).pop(), type: 'folder' }));
						const files = list.files;
						const base = folders.concat(files);
						const allSelectable = selectableAll(base);
						const all = sortAll(search ? base.filter((item) => String(item.name || '').toLowerCase().indexOf(search.toLowerCase()) !== -1 || String(item.type || '').toLowerCase().indexOf(search.toLowerCase()) !== -1) : base);
						bulkBar = multiMode ? React.createElement('div', { className: 'kb-bulk' },
							React.createElement('span', null, '已选 ' + selected.size + ' 项'),
							React.createElement('button', { className: 'kb-mini', onClick: () => toggleAllSelected(all) }, allFilesSelected(all) ? '取消全选' : '全选'),
							confirmBulk ? React.createElement('button', { className: 'kb-mini kb-mini-danger', onClick: doBulkDelete }, '确认删除') : React.createElement('button', { className: 'kb-mini kb-mini-danger', onClick: () => setConfirmBulk(true) }, '删除选中'))
						: null;
						const menuBtn = (item) => React.createElement('button', { className: 'kb-corner-btn', title: '更多', onClick: (e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); if (menu && menu.key === item.key) setMenu(null); else setMenu({ key: item.key, item: item, pos: { left: r.right, top: r.bottom + 4 } }); } }, IconMore);
						const nameEl = (name) => { const np = nameParts(name); return React.createElement('span', { className: 'kb-card-name' }, React.createElement('span', { className: 'kb-card-base' }, np.base), np.ext ? React.createElement('span', { className: 'kb-card-ext' }, np.ext) : null); };
						if (!all.length) explorer = React.createElement('div', { className: 'kb-empty' }, '空目录');
						else if (view === 'icon') {
							explorer = React.createElement('div', { className: 'kb-grid' }, all.map((item) => React.createElement('div', { key: item.isFolder ? item.key : 'f:' + item.key, className: 'kb-card' + (selected.has(item.key) ? ' sel' : '') + (multiMode ? ' multi' : ''), onClick: () => { if (multiMode) { if (!item.isFolder) toggleSel(item); } else openFile(item); } },
								(!item.isFolder && multiMode) ? React.createElement('div', { className: 'kb-check' }, selected.has(item.key) ? React.createElement('span', null, '✓') : null) : null,
								React.createElement('div', { className: 'kb-cardIcon' + (item.isFolder ? ' folder' : '') }, item.isFolder ? IconFolder : fileIcon(item)),
								nameEl(item.name),
								(!item.isFolder && !multiMode) ? React.createElement('div', { className: 'kb-card-corner' }, menuBtn(item)) : null)));
						} else {
							explorer = React.createElement('div', { className: 'kb-list' }, React.createElement('table', null,
								React.createElement('thead', null, React.createElement('tr', null, React.createElement('th', null, '名称'), React.createElement('th', null, '类型'), React.createElement('th', null, '大小'), React.createElement('th', null, '修改时间'), React.createElement('th', null, '入库'), React.createElement('th', null, '操作'))),
								React.createElement('tbody', null, all.map((item) => React.createElement('tr', { key: item.isFolder ? item.key : 'f:' + item.key, className: selected.has(item.key) ? 'sel' : '', onClick: () => { if (multiMode) { if (!item.isFolder) toggleSel(item); } else openFile(item); }, style: { cursor: 'pointer' } },
									React.createElement('td', null, React.createElement('span', { className: 'kb-namecell' }, (multiMode && !item.isFolder) ? React.createElement('span', { className: 'kb-rowcheck' }, selected.has(item.key) ? '✓' : '') : null, nameEl(item.name))), React.createElement('td', null, item.isFolder ? '文件夹' : (item.type || '-')), React.createElement('td', null, item.isFolder ? '-' : formatSize(item.size)), React.createElement('td', null, formatTime(item.lastModified)), React.createElement('td', { className: 'kb-ing' }, (function () { const ig = item.ingest; if (ig) { if (ig.ok) return '✅ 已入库 ' + (formatTime(ig.time) || '') + (ig.chunks ? ' · ' + ig.chunks + ' 片段' : ''); if (ig.unsupported) return '🚫 暂不支持向量化'; if (ig.skipped) return 'ℹ️ 未启用'; return '⚠️ 失败 ' + (formatTime(ig.time) || ''); } return '—'; })()),
									React.createElement('td', null, (!item.isFolder && !multiMode) ? menuBtn(item) : null))))));
						}
					}
					const _ing = menu && menu.item && menu.item.ingest
					const ingestTxt = _ing
						? (_ing.ok ? ('✅ 已入库 ' + (formatTime(_ing.time) || '') + (_ing.chunks ? ' · ' + _ing.chunks + ' 片段' : ''))
							: (_ing.unsupported ? ('🚫 暂不支持向量化' + (_ing.error ? ' · ' + _ing.error : ''))
								: (_ing.skipped ? 'ℹ️ 未启用入库' : '⚠️ 入库失败 ' + (formatTime(_ing.time) || '') + (_ing.error ? ' · ' + _ing.error : ''))))
						: 'ℹ️ 未入库'
					const dropdown = menu && menu.item ? ReactDOM.createPortal(React.createElement('div', { className: 'kb-menu-fixed', style: { left: menu.pos.left, top: menu.pos.top }, onClick: (e) => e.stopPropagation() },
						React.createElement('div', { className: 'kb-menu-status' }, ingestTxt),
						React.createElement('button', { className: 'kb-menu-item', onClick: () => { doReference(menu.item); } }, '引用'),
						React.createElement('button', { className: 'kb-menu-item', onClick: () => { openFile(menu.item); setMenu(null); } }, '预览'),
						React.createElement('button', { className: 'kb-menu-item', onClick: () => { doDownload(menu.item); setMenu(null); } }, '下载'),
						confirmKey === menu.item.key
							? React.createElement('button', { className: 'kb-menu-item kb-menu-danger', onClick: () => { doDelete(menu.item); } }, '确认删除')
							: React.createElement('button', { className: 'kb-menu-item kb-menu-danger', onClick: () => { setConfirmKey(menu.item.key); } }, '删除')
					), document.body) : null;
					const dropOverlay = dragActive ? React.createElement('div', { className: 'kb-drop-overlay' },
						React.createElement('div', { className: 'kb-drop-icon' }, IconUpload),
						React.createElement('div', { className: 'kb-drop-title' }, sel ? ('松开以上传' + (dragInfo && dragInfo.count ? ' ' + dragInfo.count + ' 个文件' : '')) : '请先选择左侧 Bucket'),
						React.createElement('div', { className: 'kb-drop-sub' }, sel ? ('上传到：' + sel.name + (prefix ? '/' + prefix : '')) : '选择 Bucket 后即可拖放上传'),
						React.createElement('div', { className: 'kb-drop-limit' }, '最多 ' + MAX_FILES + ' 个文件，单个不超过 20MB')
					) : null;
					explorer = React.createElement('div', { className: 'kb-explorer', onDragEnter, onDragOver, onDragLeave, onDrop }, toolbar, bulkBar, notice ? React.createElement('div', { className: 'kb-notice' }, notice) : null, explorer, dropdown, dropOverlay);
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
