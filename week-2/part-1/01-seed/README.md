# NJ-W2-01 — Local / Atlas setup + seed data

Seeds **6 users, 3 projects, 40 tasks** into the `nj_w2` database, using the schema from the challenge sheet. It's a plain mongosh script, with no Mongoose and no npm packages.

```bash
npm run w2:seed
```

Re-running the script drops the three collections and inserts the same data again, so the result counts in `02-queries/queries.md` always match.

## Local MongoDB (macOS / Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community mongosh
brew services start mongodb-community
mongosh --eval 'db.runCommand({ ping: 1 })'   # { ok: 1 }
```

## Atlas (cloud) instead
1. Create a free M0 cluster at cloud.mongodb.com.
2. Under **Database Access**, add a user. Under **Network Access**, add your IP.
3. Click **Connect → Shell** and copy the `mongodb+srv://...` URI.
4. Seed it:
   ```bash
   mongosh "mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/" week-2/part-1/01-seed/seed.js
   ```

## Compass
Open Compass, click **New connection**, enter `mongodb://localhost:27017` (or the Atlas URI), and click **Connect**. Then open `nj_w2` and check `users`, `projects` and `tasks`.

## mongosh
```bash
mongosh nj_w2
db.tasks.countDocuments()          // 40
db.tasks.findOne()
```

## What the data covers
The data is shaped so that every challenge in `02-queries` has a meaningful answer:

| Needed by | Seeded |
|---|---|
| Q07 | `riya@mail.com` exists, so the case-insensitive `Riya@Mail.com` lookup finds it |
| Q08, Q16 | A mix of admin/member users, active/inactive users, and users who joined in 2025 and 2026 |
| Q09–Q10 | Statuses `todo` / `in_progress` / `done`, priorities 1–5, due dates on both sides of today |
| Q11–Q13 | Tags `backend`, `auth`, `old`, `urgent`, and titles containing "API" |
| Q14 | 5 tasks with `assignee: null` and 3 with no `assignee` field at all |
| Q15 | Checklists that are fully done, partly done, and empty |
| Q18 | One priority-5 task already tagged `urgent`, to show that `$addToSet` doesn't add it twice |
