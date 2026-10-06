// NJ-W1-06 — logs "METHOD /url STATUS duration" once the response has been sent
export function requestLogger(log = console.log) {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
    // 'finish' fires after the response is sent, so the status code is final
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);
    });
    next();
  };
}
