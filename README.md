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
