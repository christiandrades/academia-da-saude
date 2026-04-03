const http = require('http');
const https = require('https');
const { URL } = require('url');
function fetchRaw(url) {
    return new Promise((resolve) => {
        try {
            const u = new URL(url);
            const lib = u.protocol === 'https:' ? https : http;
            const opts = { hostname: u.hostname, port: u.port || (u.protocol === 'https:' ? 443 : 80), path: u.pathname + u.search, method: 'GET', timeout: 5000 };
            const req = lib.request(opts, (res) => {
                let d = '';
                res.on('data', (c) => d += c);
                res.on('end', () => resolve({ status: res.statusCode, body: d }));
            });
            req.on('error', (e) => resolve({ error: e.message }));
            req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
            req.end();
        } catch (e) { resolve({ error: e.message }); }
    });
}
(async function () {
    const base = 'http://localhost:5173';
    const paths = ['/api/users/me', '/api/oauth/google/redirect_url', '/api/admin/stats'];
    for (const p of paths) {
        const url = base + p;
        process.stdout.write(`\n==> ${url}\n`);
        const r = await fetchRaw(url);
        console.log(JSON.stringify(r, null, 2));
    }
})();
