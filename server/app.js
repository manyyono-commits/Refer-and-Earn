import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import multer from 'multer';
import { config } from './config.js';
import { HttpError } from './lib/HttpError.js';
import { adminRouter } from './routes/admin.js';
import { publicRouter } from './routes/public.js';
import { LEGACY_REDIRECTS, SEO_PAGES, SITE_URL, applyPageHead, postSeo } from '../shared/seo/pages.js';
import { Post } from './models/Post.js';
import { LIVE_POSTS } from './routes/public.js';

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
  // Blog posts can be long; everything else is small.
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/admin', adminRouter);
  app.use('/api', publicRouter);
  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Not found.')));



  // In production the same server also serves the built React app.
  if (config.isProduction) {
    const indexHtml = path.join(config.distDir, 'index.html');
    if (!existsSync(indexHtml)) {
      console.warn('[server] dist/ not found. Run "npm run build" before "npm start".');
    }
    // Vite fingerprints asset file names, so they can be cached forever.
    app.use('/assets', express.static(path.join(config.distDir, 'assets'), { maxAge: '365d', immutable: true }));
    // Sitemap = the static file plus every published blog post. Registered before
    // express.static so it overrides dist/sitemap.xml.
    app.get('/sitemap.xml', async (_req, res, next) => {
      try {
        const base = readFileSync(path.join(config.distDir, 'sitemap.xml'), 'utf8');
        const posts = await Post.find(LIVE_POSTS()).select('slug updatedAt seo.noindex').lean();
        const urls = posts
          .filter((p) => !p.seo?.noindex)
          .map(
            (p) =>
              `  <url>\n       <loc>${SITE_URL}/blog/${p.slug}/</loc>\n       <lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>\n       <priority>0.7000</priority>\n  </url>\n`,
          )
          .join('');
        res.set('Cache-Control', 'no-cache');
        res.type('application/xml').send(base.replace('</urlset>', `${urls}</urlset>`));
      } catch (err) {
        next(err);
      }
    });
    app.use(express.static(config.distDir, { index: false, maxAge: '1h' }));
    // Serve the article pages with their own <title>, meta and JSON-LD already in the HTML,
    // so crawlers and link previews get them without running JavaScript.
    // Old article URLs moved into the blog: permanent redirects keep links and rankings.
    for (const [from, to] of Object.entries(LEGACY_REDIRECTS)) {
      app.get(from.replace(/\/$/, ''), (_req, res) => res.redirect(301, to));
    }
    const pageHtml = new Map();
    for (const seo of SEO_PAGES) {
      app.get(seo.path.replace(/\/$/, ''), (req, res) => {
        if (req.path !== seo.path) return res.redirect(301, seo.path);
        if (!pageHtml.has(seo.path)) pageHtml.set(seo.path, applyPageHead(readFileSync(indexHtml, 'utf8'), seo));
        res.set('Cache-Control', 'no-cache');
        return res.type('html').send(pageHtml.get(seo.path));
      });
    }
    // Blog posts: SEO tags come from the database. Unknown or draft slugs get a 404 status
    // (the React app still renders its "not found" view).
    app.get('/blog/:slug', async (req, res, next) => {
      try {
        const slug = String(req.params.slug).toLowerCase();
        const post = await Post.findOne({ ...LIVE_POSTS(), slug }).lean();
        if (!post) return res.status(404).set('Cache-Control', 'no-cache').sendFile(indexHtml);
        const canonicalPath = `/blog/${post.slug}/`;
        if (req.path !== canonicalPath) return res.redirect(301, canonicalPath);
        res.set('Cache-Control', 'no-cache');
        return res.type('html').send(applyPageHead(readFileSync(indexHtml, 'utf8'), postSeo(post)));
      } catch (err) {
        return next(err);
      }
    });
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
