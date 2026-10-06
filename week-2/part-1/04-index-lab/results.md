# NJ-W2-04 — Index experiment: results

```bash
npm run w2:index-lab   # inserts 100k docs into nj_w2_lab.tasks_big and prints the numbers below
```

**Query under test:** "urgent todo tasks, soonest due first"
```js
db.tasks_big.find({ status: 'todo', priority: 5 }).sort({ dueDate: 1 }).explain('executionStats')
```

**Index added:**
```js
db.tasks_big.createIndex({ status: 1, priority: 1, dueDate: 1 })
```

## Before vs after (local MongoDB 9.0, 100,000 docs)

| | Before (no index) | After (compound index) |
|---|---|---|
| Plan | `SORT <- COLLSCAN` | `FETCH <- IXSCAN` (no `SORT` stage) |
| nReturned | 6,738 | 6,738 |
| totalKeysExamined | 0 | **6,738** |
| totalDocsExamined | **100,000** | **6,738** |
| executionTimeMillis | 32–39 ms | **6 ms** |

### How to read it
- **COLLSCAN** means MongoDB opened all 100,000 documents to find 6,738 matches, so 93% of that work was wasted. Then **SORT** sorted the matches in memory, which needs RAM and fails above 100 MB unless spilling to disk is allowed.
- **IXSCAN** means MongoDB walked the index straight to the `status: 'todo', priority: 5` section. Because `dueDate` is the next field in the index, the entries are already in due-date order, so the `SORT` stage disappears.
- The best case is `keysExamined ≈ docsExamined ≈ nReturned`, and this run hits it exactly: 6,738 / 6,738 / 6,738. Every key read was a match.
- The query gets faster as the collection grows. A COLLSCAN grows with the whole collection, while the IXSCAN grows only with the number of results.

### Why this field order (the ESR rule)
**E**quality fields first (`status`, `priority`), then the **S**ort field (`dueDate`), then **R**ange fields. If `dueDate` came first, MongoDB would have to scan every due date and filter on status and priority as it went.

### When the index does NOT help
```js
db.tasks_big.find({ priority: 5 })   // -> COLLSCAN, 100,000 docs examined
```
A compound index can only be used from its **leftmost prefix**: `status`, or `status + priority`, or all three fields. A query on `priority` alone skips `status`, so the planner falls back to a collection scan. This query would need its own index.

## What the index costs

| Cost | Measured |
|---|---|
| Disk / RAM | Index ≈ **1.2 MB** for 100k docs (data is 16.3 MB). Indexes perform best when they fit in RAM, so each one takes memory away from the data cache. |
| Build time | ≈ 115–130 ms here. On a large production collection, a build can take minutes and adds load. |
| Writes | Inserting 10k docs took **41–63 ms without the index and 60–79 ms with it**, roughly 15–45% slower. Every insert, every delete, and every update to an indexed field also has to update the index. |

## Summary: when an index helps and what it costs
- **It helps** when a query filters or sorts on the indexed fields (in prefix order) and returns a **small fraction** of the collection. The more selective the query, the bigger the win.
- **It helps less** when a query returns most of the collection, or when a field has very few distinct values (an index on `isActive` alone, say). Reading the index and then fetching documents can then cost more than one straight COLLSCAN.
- **It costs** storage and RAM, plus slower writes on every insert, delete and update to an indexed field. So index the queries the app actually runs (check with `explain()`), not every field. Remove indexes nothing uses: `$indexStats` shows how often each one is used.
