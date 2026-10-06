// NJ-W1-02 — Event loop quiz
// Predict the output order BEFORE running: node quiz.cjs
// (.cjs on purpose: in an ES module, top-level code already runs inside a
//  promise job, so Promise.then would print BEFORE process.nextTick.)

console.log('1: sync start');

setTimeout(() => console.log('6: setTimeout'), 0);

setImmediate(() => console.log('7: setImmediate'));

Promise.resolve().then(() => console.log('5: Promise.then'));

process.nextTick(() => console.log('4: process.nextTick'));

queueMicrotask(() => console.log('5b: queueMicrotask'));

console.log('2: sync end');
console.log('3: ...call stack is now empty');

/*
 Expected output:
   1: sync start
   2: sync end
   3: ...call stack is now empty
   4: process.nextTick      <- nextTick queue runs first after sync code
   5: Promise.then          <- then the microtask (promise) queue
   5b: queueMicrotask
   6: setTimeout            <- timers phase
   7: setImmediate          <- check phase

 Note: in the main module, setTimeout(0) vs setImmediate order is NOT guaranteed
 (depends on process timing). Inside an I/O callback, setImmediate always runs first.
*/
