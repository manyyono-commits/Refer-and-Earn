import { existsSync } from 'node:fs';
import path from 'node:path';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import multer from 'multer';
import { config } from './config.js';
import { HttpError } from './lib/HttpError.js';
import { serveIcon } from './lib/icons.js';
import { adminRouter } from './routes/admin.js';
import { publicRouter } from './routes/public.js';

export function createServer() {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          // 'unsafe-inline' is needed for React style attributes (e.g. icon badge colours).
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          // App icons may be pasted as external https URLs.
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          // The host terminates HTTPS; don't force-upgrade when running locally over http.
          upgradeInsecureRequests: null,
        },
      },
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));

  app.use('/api/admin', adminRouter);
  app.use('/api', publicRouter);
  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Not found.')));

  app.get('/uploads/:file', serveIcon);
  app.use('/uploads', (_req, _res, next) => next(new HttpError(404, 'Image not found.')));

  // In production the same server also serves the built React app.
  if (config.isProduction) {
    const indexHtml = path.join(config.distDir, 'index.html');
    if (!existsSync(indexHtml)) {
      console.warn('[server] dist/ not found. Run "npm run build" before "npm start".');
    }
    // Vite fingerprints asset file names, so they can be cached forever.
    app.use('/assets', express.static(path.join(config.distDir, 'assets'), { maxAge: '365d', immutable: true }));
    app.use(express.static(config.distDir, { index: false, maxAge: '1h' }));
    app.get('/{*splat}', (_req, res) => {
      res.set('Cache-Control', 'no-cache');
      res.sendFile(indexHtml);
    });
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message, fields: err.fields });
    }
    if (err instanceof multer.MulterError) {
      const tooLarge = err.code === 'LIMIT_FILE_SIZE';
      return res.status(tooLarge ? 413 : 400).json({
        error: tooLarge ? 'Image must be 2 MB or smaller.' : err.message,
      });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Request body is not valid JSON.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong on the server.' });
  });

  return app;
}
