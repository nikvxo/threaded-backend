export function requestLogger(req, res, next) {
  const start = Date.now();
  const originalEnd = res.end;

  res.end = function (...args) {
    const statusCode = res.statusCode || 500;
    const durationMs = Date.now() - start;

    if (process.env.NODE_ENV !== 'test') {
      console.log(JSON.stringify({
        method: req.method,
        url: req.originalUrl,
        statusCode,
        durationMs,
      }));
    }

    return originalEnd.apply(this, args);
  };

  next();
}
