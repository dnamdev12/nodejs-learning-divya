# NJ-W1-02 — Event loop quiz + blocking demo

## Quiz
```bash
node quiz.cjs
```
Order: sync code → `process.nextTick` → Promise microtasks → `setTimeout` (timers) → `setImmediate` (check).

## Blocking demo
```bash
node blocking-server.js
# terminal 2
curl localhost:3000/slow
# terminal 3 (immediately)
curl localhost:3000/fast   # waits ~5s until /slow finishes
```
`/slow` runs a synchronous CPU loop, so the event loop can't serve `/fast` until it ends.
Fixes: worker threads, child processes, or splitting work into async chunks.
