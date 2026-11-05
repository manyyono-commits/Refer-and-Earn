import { HttpError } from './HttpError.js';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HTTP_RE = /^https?:\/\/\S+$/i;

const str = (v, max) => String(typeof v === 'string' ? v.trim() : (v ?? '')).slice(0, max ?? Infinity);
const isImage = (v) => !v || v.startsWith('/images/') || HTTP_RE.test(v);

/**
 * Validates a full post object and returns a clean copy with only known fields.
 * Slug uniqueness is checked by the caller.
 */
export function validatePost(input) {
  const errors = {};
  const out = {};

  out.title = str(input.title);
  if (!out.title) errors.title = 'Title is required.';
  else if (out.title.length > 200) errors.title = 'Title must be 200 characters or fewer.';

  out.slug = str(input.slug).toLowerCase();
  if (!SLUG_RE.test(out.slug)) errors.slug = 'Use lowercase letters, numbers and single hyphens.';
  else if (out.slug.length > 120) errors.slug = 'Slug must be 120 characters or fewer.';

  out.excerpt = str(input.excerpt);
  if (out.excerpt.length > 500) errors.excerpt = 'Excerpt must be 500 characters or fewer.';

  out.content = str(input.content);
  if (out.content.length > 200_000) errors.content = 'Content is too long (200,000 characters max).';

  out.coverImage = str(input.coverImage, 1000);
  if (!isImage(out.coverImage)) errors.coverImage = 'Use an uploaded image or an http(s) URL.';
  out.coverImageAlt = str(input.coverImageAlt, 200);

  out.author = str(input.author, 80);
  out.category = str(input.category, 60);

  const rawTags = Array.isArray(input.tags) ? input.tags : String(input.tags ?? '').split(',');
  out.tags = [...new Set(rawTags.map((t) => str(t, 40)).filter(Boolean))].slice(0, 20);

  out.faqs = (Array.isArray(input.faqs) ? input.faqs : [])
    .map((f) => ({ q: str(f?.q, 300), a: str(f?.a, 3000) }))
    .filter((f) => f.q || f.a);
  if (out.faqs.some((f) => !f.q || !f.a)) errors.faqs = 'Every FAQ needs both a question and an answer.';
  if (out.faqs.length > 50) errors.faqs = 'Up to 50 FAQs.';

  out.status = input.status === 'published' ? 'published' : 'draft';

  if (input.publishedAt) {
    const d = new Date(input.publishedAt);
    if (Number.isNaN(d.getTime())) errors.publishedAt = 'Enter a valid date.';
    else out.publishedAt = d;
  } else {
    out.publishedAt = out.status === 'published' ? new Date() : null;
  }

  const seo = input.seo ?? {};
  out.seo = {
    title: str(seo.title, 200),
    description: str(seo.description, 400),
    keywords: str(seo.keywords, 500),
    ogTitle: str(seo.ogTitle, 200),
    ogDescription: str(seo.ogDescription, 400),
    twitterTitle: str(seo.twitterTitle, 200),
    twitterDescription: str(seo.twitterDescription, 400),
    ogImage: str(seo.ogImage, 1000),
    canonical: str(seo.canonical, 500),
    noindex: Boolean(seo.noindex),
  };
  if (!isImage(out.seo.ogImage)) errors['seo.ogImage'] = 'Use an uploaded image or an http(s) URL.';
  if (out.seo.canonical && !HTTP_RE.test(out.seo.canonical)) {
    errors['seo.canonical'] = 'Use a full https:// URL, or leave empty.';
  }

  if (Object.keys(errors).length) throw new HttpError(400, 'Please fix the highlighted fields.', errors);
  return out;
}
