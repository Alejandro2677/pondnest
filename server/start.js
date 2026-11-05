import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { commerceHandler } from './api.js';

// Hosting supplies secrets at runtime; Vite is not a production dependency.
if (process.env.NODE_ENV !== 'production') {
  try { process.loadEnvFile('.env.local'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const env = { ...process.env };
delete env.PONDNEST_LOCAL_TEST_SERVER;
const api = commerceHandler(env);
const root = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.ico':'image/x-icon', '.svg': 'image/svg+xml', '.woff':'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary', '.txt':'text/plain' };
http.createServer((req, res) => api(req, res, async () => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.statusCode = 405; return res.end(); }
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (path === '/healthz') { res.setHeader('Content-Type','application/json'); res.setHeader('Cache-Control','no-store'); return res.end(req.method === 'HEAD' ? undefined : JSON.stringify({status:'ok',checkoutEnabled:env.PONDNEST_CHECKOUT_ENABLED === 'true'})); }
    const target = resolve(root, '.' + path);
    if (target !== root && !target.startsWith(root + sep)) { res.statusCode = 403; return res.end(); }
    let file = target;
    let bytes;
    try { bytes = await readFile(file); }
    catch { if (extname(path)) { res.statusCode = 404; return res.end(); } file = resolve(root, 'index.html'); bytes = await readFile(file); }
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    res.setHeader('Content-Length', bytes.length);
    res.setHeader('Cache-Control', extname(file) === '.html' ? 'no-cache' : file.startsWith(resolve(root,'assets') + sep) ? 'public, max-age=31536000, immutable' : 'public, max-age=3600');
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch { res.statusCode = 500; res.end('No se ha podido servir la web.'); }
})).listen(Number(env.PORT || 3000), '0.0.0.0', () => console.log(`PondNest: http://localhost:${env.PORT || 3000}`));
