// Run: npm run w1:api:test   (uses the built-in node:test runner + fetch)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../app.js';
import { createTaskStore } from '../store/taskStore.js';

const API_KEY = 'test-key';
const ORIGIN = 'http://localhost:5173';
let server;
let base;

before(async () => {
  const app = createApp({
    apiKey: API_KEY,
    corsOrigins: [ORIGIN],
    store: createTaskStore([{ title: 'Seed task', status: 'done' }]),
    log: () => {}, // keep test output clean
  });
  await new Promise((resolve) => {
    server = app.listen(0, resolve); // port 0 = any free port
  });
  base = `http://localhost:${server.address().port}`;
});

after(() => server.close());

function api(path, { method = 'GET', body, headers = {} } = {}) {
  return fetch(`${base}${path}`, {
    method,
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : body && JSON.stringify(body),
  });
}

async function expectError(res, status) {
  assert.equal(res.status, status);
  const body = await res.json();
  assert.equal(body.success, false);
  assert.equal(typeof body.message, 'string');
  return body;
}

test('full CRUD lifecycle', async () => {
  const created = await api('/api/tasks', { method: 'POST', body: { title: '  Write tests  ' } });
  assert.equal(created.status, 201);
  const { data: task } = await created.json();
  assert.equal(task.title, 'Write tests');
  assert.equal(task.status, 'todo');
  assert.equal(created.headers.get('location'), `/api/tasks/${task.id}`);

  const fetched = await api(`/api/tasks/${task.id}`);
  assert.equal(fetched.status, 200);
  assert.deepEqual((await fetched.json()).data, task);

  const patched = await api(`/api/tasks/${task.id}`, { method: 'PATCH', body: { status: 'in-progress' } });
  assert.equal(patched.status, 200);
  const { data: afterPatch } = await patched.json();
  assert.equal(afterPatch.status, 'in-progress');
  assert.equal(afterPatch.title, 'Write tests');

  const put = await api(`/api/tasks/${task.id}`, { method: 'PUT', body: { title: 'Done', status: 'done' } });
  assert.equal((await put.json()).data.title, 'Done');

  const deleted = await api(`/api/tasks/${task.id}`, { method: 'DELETE' });
  assert.equal(deleted.status, 204);
  assert.equal(await deleted.text(), '');

  await expectError(await api(`/api/tasks/${task.id}`), 404);
  await expectError(await api(`/api/tasks/${task.id}`, { method: 'DELETE' }), 404);
});

test('?status= filter', async () => {
  await api('/api/tasks', { method: 'POST', body: { title: 'Filter me', status: 'todo' } });
  const res = await api('/api/tasks?status=done');
  const { data } = await res.json();
  assert.ok(data.length > 0);
  assert.ok(data.every((t) => t.status === 'done'));

  await expectError(await api('/api/tasks?status=bogus'), 400);
});

test('validation errors return 400', async () => {
  const cases = [
    ['POST', '/api/tasks', {}],
    ['POST', '/api/tasks', { title: '   ' }],
    ['POST', '/api/tasks', { title: 'x', status: 'later' }],
    ['POST', '/api/tasks', '{"title": oops}'], // malformed JSON
    ['PUT', '/api/tasks/1', { title: 'missing status' }],
    ['PATCH', '/api/tasks/1', {}],
    ['GET', '/api/tasks/abc', undefined],
  ];
  for (const [method, path, body] of cases) {
    await expectError(await api(path, { method, body }), 400);
  }
  const malformed = await api('/api/tasks', { method: 'POST', body: '{bad' });
  assert.equal((await malformed.json()).message, 'Malformed JSON in request body');
});

test('x-api-key is required', async () => {
  const missing = await fetch(`${base}/api/tasks`);
  assert.equal((await expectError(missing, 401)).message, 'Missing x-api-key header');
  await expectError(await api('/api/tasks', { headers: { 'x-api-key': 'wrong' } }), 401);
});

test('unknown routes return 404 in the standard shape', async () => {
  await expectError(await api('/api/nope'), 404);
  await expectError(await fetch(`${base}/nope`), 404);
});

test('CORS: preflight passes without an API key, only for allowed origins', async () => {
  const preflight = (origin) =>
    fetch(`${base}/api/tasks/1`, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'DELETE',
        'Access-Control-Request-Headers': 'x-api-key',
      },
    });

  const allowed = await preflight(ORIGIN);
  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers.get('access-control-allow-origin'), ORIGIN);
  assert.match(allowed.headers.get('access-control-allow-headers'), /x-api-key/);

  const blocked = await preflight('http://evil.example');
  assert.equal(blocked.headers.get('access-control-allow-origin'), null);

  // Error responses carry CORS headers too, so the browser can read the message
  const unauthorized = await fetch(`${base}/api/tasks`, { headers: { Origin: ORIGIN } });
  assert.equal(unauthorized.status, 401);
  assert.equal(unauthorized.headers.get('access-control-allow-origin'), ORIGIN);
});
