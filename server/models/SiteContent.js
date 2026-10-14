import mongoose from 'mongoose';

/**
 * Editable site text (home sections, app-page steps, About/Contact/Disclaimer).
 * Stored as a single document with key "main".
 */
const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
);

export const SiteContent = mongoose.model('SiteContent', siteContentSchema);
