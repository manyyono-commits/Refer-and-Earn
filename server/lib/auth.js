import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { HttpError } from './HttpError.js';

const sha256 = (value) => crypto.createHash('sha256').update(String(value ?? '')).digest();

/** Constant-time password comparison. */
export function checkPassword(input) {
  if (!config.adminPassword) {
    throw new HttpError(503, 'Admin login is not configured. Set ADMIN_PASSWORD on the server.');
  }
  return crypto.timingSafeEqual(sha256(input), sha256(config.adminPassword));
}

export const signToken = () =>
  jwt.sign({ role: 'admin' }, config.jwtSecret, { expiresIn: config.tokenTtl, algorithm: 'HS256' });

export function requireAdmin(req, _res, next) {
  const header = req.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, 'Please log in.'));

  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    if (payload.role !== 'admin') throw new Error('wrong role');
    return next();
  } catch {
    return next(new HttpError(401, 'Your session has expired. Please log in again.'));
  }
}
