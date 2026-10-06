console.log("1");

setTimeout(() => {
  console.log("2");

  Promise.resolve().then(() => {
    console.log("3");
  });

  process.nextTick(() => {
    console.log("4");
  });
}, 0);

Promise.resolve().then(() => {
  console.log("5");

  process.nextTick(() => {
    console.log("6");
  });
});

process.nextTick(() => {
  console.log("7");

  Promise.resolve().then(() => {
    console.log("8");
  });
});

console.log("9");
