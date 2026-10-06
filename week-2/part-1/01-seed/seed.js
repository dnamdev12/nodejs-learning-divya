// NJ-W2-01 — seeds 6 users, 3 projects, 40 tasks (mongosh script, no Mongoose)
// Run: npm run w2:seed   (or: mongosh "<uri>" week-2/part-1/01-seed/seed.js)
// Re-running drops and re-creates the data, so query counts stay the same.

const DB_NAME = process.env.DB_NAME || 'nj_w2';
const target = db.getSiblingDB(DB_NAME);

const DAY = 24 * 60 * 60 * 1000;
const d = (iso) => new Date(`${iso}T09:00:00Z`);

// ---------- users ----------
const u = {
  riya: new ObjectId(),
  arjun: new ObjectId(),
  divya: new ObjectId(),
  kabir: new ObjectId(),
  neha: new ObjectId(),
  sameer: new ObjectId(),
};

const users = [
  { _id: u.riya, name: 'Riya Sharma', email: 'riya@mail.com', role: 'admin', skills: ['react', 'node'], isActive: true, joinedAt: d('2025-11-10') },
  { _id: u.arjun, name: 'Arjun Mehta', email: 'arjun@mail.com', role: 'member', skills: ['node', 'mongodb'], isActive: true, joinedAt: d('2026-01-15') },
  { _id: u.divya, name: 'Divya Namdev', email: 'divya@mail.com', role: 'admin', skills: ['react', 'node', 'mongodb'], isActive: true, joinedAt: d('2026-03-02') },
  { _id: u.kabir, name: 'Kabir Singh', email: 'kabir@mail.com', role: 'member', skills: ['react'], isActive: true, joinedAt: d('2026-02-20') },
  { _id: u.neha, name: 'Neha Verma', email: 'neha@mail.com', role: 'admin', skills: ['node'], isActive: false, joinedAt: d('2025-08-05') },
  { _id: u.sameer, name: 'Sameer Khan', email: 'sameer@mail.com', role: 'member', skills: ['node', 'react'], isActive: false, joinedAt: d('2026-05-12') },
];

// ---------- projects ----------
const p = { api: new ObjectId(), dash: new ObjectId(), legacy: new ObjectId() };

const projects = [
  { _id: p.api, name: 'Tasks API', owner: u.riya, members: [u.riya, u.arjun, u.divya], status: 'active', createdAt: d('2026-06-01') },
  { _id: p.dash, name: 'React Dashboard', owner: u.divya, members: [u.divya, u.kabir, u.sameer], status: 'active', createdAt: d('2026-06-10') },
  { _id: p.legacy, name: 'Legacy Migration', owner: u.neha, members: [u.neha, u.arjun], status: 'archived', createdAt: d('2026-05-15') },
];

// ---------- tasks ----------
// assignee: a user key, null (explicitly unassigned) or MISSING (field left out).
const MISSING = Symbol('missing');
const checklist = (...items) => items.map(([text, done]) => ({ text, done: Boolean(done) }));

let n = 0;
function task(title, status, priority, due, tags, assignee, project, estimateHours, list = []) {
  n += 1;
  const dueDate = d(due);
  // Created 50 days before it was due (so never in the future); minus n minutes keeps every createdAt unique (stable sorts).
  const createdAt = new Date(dueDate.getTime() - 50 * DAY - n * 60 * 1000);
  const doc = { title, status, priority, dueDate, tags, project: p[project], estimateHours, checklist: list, createdAt };
  if (assignee !== MISSING) doc.assignee = assignee === null ? null : u[assignee];
  doc.completedAt = status === 'done' ? new Date(dueDate.getTime() - 2 * DAY) : null;
  return doc;
}

