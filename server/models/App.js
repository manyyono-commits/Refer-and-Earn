import mongoose from 'mongoose';

const appSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 60 },
    badge: { type: String, default: '', maxlength: 6 },
    icon: { type: String, default: '' },
    color: { type: String, default: '#4f46e5' },
    bonus: { type: Number, required: true, min: 0 },
    minWithdraw: { type: Number, default: 100, min: 0 },
    category: { type: String, enum: ['new', 'other'], default: 'new' },
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    downloads: { type: String, default: '' },
    size: { type: String, default: '' },
    version: { type: String, default: '' },
    downloadUrl: { type: String, default: '#' },
    description: { type: String, default: '', maxlength: 1000 },
    // Display order on the site: lower comes first.
    position: { type: Number, required: true, index: true },
  },
  { timestamps: true },
);

/** Converts a lean document into the shape the frontend expects. */
export const serializeApp = ({ _id, position: _p, createdAt: _c, updatedAt: _u, __v: _v, ...rest }) => ({
  id: String(_id),
  ...rest,
});

export const App = mongoose.model('App', appSchema);
