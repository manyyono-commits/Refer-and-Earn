// Imports the articles in server/seed/articles.json as blog posts.
//   npm run seed:articles            add posts whose slug doesn't exist yet
//   npm run seed:articles -- --force overwrite existing posts with the seed copy
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDb, disconnectDb } from '../db.js';
import { validatePost } from '../lib/validatePost.js';
import { Post } from '../models/Post.js';

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '../seed/articles.json');
const force = process.argv.includes('--force');

try {
  const articles = JSON.parse(fs.readFileSync(file, 'utf8'));
  await connectDb();
  for (const article of articles) {
    const clean = validatePost(article);
    const existing = await Post.findOne({ slug: clean.slug }).select('_id').lean();
    if (existing && !force) {
      console.log(`[seed] skip    /blog/${clean.slug}/ (already exists; use --force to overwrite)`);
      continue;
    }
    if (existing) await Post.updateOne({ _id: existing._id }, clean, { runValidators: true });
    else await Post.create(clean);
    console.log(`[seed] ${existing ? 'updated' : 'added  '} /blog/${clean.slug}/`);
  }
} catch (err) {
  console.error(`[seed] Failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await disconnectDb();
}
