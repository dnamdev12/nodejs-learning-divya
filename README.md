# Node.js Basics — Training Tasks

Hands-on Node.js tasks, organised week by week.

## Setup
```bash
nvm install   # uses the version in .nvmrc
nvm use
```

## Structure
```
week-1/
  part-1/
    01-env-setup     NJ-W1-01  Environment setup
    02-event-loop    NJ-W1-02  Event loop quiz + blocking demo
    03-cli-notes     NJ-W1-03  CLI Notes app (fs/promises)
    04-http-server   NJ-W1-04  Raw HTTP server (node:http)
  part-2/
    05-06-tasks-api  NJ-W1-05  Tasks REST API (Express, in-memory)
                     NJ-W1-06  Middlewares + central error handler
    07-react-client  NJ-W1-07  React app (list/add/delete) + CORS
week-2/
  part-1/
    01-seed          NJ-W2-01  Local/Atlas setup + seed data (mongosh)
    02-queries       NJ-W2-02  20 query challenges -> queries.md
    03-data-model    NJ-W2-03  users/projects/tasks/comments, embed vs reference
    04-index-lab     NJ-W2-04  100k docs, explain() before/after an index
week-3/
week-4/
```

## Run Week 1 Part 1
```bash
npm run w1:quiz                      # event loop quiz
npm run w1:blocking                  # /slow freezes /fast
npm run w1:notes -- add "my note"    # CLI notes: add | list | remove <id>
npm run w1:server                    # GET /notes, 404 for others
```

## Run Week 1 Part 2
```bash
npm install                 # Express + cors (Node 18+, see .nvmrc)
npm run w1:api              # Tasks API on http://localhost:4000 (x-api-key: dev-secret-key)
npm run w1:api:test         # automated API tests
npm run w1:react:install    # first time only
npm run w1:react            # React client on http://localhost:5173
```
Postman collection: `week-1/part-2/05-06-tasks-api/postman/tasks-api.postman_collection.json`

## Run Week 2 Part 1
Needs a running MongoDB plus `mongosh` (see `week-2/part-1/01-seed/README.md`).
```bash
npm run w2:seed        # 6 users, 3 projects, 40 tasks -> nj_w2
npm run w2:queries     # all 20 challenges with result counts (re-seed first: Q17-19 update data)
npm run w2:index-lab   # explain() before/after index on 100k docs -> nj_w2_lab
MONGO_URI="mongodb+srv://..." npm run w2:seed   # use Atlas instead of local
```
