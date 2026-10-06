# NJ-W2-02 — 20 MongoDB Query Challenges

Solved in **mongosh**, without Mongoose, against the data from `01-seed/seed.js` (6 users, 3 projects, 40 tasks).

```bash
npm run w2:seed      # fresh data (drops and re-creates the collections)
npm run w2:queries   # runs every query below and prints its count
mongosh nj_w2        # or open a shell and paste the queries one by one
```

> Result counts are from a fresh seed, with the queries run **in order**. Q17–Q19 change data, so Q20 includes the change from Q17.
> Q10 compares against "now", so its count is as of **2026-10-06**.

---

## Basic

### 01 — Find all tasks with status `todo`
```js
db.tasks.find({ status: 'todo' })
```
**Result: 14**

### 02 — Show only `title` and `status` of every task, hide `_id`
```js
db.tasks.find({}, { title: 1, status: 1, _id: 0 })
```
**Result: 40** (every task, two fields each)

### 03 — Priority ≥ 4, sorted by priority (high → low), then dueDate (earliest first)
```js
db.tasks.find({ priority: { $gte: 4 } }).sort({ priority: -1, dueDate: 1 })
```
**Result: 18**. The first result is "Map legacy schema to MongoDB" (priority 5, due 2026-08-22).

### 04 — How many tasks are `done`?
```js
db.tasks.countDocuments({ status: 'done' })
```
**Result: 15**

### 05 — The 5 most recently created tasks
```js
db.tasks.find().sort({ createdAt: -1 }).limit(5)
```
**Result: 5**. The newest is "Dark mode toggle".

### 06 — Page 2 of all tasks, 10 per page, newest first
```js
const page = 2, perPage = 10
db.tasks.find().sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage)
```
**Result: 10** (tasks 11–20 by creation date, newest first)

### 07 — Find a user by email, case-insensitive (`Riya@Mail.com` = `riya@mail.com`)
```js
db.users.find({ email: { $regex: '^riya@mail\\.com$', $options: 'i' } })
```
**Result: 1** (Riya Sharma)

`^` and `$` force a whole-string match, and `\\.` matches a real dot. Without the anchors, `bob.riya@mail.com` would match too.

### 08 — All active users with role `admin`
```js
db.users.find({ isActive: true, role: 'admin' })
```
**Result: 2** (Riya, Divya). Neha is an admin but inactive.

## Operators

### 09 — Tasks that are `todo` or `in_progress` **and** priority 5
```js
db.tasks.find({ status: { $in: ['todo', 'in_progress'] }, priority: 5 })
```
**Result: 7**

### 10 — Overdue: dueDate before today and status is not `done`
```js
db.tasks.find({ dueDate: { $lt: new Date() }, status: { $ne: 'done' } })
```
**Result: 10** (as of 2026-10-06)

### 11 — All tasks tagged `backend`
```js
db.tasks.find({ tags: 'backend' })
```
**Result: 22**. On an array field, a plain value matches if **any** element equals it.

### 12 — Tasks tagged with **both** `auth` and `backend`
```js
db.tasks.find({ tags: { $all: ['auth', 'backend'] } })
```
**Result: 6**

### 13 — Tasks whose title contains "api" (any case)
```js
db.tasks.find({ title: { $regex: 'api', $options: 'i' } })
```
**Result: 10**

### 14 — Tasks with no assignee (field missing or `null`)
```js
db.tasks.find({ $or: [{ assignee: { $exists: false } }, { assignee: null }] })
```
**Result: 8** (5 have `assignee: null`, 3 have no `assignee` field)

Shortcut: `{ assignee: null }` on its own also matches a missing field. The `$or` version just states the intent explicitly.

### 15 — Tasks where at least one checklist item is still not done
```js
db.tasks.find({ checklist: { $elemMatch: { done: false } } })
```
**Result: 9**

### 16 — Users who have `node` in skills and joined in 2026
```js
db.users.find({
  skills: 'node',
  joinedAt: { $gte: new Date('2026-01-01'), $lt: new Date('2027-01-01') },
})
```
**Result: 3** (Arjun, Divya, Sameer)

## Update

### 17 — Mark one task `done` and set `completedAt` to now
```js
db.tasks.updateOne(
  { title: 'Fetch tasks from API' },
  { $set: { status: 'done', completedAt: new Date() } },
)
```
**Result: matchedCount 1, modifiedCount 1**

### 18 — Add tag `urgent` to all priority-5 tasks, without duplicates
```js
db.tasks.updateMany({ priority: 5 }, { $addToSet: { tags: 'urgent' } })
```
**Result: matchedCount 8, modifiedCount 7**. "Implement JWT login" already had `urgent`, so `$addToSet` left it alone. `$push` would have added a duplicate.

### 19 — Increase `estimateHours` by 2 for one task, then remove tag `old` from all tasks
```js
db.tasks.updateOne({ title: 'Write API integration tests' }, { $inc: { estimateHours: 2 } })
db.tasks.updateMany({ tags: 'old' }, { $pull: { tags: 'old' } })
```
**Result: $inc modified 1 (5 → 7 hours); $pull modified 4**

## Challenge

### 20 — Count of tasks per status (first aggregation)
```js
db.tasks.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } },
  { $sort: { _id: 1 } },
])
```
**Result: 3 groups**
```js
{ _id: 'done', count: 16 }        // 15 seeded + 1 from Q17
{ _id: 'in_progress', count: 10 }
{ _id: 'todo', count: 14 }
```
