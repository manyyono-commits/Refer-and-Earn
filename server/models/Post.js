import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({ q: String, a: String }, { _id: false });

const seoSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: { type: String, default: '' },
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    twitterTitle: { type: String, default: '' },
    twitterDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    canonical: { type: String, default: '' },
    noindex: { type: Boolean, default: false },
  },
  { _id: false },
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
    excerpt: { type: String, default: '', maxlength: 500 },
    // Markdown body.
    content: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    coverImageAlt: { type: String, default: '' },
    author: { type: String, default: '' },
    category: { type: String, default: '' },
    tags: { type: [String], default: [] },
    faqs: { type: [faqSchema], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    publishedAt: { type: Date, default: null, index: true },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

/** Lean document → API shape. */
export const serializePost = ({ _id, __v: _v, ...rest }) => ({ id: String(_id), ...rest });

/** Public list rows leave out the body to keep the response small. */
export const serializePostSummary = (post) => {
  const { content: _c, faqs: _f, seo: _s, ...rest } = serializePost(post);
  return rest;
};

export const Post = mongoose.model('Post', postSchema);
