// NJ-W1-05 — CRUD routes for /api/tasks
import { Router } from 'express';
import { HttpError } from '../utils/HttpError.js';
import { STATUSES } from '../store/taskStore.js';

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, `Invalid task id: ${raw}`);
  return id;
}

// mode: 'create' (POST) | 'replace' (PUT) | 'update' (PATCH)
function validateBody(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }
  const fields = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      throw new HttpError(400, 'title must be a non-empty string');
    }
    fields.title = body.title.trim();
  } else if (mode !== 'update') {
    throw new HttpError(400, 'title is required');
  }

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      throw new HttpError(400, `status must be one of: ${STATUSES.join(', ')}`);
    }
    fields.status = body.status;
  } else if (mode === 'replace') {
    throw new HttpError(400, 'status is required');
  }

  if (mode === 'update' && !Object.keys(fields).length) {
    throw new HttpError(400, 'Provide at least one of: title, status');
  }
  return fields;
}

export function tasksRouter(store) {
  const router = Router();

  function findOr404(rawId) {
    const id = parseId(rawId);
    const task = store.get(id);
    if (!task) throw new HttpError(404, `Task ${id} not found`);
    return task;
  }

  // GET /api/tasks?status=todo
  router.get('/', (req, res) => {
    const { status } = req.query;
    if (status !== undefined && !STATUSES.includes(status)) {
      throw new HttpError(400, `status must be one of: ${STATUSES.join(', ')}`);
    }
    res.json({ success: true, data: store.list({ status }) });
  });

  router.get('/:id', (req, res) => {
    res.json({ success: true, data: findOr404(req.params.id) });
  });

  // 201 Created + Location header pointing at the new resource
  router.post('/', (req, res) => {
    const task = store.create(validateBody(req.body, 'create'));
    res
      .status(201)
      .location(`${req.baseUrl}/${task.id}`)
      .json({ success: true, data: task });
  });

  // PUT replaces the whole task (title and status both required)
  router.put('/:id', (req, res) => {
    const { id } = findOr404(req.params.id);
    res.json({ success: true, data: store.update(id, validateBody(req.body, 'replace')) });
  });

  // PATCH changes only the fields sent
  router.patch('/:id', (req, res) => {
    const { id } = findOr404(req.params.id);
    res.json({ success: true, data: store.update(id, validateBody(req.body, 'update')) });
  });

  // 204 No Content: success, nothing to send back
  router.delete('/:id', (req, res) => {
    const { id } = findOr404(req.params.id);
    store.remove(id);
    res.status(204).end();
  });

  return router;
}
