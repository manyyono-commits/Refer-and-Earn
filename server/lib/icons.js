import ImageKit from '@imagekit/nodejs';
import multer from 'multer';
import { config } from '../config.js';
import { App } from '../models/App.js';
import { HttpError } from './HttpError.js';

// SVG is deliberately excluded: it can carry scripts.
const EXTENSIONS = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

/** Lazy-initialised ImageKit client (avoids crashing at import if the key is missing). */
let _ik;
function getImageKit() {
  if (!_ik) {
    _ik = new ImageKit({ privateKey: config.imagekitPrivateKey });
  }
  return _ik;
}

/** Parses the multipart upload into memory; the buffer is then sent to ImageKit. */
export const iconUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) cb(null, true);
    else cb(new HttpError(400, 'Only PNG, JPG, WEBP or GIF images are allowed.'));
  },
}).single('icon');

/** Uploads an image to ImageKit and returns its public URL. */
export async function saveIcon({ buffer, mimetype, originalname }) {
  // eslint-disable-next-line no-unused-vars
  const ext = EXTENSIONS[mimetype] || '';
  const fileName = `${Date.now()}-${(originalname || 'icon').replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  const result = await getImageKit().files.upload({
    file: buffer.toString('base64'),  // SDK expects base64 string, not raw Buffer
    fileName,
    folder: '/app-icons',  // Keep icons organised in a folder on ImageKit
    tags: ['app-icon'],
  });

  // result.url is the full public CDN URL from ImageKit
  return result.url;
}

/**
 * Extracts the ImageKit fileId from a URL so we can delete it.
 * ImageKit URLs look like: https://ik.imagekit.io/<id>/app-icons/<fileName>
 * We store the full URL in the DB, so we need to look up the file by URL.
 */
async function deleteFromImageKit(iconUrl) {
  if (!iconUrl || !iconUrl.startsWith('https://')) return;
  try {
    const ik = getImageKit();
    // Search for the file by its URL path
    const urlPath = new URL(iconUrl).pathname;
    // The pathname includes the imagekit-id prefix, extract the file path after it
    // e.g. /your_imagekit_id/app-icons/1234-icon.png → /app-icons/1234-icon.png
    const parts = urlPath.split('/');
    // Remove the first empty segment and the imagekit-id segment
    const filePath = '/' + parts.slice(2).join('/');

    const files = await ik.files.list({
      path: filePath,
      limit: 1,
    });
    if (files?.length > 0) {
      await ik.files.delete(files[0].fileId);
    }
  } catch (err) {
    // Log but don't throw — the image may already be gone
    console.warn('[imagekit] Failed to delete image:', err.message);
  }
}

/** Deletes an uploaded icon from ImageKit unless some app still uses it. */
export async function removeUnusedIcon(iconUrl) {
  if (!iconUrl || (await App.exists({ icon: iconUrl }))) return;
  await deleteFromImageKit(iconUrl);
}
