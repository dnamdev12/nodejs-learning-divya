// NJ-W1-07 — list / add / delete tasks through the Express API
import { useEffect, useState } from 'react';
import { createTask, deleteTask, listTasks } from './api.js';

const FILTERS = ['', 'todo', 'in-progress', 'done'];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function refresh(status = filter) {
    setError('');
    try {
      setTasks(await listTasks(status));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Reload whenever the status filter changes
  useEffect(() => {
    setLoading(true);
    refresh(filter);
  }, [filter]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError('');
    try {
      await createTask(title);
      setTitle('');
      await refresh(); // re-fetch so the list respects the current filter
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await deleteTask(id);
      setTasks((current) => current.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="container">
      <h1>Tasks</h1>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          aria-label="New task title"
        />
        <button type="submit" disabled={saving || !title.trim()}>
          {saving ? 'Adding…' : 'Add'}
        </button>
      </form>

      <label className="filter">
        Status{' '}
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {FILTERS.map((f) => (
            <option key={f} value={f}>
              {f || 'all'}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="error" role="alert">{error}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="muted">No tasks.</p>
      ) : (
        <ul className="tasks">
          {tasks.map((task) => (
            <li key={task.id}>
              <span className={`badge ${task.status}`}>{task.status}</span>
              <span className="title">{task.title}</span>
              <button className="delete" onClick={() => handleDelete(task.id)} aria-label={`Delete ${task.title}`}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
