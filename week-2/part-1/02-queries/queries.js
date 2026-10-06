// NJ-W2-02 — runs all 20 challenges and prints each result count.
// Same queries as queries.md. Q17–Q19 change data, so seed first:
//   npm run w2:seed && npm run w2:queries

const target = db.getSiblingDB(process.env.DB_NAME || 'nj_w2');
const { tasks, users } = target;

const show = (no, label, count) => print(`${no}  ${label.padEnd(48)} ${count}`);

// ---------- Basic ----------
show('01', 'status todo', tasks.find({ status: 'todo' }).toArray().length);

show('02', 'title + status only, no _id', tasks.find({}, { title: 1, status: 1, _id: 0 }).toArray().length);

show('03', 'priority >= 4, priority desc, dueDate asc',
  tasks.find({ priority: { $gte: 4 } }).sort({ priority: -1, dueDate: 1 }).toArray().length);

show('04', 'countDocuments status done', tasks.countDocuments({ status: 'done' }));

show('05', '5 most recently created', tasks.find().sort({ createdAt: -1 }).limit(5).toArray().length);

const page = 2;
const perPage = 10;
show('06', 'page 2, 10 per page, newest first',
  tasks.find().sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage).toArray().length);

// Escape regex characters (the "." in the email) and anchor it, so only an exact match counts.
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const input = 'Riya@Mail.com';
show('07', `user by email (case-insensitive) "${input}"`,
  users.find({ email: { $regex: `^${escapeRegex(input)}$`, $options: 'i' } }).toArray().length);

show('08', 'active admins', users.find({ isActive: true, role: 'admin' }).toArray().length);

// ---------- Operators ----------
show('09', 'todo|in_progress AND priority 5',
  tasks.find({ status: { $in: ['todo', 'in_progress'] }, priority: 5 }).toArray().length);

show('10', 'overdue (dueDate < now, not done)',
  tasks.find({ dueDate: { $lt: new Date() }, status: { $ne: 'done' } }).toArray().length);

show('11', 'tagged backend', tasks.find({ tags: 'backend' }).toArray().length);

show('12', 'tagged auth AND backend', tasks.find({ tags: { $all: ['auth', 'backend'] } }).toArray().length);

show('13', 'title contains "api" (any case)', tasks.find({ title: { $regex: 'api', $options: 'i' } }).toArray().length);

show('14', 'no assignee (missing or null)',
  tasks.find({ $or: [{ assignee: { $exists: false } }, { assignee: null }] }).toArray().length);

show('15', 'at least one checklist item not done',
  tasks.find({ checklist: { $elemMatch: { done: false } } }).toArray().length);

show('16', 'skills has node AND joined in 2026',
  users.find({ skills: 'node', joinedAt: { $gte: new Date('2026-01-01'), $lt: new Date('2027-01-01') } }).toArray().length);

// ---------- Update ----------
const r17 = tasks.updateOne(
  { title: 'Fetch tasks from API' },
  { $set: { status: 'done', completedAt: new Date() } },
);
show('17', 'mark one task done (matched/modified)', `${r17.matchedCount}/${r17.modifiedCount}`);

const r18 = tasks.updateMany({ priority: 5 }, { $addToSet: { tags: 'urgent' } });
show('18', 'add tag urgent to priority 5 (matched/modified)', `${r18.matchedCount}/${r18.modifiedCount}`);

const r19a = tasks.updateOne({ title: 'Write API integration tests' }, { $inc: { estimateHours: 2 } });
const r19b = tasks.updateMany({ tags: 'old' }, { $pull: { tags: 'old' } });
show('19', '$inc one task / $pull old (modified)', `${r19a.modifiedCount} / ${r19b.modifiedCount}`);

// ---------- Challenge ----------
const byStatus = tasks.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } },
  { $sort: { _id: 1 } },
]).toArray();
show('20', 'count per status', JSON.stringify(byStatus));
