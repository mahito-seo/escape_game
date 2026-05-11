// ─────────────────────────────────────────────────────────────
//  進捗トラッカー受信サーバー
//  使い方: node tracker/server.js
//  ポート 9876 で待ち受けます。
//  ・POST /status : チームから進捗を受信
//  ・GET  /status : 全チームの最新状態を JSON で返す（ダッシュボード用）
//  ・GET  /        : 講師用ダッシュボード HTML を返す
// ─────────────────────────────────────────────────────────────
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 9876;
const teams = new Map(); // teamName -> latest status object

function send(res, status, body, type='application/json'){
  res.writeHead(status, {
    'Content-Type': type,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, '');

  if (req.method === 'POST' && req.url === '/status') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 10000) req.destroy(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.teamName) return send(res, 400, '{"error":"teamName required"}');
        data.serverReceivedAt = Date.now();
        data.clientIP = (req.socket.remoteAddress||'').replace(/^::ffff:/, '');
        teams.set(data.teamName, data);
        send(res, 200, '{"ok":true}');
      } catch (e) {
        send(res, 400, JSON.stringify({error: e.message}));
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/status') {
    return send(res, 200, JSON.stringify({
      teams: [...teams.values()].sort((a,b)=>(b.serverReceivedAt||0)-(a.serverReceivedAt||0)),
      count: teams.size,
    }));
  }

  if (req.method === 'POST' && req.url === '/reset') {
    teams.clear();
    return send(res, 200, '{"ok":true}');
  }

  if (req.method === 'GET' && (req.url === '/dashboard' || req.url === '/dashboard.html')) {
    const f = path.join(__dirname, 'dashboard.html');
    try {
      const html = fs.readFileSync(f, 'utf-8');
      return send(res, 200, html, 'text/html; charset=utf-8');
    } catch (e) { return send(res, 404, 'dashboard.html not found'); }
  }

  // ── Serve the entire game so teams can load it via http://INSTRUCTOR_IP:9876/dragon.html.
  // file:// → LAN-IP fetch is blocked by Chrome Private Network Access; serving from the
  // same origin (the tracker server) sidesteps it entirely.
  if (req.method === 'GET') {
    const ROOT = path.resolve(__dirname, '..');
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/dragon.html';
    const filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) return send(res, 403, '{"error":"forbidden"}');
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) return send(res, 404, '{"error":"not found"}');
      const ext = path.extname(filePath).toLowerCase();
      const types = {
        '.html':'text/html; charset=utf-8',
        '.js':'application/javascript; charset=utf-8',
        '.css':'text/css; charset=utf-8',
        '.json':'application/json',
        '.mp3':'audio/mpeg', '.ogg':'audio/ogg', '.wav':'audio/wav',
        '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml',
        '.md':'text/markdown; charset=utf-8',
      };
      const buf = fs.readFileSync(filePath);
      return send(res, 200, buf, types[ext] || 'application/octet-stream');
    } catch (e) {
      return send(res, 404, '{"error":"not found"}');
    }
  }

  send(res, 404, '{"error":"not found"}');
});

server.listen(PORT, '0.0.0.0', () => {
  // Print all LAN IPs so the instructor can tell teams what URL to use.
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const ni of nets[name]||[]) {
      if (ni.family === 'IPv4' && !ni.internal) ips.push(ni.address);
    }
  }
  console.log('進捗トラッカー受信サーバー起動');
  console.log(`  PORT: ${PORT}`);
  console.log('');
  console.log('  講師ダッシュボード（このPC上で開く）:');
  console.log(`    http://localhost:${PORT}/dashboard`);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  チーム接続方法（環境に合わせて選択）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('  ▼ 方法1: 同一 LAN（Mac→Mac は OK / 社内Win→Mac は不可な場合あり）');
  for (const ip of ips) console.log(`    ゲーム本体:        http://${ip}:${PORT}/dragon.html`);
  for (const ip of ips) console.log(`    アップロード先URL: http://${ip}:${PORT}/status`);
  if (!ips.length) console.log('    (LAN IP が検出できませんでした — Wi-Fi 接続を確認してください)');
  console.log('');
  console.log('  ▼ 方法2: Windows 企業 PC で ERR_NETWORK_ACCESS_DENIED が出る場合');
  console.log('    → Cloudflare Tunnel で公開 HTTPS にする（Chrome は許可します）:');
  console.log('       1. brew install cloudflared （または公式の各 OS 版）');
  console.log(`       2. 別ターミナルで: cloudflared tunnel --url http://localhost:${PORT}`);
  console.log('       3. 表示される https://xxx.trycloudflare.com を全員に共有');
  console.log('       4. ゲーム本体: https://xxx.trycloudflare.com/dragon.html');
  console.log('          アップロード先URL: https://xxx.trycloudflare.com/status');
  console.log('');
  console.log('  ▼ 方法3: それも無理ならローカル実行（中央集約は無し）');
  console.log('    → 各チームの PC 上でこのサーバーを起動、http://localhost:'+PORT+'/dragon.html を開く');
  console.log('       進捗は各自の画面でのみ確認、講師は対面で巡回');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
