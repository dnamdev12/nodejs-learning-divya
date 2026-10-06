// Small client for the Tasks API (week-1/part-2/05-06-tasks-api)
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
// Anything bundled into frontend code is visible to every user, so this key
// is not a real secret. It is fine for practice, not for production.
const API_KEY = import.meta.env.VITE_API_KEY ?? 'dev-secret-key';

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'x-api-key': API_KEY,
        ...(body && { 'Content-Type': 'application/json' }),
      },
      body: body && JSON.stringify(body),
    });
  } catch {
    // fetch only rejects on network failures, and a CORS block looks exactly the same
    throw new Error(`Cannot reach the API at ${BASE_URL}. Is it running? (Check the console for CORS errors.)`);
  }

  if (res.status === 204) return null;
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

export const listTasks = (status) =>
  request(`/api/tasks${status ? `?status=${encodeURIComponent(status)}` : ''}`);

export const createTask = (title) => request('/api/tasks', { method: 'POST', body: { title } });

export const deleteTask = (id) => request(`/api/tasks/${id}`, { method: 'DELETE' });
