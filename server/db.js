import mongoose from 'mongoose';
import { config } from './config.js';
import { App } from './models/App.js';
import { SiteContent } from './models/SiteContent.js';

mongoose.set('strictQuery', true);
// Indexes are created explicitly in ensureIndexes(), after checking the
// database really belongs to this app, so a wrong MONGODB_URI can't modify
// another project's collections.
mongoose.set('autoIndex', false);
mongoose.set('autoCreate', false);

/** Throws if the database already holds an unrelated "apps" collection. */
async function assertOwnDatabase() {
  const foreign = await App.collection.findOne({ slug: { $exists: false } }, { projection: { _id: 1 } });
  if (foreign) {
    throw new Error(
      `Database "${mongoose.connection.name}" already contains an "apps" collection from a different project. ` +
        'Point MONGODB_URI at a database name used only by this app (e.g. .../app_listing_site).',
    );
  }
}

async function ensureIndexes() {
  await assertOwnDatabase();
  await Promise.all([App.createIndexes(), SiteContent.createIndexes()]);
}

export async function connectDb() {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10_000 });
  try {
    await ensureIndexes();
  } catch (err) {
    await mongoose.disconnect();
    throw err;
  }
  const { host, name } = mongoose.connection;
  console.log(`[db] Connected to MongoDB "${name}" on ${host}`);
}

export const disconnectDb = () => mongoose.disconnect();

export const isDbConnected = () => mongoose.connection.readyState === 1;

let bucket;
/** GridFS bucket holding uploaded app icons. */
export function iconBucket() {
  bucket ??= new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'icons' });
  return bucket;
}
