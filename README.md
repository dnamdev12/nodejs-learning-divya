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
