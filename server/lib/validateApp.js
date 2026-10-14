import { HttpError } from './HttpError.js';

// Slugs that would clash with site routes.
const RESERVED_SLUGS = new Set(['about', 'contact', 'disclaimer', 'admin', 'api', 'uploads', 'images', 'assets']);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COLOR_RE = /^#[0-9a-f]{6}$/i;
const HTTP_RE = /^https?:\/\/\S+$/i;

export const APP_DEFAULTS = {
  badge: '',
  icon: '',
  color: '#4f46e5',
  bonus: 0,
  minWithdraw: 100,
  category: 'new',
  featured: false,
  rating: 4.5,
  downloads: '',
  size: '',
  version: '',
  downloadUrl: '#',
  description: '',
};

const str = (v) => (typeof v === 'string' ? v.trim() : v);

/**
 * Validates a full app object and returns a clean copy containing only known fields.
 * Slug uniqueness is checked against the database by the caller.
 * Throws HttpError(400) with per-field messages on failure.
 */
export function validateApp(input) {
  const app = { ...APP_DEFAULTS, ...input };
  const errors = {};
  const out = {};

  out.name = str(app.name);
  if (typeof out.name !== 'string' || !out.name) errors.name = 'Name is required.';
  else if (out.name.length > 60) errors.name = 'Name must be 60 characters or fewer.';

  out.slug = str(app.slug)?.toLowerCase();
  if (typeof out.slug !== 'string' || !SLUG_RE.test(out.slug)) {
    errors.slug = 'Use lowercase letters, numbers and single hyphens (e.g. lotus-rummy).';
  } else if (out.slug.length > 60) {
    errors.slug = 'Slug must be 60 characters or fewer.';
  } else if (RESERVED_SLUGS.has(out.slug)) {
    errors.slug = `"${out.slug}" is reserved by the site. Choose another slug.`;
  }

  out.badge = String(str(app.badge) ?? '').toUpperCase();
  if (out.badge.length > 6) errors.badge = 'Badge must be 6 characters or fewer.';
  if (!out.badge && out.name) out.badge = out.name.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase();

  out.icon = String(str(app.icon) ?? '');
  if (out.icon && !out.icon.startsWith('/uploads/') && !out.icon.startsWith('/images/') && !HTTP_RE.test(out.icon)) {
    errors.icon = 'Icon must be an uploaded image or an http(s) URL.';
  }

  out.color = str(app.color);
  if (!COLOR_RE.test(out.color ?? '')) errors.color = 'Colour must be a hex value like #4f46e5.';

  for (const field of ['bonus', 'minWithdraw']) {
    const n = Number(app[field]);
    if (app[field] === null || app[field] === '' || !Number.isFinite(n) || n < 0 || n > 1_000_000) {
      errors[field] = 'Enter an amount between 0 and 10,00,000.';
    } else {
      out[field] = Math.round(n);
    }
  }

  out.category = app.category;
  if (!['new', 'other'].includes(out.category)) errors.category = 'Category must be "new" or "other".';

  out.featured = Boolean(app.featured);

  const rating = Number(app.rating);
  if (app.rating === null || app.rating === '' || !Number.isFinite(rating) || rating < 0 || rating > 5) {
    errors.rating = 'Rating must be between 0 and 5.';
  } else {
    out.rating = Math.round(rating * 10) / 10;
  }

  for (const field of ['downloads', 'size', 'version']) {
    out[field] = String(str(app[field]) ?? '');
    if (out[field].length > 20) errors[field] = 'Must be 20 characters or fewer.';
  }

  out.downloadUrl = String(str(app.downloadUrl) ?? '') || '#';
  if (out.downloadUrl.length > 500) errors.downloadUrl = 'URL is too long.';
  else if (out.downloadUrl !== '#' && !HTTP_RE.test(out.downloadUrl) && !out.downloadUrl.startsWith('/')) {
    errors.downloadUrl = 'Use a full http(s) link, a site path starting with /, or #.';
  }

  out.description = String(str(app.description) ?? '');
  if (out.description.length > 1000) errors.description = 'Description must be 1000 characters or fewer.';

  if (Object.keys(errors).length) {
    throw new HttpError(400, 'Please fix the highlighted fields.', errors);
  }
  return out;
}
