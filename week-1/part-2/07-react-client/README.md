# NJ-W1-07 — React client for the Tasks API

A Vite + React page that lists, adds and deletes tasks, with a status filter.

```bash
# terminal 1, at the repo root
npm run w1:api

# terminal 2
npm run w1:react:install   # first time only
npm run w1:react           # http://localhost:5173
```

The API URL and key default to `http://localhost:4000` / `dev-secret-key`. To change them, copy `.env.example` to `.env`.

## How CORS is fixed (properly)

The page (`localhost:5173`) and the API (`localhost:4000`) are on different **origins** because the port differs. Browsers block cross-origin responses unless the server allows them.

The app sends `x-api-key` (a custom header), and its DELETE uses a method that isn't GET or POST. Either one makes the browser send a **preflight** first:

```
OPTIONS /api/tasks/3
Origin: http://localhost:5173
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: x-api-key
```

The API answers it in [app.js](../05-06-tasks-api/app.js) using `cors()`:

- `origin: ['http://localhost:5173']` is an **allowlist**, not `*`, so any other site is blocked.
- `allowedHeaders` includes `x-api-key`, and `methods` includes PATCH and DELETE.
- `cors` runs **before** the API key check. The preflight carries no key, so it would otherwise be rejected with a 401 and every real request would fail.
- Because it runs first, error responses (401/404) also carry CORS headers, so the page can show their `message`.

To see the block happen, run `npx vite --port 5174` in this folder and open it. The browser console then shows *"blocked by CORS policy"*.

**Why not the "quick fixes"?**
- `cors()` with no options allows every origin.
- A browser extension that turns CORS off only affects your own machine.
- A Vite dev proxy is a legitimate option, but it hides the problem instead of configuring the API.

> The API key is bundled into the frontend JavaScript, so anyone can read it. That's fine for practice. Real apps authenticate users (sessions or JWT) instead.