const tasks = [
  // Tasks API
  task('Design REST API endpoints', 'done', 4, '2026-08-10', ['backend', 'api'], 'riya', 'api', 3, checklist(['List resources', 1], ['Write OpenAPI draft', 1])),
  task('Set up Express project', 'done', 3, '2026-08-12', ['backend', 'setup'], 'arjun', 'api', 2),
  task('Implement JWT login', 'in_progress', 5, '2026-09-25', ['backend', 'auth', 'urgent'], 'arjun', 'api', 6, checklist(['Sign tokens', 1], ['Refresh tokens', 0])),
  task('Password reset flow', 'todo', 5, '2026-10-20', ['backend', 'auth'], null, 'api', 5, checklist(['Email template', 0], ['Token expiry', 0])),
  task('Rate-limit login API', 'todo', 4, '2026-09-30', ['backend', 'auth', 'security'], 'divya', 'api', 3),
  task('Write API integration tests', 'in_progress', 4, '2026-10-15', ['backend', 'testing', 'api'], 'divya', 'api', 5, checklist(['Happy paths', 1], ['Error paths', 0])),
  task('Add request logging middleware', 'done', 2, '2026-08-20', ['backend'], 'arjun', 'api', 1, checklist(['Morgan setup', 1])),
  task('Central error handler', 'done', 3, '2026-08-25', ['backend'], 'riya', 'api', 2),
  task('Pagination for tasks API', 'in_progress', 3, '2026-10-10', ['backend', 'api'], 'arjun', 'api', 3),
  task('Role-based access (admin/member)', 'todo', 5, '2026-09-28', ['backend', 'auth'], 'riya', 'api', 4, checklist(['Define roles', 1], ['Guard routes', 0])),
  task('Seed script for dev DB', 'done', 2, '2026-09-01', ['backend', 'mongodb'], 'divya', 'api', 1),
  task('Remove deprecated v0 endpoints', 'todo', 1, '2026-11-05', ['backend', 'old'], MISSING, 'api', 2),
  task('Document API in README', 'todo', 2, '2026-10-25', ['docs', 'api'], null, 'api', 1),
  task('Validate request bodies', 'done', 4, '2026-09-05', ['backend', 'api'], 'arjun', 'api', 2, checklist(['Schemas', 1], ['Error messages', 1])),
  task('CORS allowlist config', 'done', 3, '2026-09-08', ['backend', 'security'], 'divya', 'api', 1),
  task('Session timeout handling', 'in_progress', 5, '2026-09-20', ['backend', 'auth'], 'divya', 'api', 3),
  // React Dashboard
  task('Dashboard layout', 'done', 3, '2026-08-18', ['frontend', 'react'], 'kabir', 'dash', 4, checklist(['Header', 1], ['Sidebar', 1])),
  task('Login page UI', 'done', 4, '2026-08-28', ['frontend', 'react', 'auth'], 'kabir', 'dash', 3),
  task('Fetch tasks from API', 'in_progress', 4, '2026-10-08', ['frontend', 'api'], 'divya', 'dash', 2, checklist(['api.js wrapper', 1], ['Loading state', 0])),
  task('Task filters by status', 'todo', 3, '2026-10-18', ['frontend', 'react'], 'sameer', 'dash', 3),
  task('Dark mode toggle', 'todo', 1, '2026-11-20', ['frontend', 'ui'], null, 'dash', 2),
  task('Charts for task stats', 'todo', 2, '2026-11-10', ['frontend', 'charts'], MISSING, 'dash', 5),
  task('Fix API error toast', 'in_progress', 5, '2026-09-29', ['frontend', 'bug', 'api'], 'kabir', 'dash', 1, checklist(['Reproduce', 1], ['Fix', 0])),
  task('Form validation on add task', 'done', 3, '2026-09-10', ['frontend', 'react'], 'sameer', 'dash', 2),
  task('Accessibility audit', 'todo', 3, '2026-10-30', ['frontend', 'a11y'], 'kabir', 'dash', 4, checklist(['Keyboard nav', 0], ['Contrast', 0])),
  task('Replace class components', 'todo', 2, '2026-09-15', ['frontend', 'react', 'old'], 'sameer', 'dash', 6),
  task('Protected routes', 'in_progress', 5, '2026-10-12', ['frontend', 'auth'], 'divya', 'dash', 3),
  task('Unit tests for hooks', 'in_progress', 3, '2026-10-22', ['frontend', 'testing'], 'sameer', 'dash', 4, checklist(['useTasks', 1], ['useAuth', 1])),
  task('Responsive mobile view', 'done', 2, '2026-09-18', ['frontend', 'ui'], 'kabir', 'dash', 3),
  task('Optimistic delete', 'todo', 4, '2026-10-05', ['frontend', 'react'], null, 'dash', 2),
  task('Build pipeline for dashboard', 'done', 3, '2026-09-22', ['devops'], 'divya', 'dash', 2),
  task('User profile page', 'in_progress', 2, '2026-10-28', ['frontend', 'react'], 'kabir', 'dash', 3),
  // Legacy Migration
  task('Export legacy MySQL data', 'done', 4, '2026-08-15', ['backend', 'migration'], 'neha', 'legacy', 5, checklist(['Dump tables', 1])),
  task('Map legacy schema to MongoDB', 'done', 5, '2026-08-22', ['backend', 'mongodb', 'migration'], 'arjun', 'legacy', 4),
  task('Migrate legacy auth tables', 'in_progress', 5, '2026-09-12', ['backend', 'auth', 'migration'], 'neha', 'legacy', 6, checklist(['Users', 1], ['Sessions', 0])),
  task('Retire old cron jobs', 'todo', 3, '2026-09-26', ['backend', 'old'], 'arjun', 'legacy', 2),
  task('Verify migrated record counts', 'todo', 4, '2026-10-14', ['backend', 'migration'], MISSING, 'legacy', 3),
  task('Archive legacy API docs', 'done', 1, '2026-09-03', ['docs', 'old'], 'neha', 'legacy', 1),
  task('Legacy API shutdown plan', 'todo', 3, '2026-11-15', ['backend', 'api'], null, 'legacy', 2),
  task('Load test migrated API', 'in_progress', 4, '2026-10-02', ['backend', 'testing', 'api'], 'arjun', 'legacy', 4, checklist(['Write k6 script', 0])),
];

// ---------- write ----------
target.users.drop();
target.projects.drop();
target.tasks.drop();

target.users.insertMany(users);
target.users.createIndex({ email: 1 }, { unique: true });
target.projects.insertMany(projects);
target.tasks.insertMany(tasks);

print(`Seeded "${DB_NAME}": users=${target.users.countDocuments()}, projects=${target.projects.countDocuments()}, tasks=${target.tasks.countDocuments()}`);
