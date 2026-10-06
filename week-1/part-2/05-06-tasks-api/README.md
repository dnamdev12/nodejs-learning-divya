# NJ-W1-05 + NJ-W1-06 — Tasks REST API (Express)

Express 5 API for tasks, stored in memory (data resets on restart).
Task 06 adds middleware on top of task 05, so both live in this one app.

```bash
npm install          # from the repo root
npm run w1:api       # http://localhost:4000
npm run w1:api:test  # automated tests (node:test)
```

| Env var        | Default                 |
|----------------|-------------------------|
| `PORT`         | `4000`                  |
| `API_KEY`      | `dev-secret-key`        |
| `CORS_ORIGINS` | `http://localhost:5173` (comma-separated) |

## Endpoints (NJ-W1-05)

All `/api/*` routes need the header `x-api-key: dev-secret-key`.

| Method | Path                   | Success                         | Errors |
|--------|------------------------|---------------------------------|--------|
| GET    | `/health`              | 200 (no key needed)             | |
| GET    | `/api/tasks?status=`   | 200 list (filter optional)      | 400 bad status |
| GET    | `/api/tasks/:id`       | 200                             | 400 bad id, 404 |
| POST   | `/api/tasks`           | **201** + `Location` header     | 400 validation |
| PUT    | `/api/tasks/:id`       | 200 (title + status required)   | 400, 404 |
| PATCH  | `/api/tasks/:id`       | 200 (only the fields sent)      | 400, 404 |
| DELETE | `/api/tasks/:id`       | **204** no body                 | 404 |

A task looks like `{ id, title, status, createdAt, updatedAt }`, where `status` is one of `todo | in-progress | done`.

Every success response is `{ success: true, data }` and every error is `{ success: false, message }`.

```bash
curl -H "x-api-key: dev-secret-key" "localhost:4000/api/tasks?status=done"
curl -i -X POST localhost:4000/api/tasks -H "x-api-key: dev-secret-key" \
     -H "Content-Type: application/json" -d '{"title":"Learn Express"}'
```

## Middleware (NJ-W1-06)

They run in the order they're registered in [app.js](app.js):

1. [requestLogger](middleware/requestLogger.js) logs `METHOD /url STATUS 1.2ms` once the response has been sent.
2. `cors` comes **before** the key check, because a browser's preflight `OPTIONS` request never includes `x-api-key`.
3. `express.json()` parses the body. Malformed JSON becomes a 400.
4. [requireApiKey](middleware/apiKey.js) returns 401 when the key is missing or wrong. It compares keys with `timingSafeEqual`.
5. The routes.
6. [notFound](middleware/notFound.js) runs only if no route matched, and turns the request into a 404.
7. [errorHandler](middleware/errorHandler.js) has 4 arguments `(err, req, res, next)`, so Express treats it as the error handler. It turns every error into `{ success: false, message }`. Unexpected errors become a 500 with a generic message, so internal details don't leak to the client.

Routes just `throw new HttpError(404, '...')`. Express 5 also forwards errors from `async` handlers (rejected promises) to the error handler automatically, whereas Express 4 needed `try/catch` + `next(err)`.

## Postman

Import [postman/tasks-api.postman_collection.json](postman/tasks-api.postman_collection.json) and click **Run collection**. It has 19 requests and 35 checks, covering CRUD plus all the error cases. The API key is set once on the collection (variable `apiKey`), and "Create task" saves `{{taskId}}` for the requests that come after it.

To run it from the command line:
```bash
npx newman run week-1/part-2/05-06-tasks-api/postman/tasks-api.postman_collection.json
```
