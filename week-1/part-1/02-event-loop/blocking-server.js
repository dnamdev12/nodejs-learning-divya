// NJ-W1-02 — Blocking demo
// GET /slow blocks the event loop with a CPU loop, freezing every other request.
// Try: curl localhost:3000/slow  and, at the same time, curl localhost:3000/fast
import http from 'node:http';

const PORT = 3000;

function blockFor(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // busy-wait: the single JS thread can do nothing else
  }
}

const server = http.createServer((req, res) => {
  const started = Date.now();

  if (req.url === '/slow') {
    blockFor(5000);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ route: '/slow', tookMs: Date.now() - started }));
  }

  if (req.url === '/fast') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ route: '/fast', tookMs: Date.now() - started }));
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => console.log(`Blocking demo on http://localhost:${PORT} (/slow, /fast)`));
