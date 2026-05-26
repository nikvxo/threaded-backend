// lib/jwt.js
import jwt from 'jsonwebtoken';
import { config } from './config.js';

const JWT_SECRET = config.jwtSecret;
const JWT_EXPIRES_IN = '7d';

export function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}