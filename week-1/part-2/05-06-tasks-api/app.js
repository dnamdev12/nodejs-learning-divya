// Builds the Express app. Kept separate from server.js so tests can create
// a fresh app (with its own store) without opening a fixed port.
import express from 'express';
import cors from 'cors';
import { createTaskStore } from './store/taskStore.js';
import { tasksRouter } from './routes/tasks.js';
import { requestLogger } from './middleware/requestLogger.js';
import { requireApiKey } from './middleware/apiKey.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp({ apiKey, corsOrigins = [], store = createTaskStore(), log } = {}) {
  if (!apiKey) throw new Error('createApp: apiKey is required');

  const app = express();
  app.disable('x-powered-by');

  // Middleware runs top to bottom, so the order matters:
  // 1. Log every request, including ones rejected below
  app.use(requestLogger(log));

  // 2. CORS before the API key check. A browser's preflight OPTIONS request
  //    never carries x-api-key, so it must be answered before auth rejects it.
  //    Running first also puts CORS headers on error responses, so the
  //    React app can read their messages.
  app.use(
    cors({
      origin: corsOrigins, // explicit allowlist, never '*'
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'x-api-key'],
    }),
  );

  // 3. Parse JSON bodies into req.body (malformed JSON -> 400 via errorHandler)
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

  // 4. Everything under /api needs the key
  app.use('/api', requireApiKey(apiKey));
  app.use('/api/tasks', tasksRouter(store));

  // 5. No route matched -> 404, then all errors -> one JSON shape
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
