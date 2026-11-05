import { Router } from 'express';
import { isDbConnected } from '../db.js';
import { HttpError } from '../lib/HttpError.js';
import { App, serializeApp } from '../models/App.js';
import { SiteContent } from '../models/SiteContent.js';
import { Post, serializePost, serializePostSummary } from '../models/Post.js';

/** Published posts whose publish date has arrived. */
export const LIVE_POSTS = () => ({ status: 'published', publishedAt: { $lte: new Date() } });

export const publicRouter = Router();

// Used by hosting platforms to check the service is up.
publicRouter.get('/health', (_req, res) => {
  const db = isDbConnected();
  res.status(db ? 200 : 503).json({ status: db ? 'ok' : 'degraded', db });
});

// `no-cache` makes browsers revalidate with the ETag every time, so admin
// changes show up immediately while unchanged data costs only a 304.
publicRouter.use((_req, res, next) => {
  res.set('Cache-Control', 'no-cache');
  next();
});

publicRouter.get('/apps', async (_req, res) => {
  const apps = await App.find().sort({ position: 1, createdAt: -1 }).lean();
  res.json({ apps: apps.map(serializeApp) });
});

publicRouter.get('/site', async (_req, res) => {
  const site = await SiteContent.findOne({ key: 'main' }).lean();
  if (!site) throw new HttpError(404, 'Site content has not been seeded. Run "npm run seed".');
  res.json(site.content);
});

publicRouter.get('/posts', async (_req, res) => {
  const posts = await Post.find(LIVE_POSTS()).sort({ publishedAt: -1 }).limit(500).lean();
  res.json({ posts: posts.map(serializePostSummary) });
});

publicRouter.get('/posts/:slug', async (req, res) => {
  const post = await Post.findOne({ ...LIVE_POSTS(), slug: String(req.params.slug).toLowerCase() }).lean();
  if (!post) throw new HttpError(404, 'Post not found.');
  res.json(serializePost(post));
});
