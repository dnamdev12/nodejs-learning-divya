// In-memory task store. Data lives in a Map and is lost when the server restarts.
export const STATUSES = ['todo', 'in-progress', 'done'];

export function createTaskStore(seed = []) {
  const tasks = new Map();
  let nextId = 1; // never reused, so a deleted id can't come back

  function create({ title, status = 'todo' }) {
    const now = new Date().toISOString();
    const task = { id: nextId++, title, status, createdAt: now, updatedAt: now };
    tasks.set(task.id, task);
    return task;
  }

  seed.forEach(create);

  return {
    list({ status } = {}) {
      const all = [...tasks.values()];
      return status ? all.filter((t) => t.status === status) : all;
    },
    get: (id) => tasks.get(id),
    create,
    update(id, changes) {
      const task = tasks.get(id);
      if (!task) return undefined;
      Object.assign(task, changes, { updatedAt: new Date().toISOString() });
      return task;
    },
    remove: (id) => tasks.delete(id),
  };
}
