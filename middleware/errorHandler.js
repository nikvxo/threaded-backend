export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error('Unhandled request error', {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({ error: message });
}
