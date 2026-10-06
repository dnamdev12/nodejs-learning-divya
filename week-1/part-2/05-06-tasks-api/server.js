// NJ-W1-05/06 — starts the Tasks REST API
import { createApp } from './app.js';
import { createTaskStore } from './store/taskStore.js';

const PORT = process.env.PORT || 4000;

const app = createApp({
  apiKey: process.env.API_KEY || 'dev-secret-key',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
  store: createTaskStore([
    { title: 'Read the Express routing guide', status: 'done' },
    { title: 'Build the tasks REST API', status: 'in-progress' },
    { title: 'Connect the React app' },
  ]),
});

app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Tasks API running on http://localhost:${PORT}`);
});
