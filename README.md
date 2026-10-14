# App Directory (React + Redux + Express + MongoDB)

A React rebuild of an app-listing directory with an admin panel. Visitors browse without logging in. The admin manages listings at `/admin`. Data and uploaded icons are stored in MongoDB.

## First-time setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in:
   - `MONGODB_URI`: a local MongoDB (`mongodb://127.0.0.1:27017/app_listing_site`) or a MongoDB Atlas connection string. Use a database name that belongs only to this app.
   - `ADMIN_PASSWORD`: password for `/admin`.
   - `JWT_SECRET`: generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

3. Load the dummy data into MongoDB:

   ```bash
   npm run seed
   ```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | API on :5000 + site on <http://localhost:5173> with auto-reload |
| `npm run build` | Build the React app into `dist/` |
| `npm start` | Production: one server serves the API and the built site |
| `npm run seed` | Insert dummy apps and site text, only if the database is empty |
| `npm run seed:reset` | **Delete** all apps, icons and site text, then insert fresh dummy data |
| `npm run lint` | Lint frontend and server |

Admin panel: <http://localhost:5173/admin>

## Admin panel

| Feature | Where |
| --- | --- |
| Log in with `ADMIN_PASSWORD` | `/admin/login` |
| See all listings, search, filter by tab | `/admin` |
| Add a new app (it appears at the top of the site) | **Add App** |
| Edit any field, upload or replace the icon | ✏️ on a row |
| Feature / unfeature on the home page | ★ on a row |
| Change the display order | ↑ ↓ on a row |
| Delete an app (its uploaded icon is deleted too) | 🗑 on a row |

Changes are live for visitors immediately.

## MongoDB data

| Collection | Contents |
| --- | --- |
| `apps` | One document per listing. `position` controls display order; `slug` is unique |
| `sitecontents` | One document (`key: "main"`) holding all site text. Edit it in MongoDB Compass or Atlas, or change `server/seed/site.json` and run `npm run seed:reset` |
| `icons.files` / `icons.chunks` | Uploaded icons (GridFS), served at `/uploads/<id>.<ext>` |

The seed data lives in `server/seed/apps.json` and `server/seed/site.json`. It is placeholder content, so replace it with your own.

On startup, the server refuses to use a database whose `apps` collection belongs to a different project. This protects other projects if `MONGODB_URI` points at the wrong database.

## Deploying

The site needs a Node host plus MongoDB. Icons are stored in MongoDB, so no persistent disk is needed. The recommended free setup is **MongoDB Atlas + Render**.

### 1. MongoDB Atlas

1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. **Database Access**: add a database user with a password.
3. **Network Access**: allow `0.0.0.0/0`. Render's free tier has no fixed IP.
4. **Connect → Drivers**: copy the connection string, add the database name `app_listing_site`, and insert your password.
5. Seed it from your computer:

   ```bash
   MONGODB_URI="mongodb+srv://…/app_listing_site?retryWrites=true&w=majority" npm run seed
   ```

   On Windows PowerShell, set the variable first with `$env:MONGODB_URI="…"`, then run `npm run seed`.

### 2a. Render (uses `render.yaml`)

1. Push this project to GitHub.
2. In Render choose **New → Blueprint** and pick the repo.
3. Enter `MONGODB_URI` and `ADMIN_PASSWORD` when asked. `JWT_SECRET` is generated automatically.
4. Render runs `npm ci --include=dev && npm run build`, then `npm start`, and checks `/api/health`.

### 2b. Docker (any VPS, Railway, Fly.io, etc.)

```bash
docker build -t app-listing-site .
docker run -p 5000:5000 \
  -e MONGODB_URI="mongodb+srv://…" \
  -e ADMIN_PASSWORD="…" \
  -e JWT_SECRET="…" \
  app-listing-site
```

### 2c. Any other Node host

Use Node 22.9 or newer. Build with `npm ci --include=dev && npm run build`, start with `npm start`, and set `MONGODB_URI`, `ADMIN_PASSWORD`, `JWT_SECRET` and `NODE_ENV=production`.

### Production features

- Security headers via Helmet: a Content-Security-Policy, HSTS and nosniff.
- Gzip compression.
- Long-term caching for built assets and icons. The HTML always revalidates.
- `GET /api/health` reports the server and database status, for uptime checks.
- Clean shutdown on redeploy (SIGTERM).
- Login rate limiting that works behind the host's proxy (`TRUST_PROXY` is on by default in production).
- The server exits with a clear message if `MONGODB_URI` is missing or MongoDB can't be reached, or if `JWT_SECRET` is missing in production.

## Folder structure

```text
server/
├─ index.js                  Connects to MongoDB, starts the server, handles shutdown
├─ app.js                    Express app: security, compression, API, icons, built site
├─ config.js                 Environment settings
├─ db.js                     MongoDB connection, safety check, indexes, GridFS bucket
├─ models/                   App, SiteContent (Mongoose)
├─ routes/public.js          GET /api/apps, /api/site, /api/health
├─ routes/admin.js           Login + protected create/update/delete/reorder/upload
├─ lib/                      auth, validateApp, icons (GridFS upload/serve/cleanup)
├─ scripts/seed.js           Loads server/seed/*.json into MongoDB
└─ seed/                     Dummy data
src/
├─ app/store.js              Redux store (RTK Query api + ui + admin slices)
├─ services/                 api.js, adminApi.js, cachedBaseQuery.js (ETag cache)
├─ features/                 ui slice, admin slice, selectors
├─ components/               layout/ and common/
├─ pages/                    Home, AppDetail, About, Contact, Disclaimer, NotFound, Admin/
└─ routes/AppRoutes.jsx      Public routes + lazy-loaded /admin routes
Dockerfile, render.yaml       Deployment
```

## Caching

1. **In memory (RTK Query):** data is kept for 10 minutes and refreshed when the browser tab regains focus.
2. **Persistent (localStorage + ETag):** each response is stored with its ETag. When nothing has changed, the server answers `304` with no body. Admin changes produce a new ETag, so visitors get them on their next load. If the server can't be reached, the last stored copy is shown.
