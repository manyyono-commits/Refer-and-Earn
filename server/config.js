import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(serverDir, '..');

const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('[config] MONGODB_URI is not set. Add it to your .env file (see .env.example).');
  process.exit(1);
}

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProduction) {
    console.error('[config] JWT_SECRET must be set in production.');
    process.exit(1);
  }
  jwtSecret = crypto.randomBytes(32).toString('hex');
  console.warn('[config] JWT_SECRET is not set: using a random secret. Admin sessions end when the server restarts.');
}

const adminPassword = process.env.ADMIN_PASSWORD || '';
if (!adminPassword) {
  console.warn('[config] ADMIN_PASSWORD is not set: admin login is disabled. Add it to your .env file.');
} else if (adminPassword.length < 8) {
  console.warn('[config] ADMIN_PASSWORD is shorter than 8 characters. Use a stronger password.');
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  isProduction,
  // Most hosts (Render, Railway, Heroku, Nginx) put the app behind one proxy.
  trustProxy: process.env.TRUST_PROXY ? process.env.TRUST_PROXY === 'true' : isProduction,
  mongoUri,
  adminPassword,
  jwtSecret,
  tokenTtl: '12h',
  seedDir: path.join(serverDir, 'seed'),
  distDir: path.join(rootDir, 'dist'),
  maxUploadBytes: 2 * 1024 * 1024,
};
