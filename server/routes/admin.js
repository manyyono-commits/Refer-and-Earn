import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { checkPassword, requireAdmin, signToken } from '../lib/auth.js';
import { HttpError } from '../lib/HttpError.js';
import { iconUpload, removeUnusedIcon, saveIcon } from '../lib/icons.js';
import { validateApp } from '../lib/validateApp.js';
import { App, serializeApp } from '../models/App.js';
import { validatePost } from '../lib/validatePost.js';
import { Post, serializePost, serializePostSummary } from '../models/Post.js';

export const adminRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

adminRouter.post('/login', loginLimiter, (req, res) => {
  if (!checkPassword(req.body?.password)) throw new HttpError(401, 'Incorrect password.');
  res.json({ token: signToken() });
});

// Everything below requires a valid admin token.
adminRouter.use(requireAdmin);

const SLUG_TAKEN = new HttpError(400, 'Please fix the highlighted fields.', {
  slug: 'Another app already uses this slug.',
});

const assertSlugFree = async (slug, selfId) => {
  if (await App.exists({ slug, ...(selfId && { _id: { $ne: selfId } }) })) throw SLUG_TAKEN;
};

// The unique index is the final guard if two saves race past assertSlugFree.
const rethrowDuplicate = (err) => {
  if (err?.code === 11000) throw SLUG_TAKEN;
  throw err;
};

const findApp = async (id) => {
  const app = mongoose.isValidObjectId(id) ? await App.findById(id).lean() : null;
  if (!app) throw new HttpError(404, 'App not found.');
  return app;
};

adminRouter.post('/apps', async (req, res) => {
  const clean = validateApp(req.body ?? {});
  await assertSlugFree(clean.slug);

  // New listings go to the top so they appear first on the site.
  const first = await App.findOne().sort({ position: 1 }).select('position').lean();
  const created = await App.create({ ...clean, position: (first?.position ?? 1) - 1 }).catch(rethrowDuplicate);

  res.status(201).json(serializeApp(created.toObject()));
});

// Registered before /apps/:id so "order" isn't read as an id.
adminRouter.put('/apps/order', async (req, res) => {
  const ids = req.body?.ids;
  const current = (await App.find().select('_id').lean()).map((app) => String(app._id));
  const valid =
    Array.isArray(ids) &&
    ids.length === current.length &&
    new Set(ids).size === ids.length &&
    ids.every((id) => current.includes(id));
  if (!valid) throw new HttpError(400, 'The order must list every app exactly once.');

  await App.bulkWrite(
    ids.map((id, position) => ({ updateOne: { filter: { _id: id }, update: { $set: { position } } } })),
  );
  res.json({ ok: true });
});

adminRouter.patch('/apps/:id', async (req, res) => {
  const existing = await findApp(req.params.id);
  const { id: _id, ...changes } = req.body ?? {};
  const clean = validateApp({ ...serializeApp(existing), ...changes });
  await assertSlugFree(clean.slug, existing._id);

  const updated = await App.findByIdAndUpdate(existing._id, clean, { new: true, runValidators: true })
    .lean()
    .catch(rethrowDuplicate);

  if (existing.icon !== updated.icon) await removeUnusedIcon(existing.icon);
  res.json(serializeApp(updated));
});

adminRouter.delete('/apps/:id', async (req, res) => {
  const existing = await findApp(req.params.id);
  await App.deleteOne({ _id: existing._id });
  await removeUnusedIcon(existing.icon);
  res.json({ ok: true, id: String(existing._id) });
});

adminRouter.post('/upload', iconUpload, async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No image was uploaded.');
  const folder = req.query.folder === 'blog' ? '/blog' : '/app-icons';
  res.status(201).json({ url: await saveIcon(req.file, folder) });
});

// ---------- Blog posts ----------

const POST_SLUG_TAKEN = new HttpError(400, 'Please fix the highlighted fields.', {
  slug: 'Another post already uses this slug.',
});

const assertPostSlugFree = async (slug, selfId) => {
  if (await Post.exists({ slug, ...(selfId && { _id: { $ne: selfId } }) })) throw POST_SLUG_TAKEN;
};

const rethrowPostDuplicate = (err) => {
  if (err?.code === 11000) throw POST_SLUG_TAKEN;
  throw err;
};

const findPost = async (id) => {
  const post = mongoose.isValidObjectId(id) ? await Post.findById(id).lean() : null;
  if (!post) throw new HttpError(404, 'Post not found.');
  return post;
};

// Images a post points at, so replaced ones can be cleaned up.
const postImages = (p) => [p.coverImage, p.seo?.ogImage].filter(Boolean);

adminRouter.get('/posts', async (_req, res) => {
  const posts = await Post.find().sort({ updatedAt: -1 }).lean();
  res.json({ posts: posts.map(serializePostSummary) });
});

adminRouter.get('/posts/:id', async (req, res) => {
  res.json(serializePost(await findPost(req.params.id)));
});

adminRouter.post('/posts', async (req, res) => {
  const clean = validatePost(req.body ?? {});
  await assertPostSlugFree(clean.slug);
  const created = await Post.create(clean).catch(rethrowPostDuplicate);
  res.status(201).json(serializePost(created.toObject()));
});

adminRouter.patch('/posts/:id', async (req, res) => {
  const existing = await findPost(req.params.id);
  const { id: _id, createdAt: _c, updatedAt: _u, ...changes } = req.body ?? {};
  const merged = { ...serializePost(existing), ...changes };
  // Keep the original publish date when a published post is edited.
  if (!changes.publishedAt && existing.publishedAt) merged.publishedAt = existing.publishedAt;
  const clean = validatePost(merged);
  await assertPostSlugFree(clean.slug, existing._id);

  const updated = await Post.findByIdAndUpdate(existing._id, clean, { new: true, runValidators: true })
    .lean()
    .catch(rethrowPostDuplicate);

  const kept = new Set(postImages(updated));
  for (const img of postImages(existing)) if (!kept.has(img)) await removeUnusedIcon(img);
  res.json(serializePost(updated));
});

adminRouter.delete('/posts/:id', async (req, res) => {
  const existing = await findPost(req.params.id);
  await Post.deleteOne({ _id: existing._id });
  for (const img of postImages(existing)) await removeUnusedIcon(img);
  res.json({ ok: true, id: String(existing._id) });
});
