export function getConsoleHtml(): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font: 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin:0; }
  .wrap { padding: 12px; }
  textarea { width: 100%; height: 96px; box-sizing: border-box; }
  button { margin-top: 6px; }
  pre { white-space: pre-wrap; background: #111; color: #ddd; padding: 8px; border-radius: 6px; }
  .error { color: #c33; }
  em { opacity: 0.7; }
  h3 { margin: 0 0 8px 0; }
  #o { margin-top: 10px; }
  .row { display: flex; gap: 8px; align-items: center; }
  .row > * { flex: none; }
  .row textarea { flex: 1; }
  .hint { opacity: 0.7; font-size: 11px; margin-top: 6px; }
  .note { margin-top: 8px; opacity: 0.7; font-size: 11px; }
  .small { font-size: 11px; }
  .sep { height: 1px; background: #333; margin: 10px 0; opacity: 0.4; }
  .btn { padding: 6px 10px; border-radius: 4px; }
  .btn:active { transform: translateY(1px); }
  </style>
</head>
<body>
  <div class="wrap">
    <h3>SYMBI Console</h3>
    <div class="row">
      <textarea id="t" placeholder="Message to your latest assistant..."></textarea>
      <button id="s" class="btn">Send</button>
    </div>
    <div class="hint">Uses /api/assistant/message via your SYMBI backend</div>
    <div class="sep"></div>
    <div id="o"></div>
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    const t = document.getElementById('t');
    const o = document.getElementById('o');
    document.getElementById('s').onclick = () => {
      const text = t.value.trim();
      if(!text){ return; }
      o.innerHTML = '<em>Sending...</em>';
      vscode.postMessage({ type: 'send', text });
    };
    window.addEventListener('message', ev => {
      if (ev.data.type === 'reply') {
        o.innerHTML = '<pre>'+JSON.stringify(ev.data.data, null, 2)+'</pre>';
      } else if (ev.data.type === 'error') {
        o.innerHTML = '<pre class="error">'+ev.data.error+'</pre>';
      }
    });
  </script>
</body>
</html>`;
}

