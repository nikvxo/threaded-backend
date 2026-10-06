import rateLimit from 'express-rate-limit';

const windowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const maxRequests = Number(process.env.AUTH_RATE_LIMIT_MAX) || 10;

export const loginLimiter = rateLimit({
  windowMs,
  limit: maxRequests,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' },
});