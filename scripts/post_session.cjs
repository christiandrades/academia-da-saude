const http = require('http');

function postJson(url, data) {
    return new Promise((resolve) => {
        const body = JSON.stringify(data);
        const u = new URL(url);
        const opts = { hostname: u.hostname, port: u.port || 80, path: u.pathname + u.search, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
        const req = http.request(opts, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        });
        req.on('error', e => resolve({ error: e.message }));
        req.write(body);
        req.end();
    });
}

(async () => {
    const res = await postJson('http://localhost:5173/api/sessions', { code: 'invalid-code' });
    console.log(JSON.stringify(res, null, 2));
})();
