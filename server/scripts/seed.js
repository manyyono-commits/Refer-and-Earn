/**
 * Loads the dummy data in server/seed/ into MongoDB.
 *
 *   npm run seed            Insert apps and site text only if the database is empty.
 *   npm run seed:site       Replace only the site text (pages, home sections). Apps are untouched.
 *   npm run seed:reset      Delete all apps, icons and site text, then insert fresh data.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';
import { connectDb, disconnectDb, iconBucket } from '../db.js';
import { App } from '../models/App.js';
import { SiteContent } from '../models/SiteContent.js';

const readSeed = async (name) => JSON.parse(await readFile(path.join(config.seedDir, name), 'utf8'));

async function replaceSiteContent() {
  const content = await readSeed('site.json');
  await SiteContent.updateOne({ key: 'main' }, { $set: { content } }, { upsert: true });
  console.log('[seed] Replaced site content. Apps were not changed.');
}

async function clearAll() {
  await App.deleteMany({});
  await SiteContent.deleteMany({});
  await iconBucket().drop().catch(() => {}); // fine if no icons were uploaded yet
  console.log('[seed] Cleared apps, icons and site content.');
}

async function seedIfEmpty() {
  const appCount = await App.countDocuments();
  if (appCount === 0) {
    const { apps } = await readSeed('apps.json');
    const docs = apps.map(({ id: _id, ...app }, position) => ({ ...app, position }));
    await App.insertMany(docs);
    console.log(`[seed] Inserted ${docs.length} apps.`);
  } else {
    console.log(`[seed] Skipped apps: the database already has ${appCount}. Use seed:reset to replace them.`);
  }

  if (await SiteContent.exists({ key: 'main' })) {
    console.log('[seed] Skipped site content: it already exists. Use seed:site to replace it.');
  } else {
    await SiteContent.create({ key: 'main', content: await readSeed('site.json') });
    console.log('[seed] Inserted site content.');
  }
}

try {
  await connectDb(); // also verifies the database belongs to this app and creates indexes

  if (process.argv.includes('--site')) {
    await replaceSiteContent();
  } else {
    if (process.argv.includes('--reset')) await clearAll();
    await seedIfEmpty();
  }
} catch (err) {
  console.error(`[seed] Failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await disconnectDb();
}
