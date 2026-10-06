# NJ-W1-04 — Raw HTTP server

Uses only `node:http`. Reads notes created by the CLI app (task 03).

```bash
node server.js
curl localhost:3000/notes     # 200 + JSON array
curl localhost:3000/whatever  # 404 {"error":"Not Found"}
```
