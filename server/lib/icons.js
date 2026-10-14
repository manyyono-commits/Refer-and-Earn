import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import mongoose from 'mongoose';
import multer from 'multer';
import { config } from '../config.js';
import { iconBucket } from '../db.js';
import { App } from '../models/App.js';
import { HttpError } from './HttpError.js';

// SVG is deliberately excluded: it can carry scripts.
const EXTENSIONS = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const URL_RE = /^\/uploads\/([a-f0-9]{24})\.[a-z]+$/;

/** Parses the multipart upload into memory; it is then written to GridFS. */
export const iconUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) cb(null, true);
    else cb(new HttpError(400, 'Only PNG, JPG, WEBP or GIF images are allowed.'));
  },
}).single('icon');

/** Stores an image in GridFS and returns its public URL. */
export async function saveIcon({ buffer, mimetype, originalname }) {
  const upload = iconBucket().openUploadStream(originalname || 'icon', {
    metadata: { contentType: mimetype },
  });
  await pipeline(Readable.from(buffer), upload);
  return `/uploads/${upload.id}${EXTENSIONS[mimetype]}`;
}

const idFromUrl = (url) => {
  const match = URL_RE.exec(url ?? '');
  return match ? new mongoose.Types.ObjectId(match[1]) : null;
};

/** Express handler for GET /uploads/:file — streams the image from GridFS. */
export async function serveIcon(req, res, next) {
  const id = idFromUrl(`/uploads/${req.params.file}`);
  if (!id) return next();

  const [file] = await iconBucket().find({ _id: id }).limit(1).toArray();
  if (!file) return next();

  res.set({
    'Content-Type': file.metadata?.contentType ?? 'application/octet-stream',
    'Content-Length': file.length,
    // File ids never change, so browsers and CDNs may cache forever.
    'Cache-Control': 'public, max-age=31536000, immutable',
  });
  await pipeline(iconBucket().openDownloadStream(id), res);
}

/** Deletes an uploaded icon unless some app still uses it. */
export async function removeUnusedIcon(iconUrl) {
  const id = idFromUrl(iconUrl);
  if (!id || (await App.exists({ icon: iconUrl }))) return;
  try {
    await iconBucket().delete(id);
  } catch {
    /* already gone */
  }
}
