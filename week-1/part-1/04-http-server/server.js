// NJ-W1-04 — Raw HTTP server (node:http only)
// GET /notes -> JSON list of notes; any other route -> 404 JSON
import http from 'node:http';
import { loadNotes } from '../03-cli-notes/notes.js';

const PORT = process.env.PORT || 3000;

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === 'GET' && pathname === '/notes') {
      return sendJson(res, 200, await loadNotes());
    }
    sendJson(res, 404, { error: 'Not Found', path: pathname });
  } catch (err) {
    sendJson(res, 500, { error: 'Internal Server Error' });
  }
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
