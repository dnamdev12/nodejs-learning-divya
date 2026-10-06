# NJ-W2-03 — Data model: users / projects / tasks / comments

A small project-management app (like a basic Jira or Trello). This design builds on the schema used for the query challenges and adds `comments`.

## The rule I followed

> **Embed** data that belongs to one parent, is read together with that parent, and stays small (bounded).
> **Reference** data that has its own life, is shared, or can grow without limit.

Two hard limits drive this: one document can be at most **16 MB**, and every write to a big document rewrites it. So "can this array keep growing?" is the first question for every relationship.

## Collections

```
users ──< projects.members (ref array)
  │            │
  │            └──< tasks.project (ref)
  │                    │  checklist[] (embedded)
  └──< tasks.assignee  └──< comments.task (ref)
  └──< comments.author (ref + name snapshot)
```

### users
```js
{
  _id: ObjectId,
  name: 'Riya Sharma',
  email: 'riya@mail.com',        // stored lowercase, unique index
  role: 'admin' | 'member',
  skills: ['react', 'node'],     // embedded: a short list of plain values
  isActive: true,
  joinedAt: ISODate
}
```

### projects
```js
{
  _id: ObjectId,
  name: 'Tasks API',
  owner: ObjectId,               // ref -> users
  members: [ObjectId],           // ref array -> users
  status: 'active' | 'archived',
  createdAt: ISODate
}
```

### tasks
```js
{
  _id: ObjectId,
  title: 'Implement JWT login',
  status: 'todo' | 'in_progress' | 'done',
  priority: 1..5,
  dueDate: ISODate,
  tags: ['backend', 'auth'],
  assignee: ObjectId | null,     // ref -> users
  project: ObjectId,             // ref -> projects
  estimateHours: 6,
  checklist: [{ text: 'Sign tokens', done: true }],  // embedded
  commentCount: 3,               // denormalised counter, see below
  createdAt: ISODate,
  completedAt: ISODate | null
}
```

### comments (new)
```js
{
  _id: ObjectId,
  task: ObjectId,                // ref -> tasks
  author: { _id: ObjectId, name: 'Riya Sharma' },  // ref + snapshot of the name
  body: 'Refresh token should expire in 7 days',
  createdAt: ISODate,
  editedAt: ISODate | null
}
```

## Embed vs reference: each decision

| Relationship | Choice | Why |
|---|---|---|
| user → skills | **Embed** (array of strings) | A handful of values that only make sense on that user. Always read with the user. |
| task → checklist items | **Embed** | Owned by one task, read and edited together with it, and bounded (a checklist has maybe 10 items). Q15 (`$elemMatch`) works directly on it, with no join. |
| task → tags | **Embed** (array of strings) | Small and bounded. A multikey index on `tags` supports Q11 and Q12. |
| project → owner | **Reference** | A user exists without the project and owns many projects. Copying user data into every project would go stale whenever a name or email changes. |
| project → members | **Reference array** on the project | Many-to-many, but a team is small (tens of people), so an array of ids in the project stays bounded. I didn't also store `projects[]` on the user: keeping two arrays in sync is error-prone, and an index on `projects.members` answers "which projects is this user in?" just as well. |
| task → project | **Reference** (`project` on the task) | A project can hold thousands of tasks. Embedding them would push the project toward 16 MB, and every task edit would rewrite the whole project. Each task is also queried, sorted and paginated on its own (Q03, Q06). |
| task → assignee | **Reference**, nullable | Users change (name, active flag). `null` means unassigned, which is what Q14 relies on. |
| task → comments | **Reference** (`task` on each comment) | Comments are unbounded: a busy task can collect hundreds. They're paginated separately ("load older comments"), and the task list never needs them. Embedding them would make every task read heavy and risk the size limit. |
| comment → author | **Reference + snapshot** `{ _id, name }` | A comment is shown with its author's name every time. Storing the name avoids a `$lookup` per comment. If a user renames, a single `updateMany({ 'author._id': id }, { $set: { 'author.name': ... } })` fixes it, and renames are rare. |
| task → commentCount | **Denormalised counter** | The task list shows "💬 3" without counting comments. It's updated with `$inc` whenever a comment is added or removed. |

### Rejected alternatives
- **Embedding tasks inside projects.** Simple at first, but a project's document grows with every task, so it fails as soon as the project gets busy.
- **Embedding comments inside tasks.** Fine for a "last 3 comments" preview, but not for the full thread. If a preview is needed later, use the *subset pattern*: store `recentComments` (at most 3) on the task and keep the full list in `comments`.
- **`tasks[]` array on the user.** It duplicates `tasks.assignee`, and the two can disagree.

## Indexes this model needs

| Collection | Index | Serves |
|---|---|---|
| users | `{ email: 1 }` **unique** | Login and lookup by email. Storing emails lowercase lets an exact match use the index, unlike a case-insensitive regex (Q07). |
| projects | `{ members: 1 }` | "My projects" |
| tasks | `{ project: 1, status: 1, dueDate: 1 }` | Project board: filter by project and status, sort by due date |
| tasks | `{ assignee: 1, status: 1 }` | "My open tasks" |
| tasks | `{ tags: 1 }` (multikey) | Tag filters |
| comments | `{ task: 1, createdAt: -1 }` | A task's comment thread, newest first and paginated |

## Typical reads

```js
// Task detail page: the task plus its latest 20 comments (2 queries, both indexed)
const task = db.tasks.findOne({ _id: id })
const comments = db.comments.find({ task: id }).sort({ createdAt: -1 }).limit(20)

// Project board with assignee names (one aggregation, joins only the page we show)
db.tasks.aggregate([
  { $match: { project: projectId, status: { $ne: 'done' } } },
  { $sort: { dueDate: 1 } },
  { $limit: 50 },
  { $lookup: { from: 'users', localField: 'assignee', foreignField: '_id', as: 'assignee',
               pipeline: [{ $project: { name: 1 } }] } },
  { $unwind: { path: '$assignee', preserveNullAndEmptyArrays: true } },
])
```
