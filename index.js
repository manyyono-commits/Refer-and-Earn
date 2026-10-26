import { config } from './config.js';
import { connectDb, disconnectDb } from './db.js';
import { createServer } from './app.js';

try {
  await connectDb();
} catch (err) {
  console.error(`[db] Could not connect to MongoDB: ${err.message}`);
  process.exit(1);
}

const server = createServer().listen(config.port, () => {
  console.log(
    `[server] Running on http://localhost:${config.port} (${config.isProduction ? 'production' : 'development'})`,
  );
});

// Hosts send SIGTERM on redeploy: finish in-flight requests, then close the DB.
const shutdown = (signal) => {
  console.log(`[server] ${signal} received, shutting down…`);
  server.close(async () => {
    await disconnectDb();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
