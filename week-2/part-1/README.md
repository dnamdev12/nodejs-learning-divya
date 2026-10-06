# Week 2 · Part 1 — MongoDB Fundamentals

| Task | Folder | What |
|---|---|---|
| NJ-W2-01 | `01-seed/` | Local / Atlas setup, Compass + mongosh, seed 6 users / 3 projects / 40 tasks |
| NJ-W2-02 | `02-queries/` | 20 query challenges → `queries.md` (each query + result count) |
| NJ-W2-03 | `03-data-model/` | users / projects / tasks / comments design, with the embed vs reference reasoning |
| NJ-W2-04 | `04-index-lab/` | 100k docs, `explain()` before and after an index, and what the index costs |

```bash
npm run w2:seed        # fresh nj_w2 data
npm run w2:queries     # run all 20 challenges, print the counts
npm run w2:index-lab   # index experiment (separate DB: nj_w2_lab)
```

These need `mongosh` and a running MongoDB (local or Atlas). Node isn't involved.
