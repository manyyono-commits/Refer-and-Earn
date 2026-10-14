# Deployment Checklist

Everything to change before putting the site online, in order. Tick each box as you go.

---

## 1. Secrets and settings (required)

These go in your **host's environment settings** (for example the Render dashboard), **not** in any file you commit.

| Variable | What to set | Notes |
| --- | --- | --- |
| `MONGODB_URI` | Your MongoDB Atlas connection string | Must end in a database name used only by this app, e.g. `.../app_listing_site?retryWrites=true&w=majority` |
| `ADMIN_PASSWORD` | A long, unique password | Used to log in at `/admin`. Don't reuse the one from your local `.env` |
| `JWT_SECRET` | A random 64-character string | Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. On Render this is generated for you |
| `NODE_ENV` | `production` | Already set in `render.yaml` |

- [ ] `MONGODB_URI` points to **Atlas**, not `127.0.0.1` (your local database isn't reachable from the internet)
- [ ] `ADMIN_PASSWORD` is new and strong
- [ ] `JWT_SECRET` is set (the server refuses to start in production without it)

> ⚠️ Never put real values in `.env.example`. That file gets pushed to GitHub. `.env` is already git-ignored.

---

## 2. Branding and contact details

| What | File | Current placeholder |
| --- | --- | --- |
| Site name (header, footer, browser tab) | `server/seed/site.json` → `siteName` | `All New Apps` |
| Search engine description | `server/seed/site.json` → `metaDescription` | Generic text |
| Telegram link (header, footer, home page) | `server/seed/site.json` → `telegramUrl` | `https://t.me/` (goes nowhere) |
| Contact email | `server/seed/site.json` → `pages.contact.business.rows` | `support@example.com` |
| Title shown before the page loads | `index.html` → `<title>` | `All New Apps` |
| Mobile browser bar colour | `index.html` → `theme-color` | `#fb3737` (red) |
| Logo and browser tab icon | `public/images/logo.svg` | Placeholder "Y" logo |
| Fallback name if site text fails to load | `src/components/common/Seo.jsx`, `src/components/layout/Header.jsx`, `src/components/layout/Footer.jsx` | `All New Apps` |

- [ ] Real site name everywhere
- [ ] Real Telegram group link
- [ ] Real contact email
- [ ] Your own logo (keep it square; SVG or PNG)

---

## 3. Page text

All site text lives in `server/seed/site.json`. Review each block:

- [ ] `home`: hero title and text, featured section, tips, community, disclaimer, banned-states list, promo banner, about block
- [ ] `detail`: install steps, trust and safety cards, **reviews** (the 3 reviews are marked "(Sample review)", so replace or delete them), FAQ
- [ ] `pages.about`, `pages.contact`, `pages.disclaimer`

After editing, load the new text into the database (step 6). App listings are not affected.

---

## 4. App listings

`server/seed/apps.json` contains 30 dummy apps plus "Asa". All dummy apps have `"downloadUrl": "#"` and no icons.

Choose one:

- **Option A:** delete the dummy apps from `apps.json` before seeding, then add real apps through the admin panel after deploying.
- **Option B:** seed as-is, then edit or delete each dummy app in the admin panel.

- [ ] No listing still has `#` as its download link
- [ ] Each real app has an icon uploaded

---

## 5. Project names (optional)

| What | File |
| --- | --- |
| Package name | `package.json` → `name` (`yono-apps-directory`) |
| Render service name (also becomes your URL `<name>.onrender.com`) | `render.yaml` → `name` (`app-directory`) |

---

## 6. Set up MongoDB Atlas

1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. **Database Access** → add a user with a password.
3. **Network Access** → add `0.0.0.0/0`. Render's free tier has no fixed IP address.
4. **Connect → Drivers** → copy the connection string. Insert your password and add `/app_listing_site` before the `?`.
5. Load the data from your computer (PowerShell):

   ```powershell
   $env:MONGODB_URI="mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/app_listing_site?retryWrites=true&w=majority"
   npm run seed
   Remove-Item Env:MONGODB_URI
   ```

   You should see `Inserted 31 apps` (or fewer if you removed dummy apps) and `Inserted site content`.

- [ ] Atlas user and network access configured
- [ ] Seed ran against Atlas successfully

**Later text changes:** after editing `site.json`, run `npm run seed:site` with the same `$env:MONGODB_URI` line to update the live site text without touching listings.

---

## 7. Put the code on GitHub

This folder is not a Git repository yet.

```powershell
git init
git add .
git status          # check that .env is NOT in the list
git commit -m "Initial commit"
```

Then create an empty **private** repository on GitHub and follow its "push an existing repository" instructions.

- [ ] `git status` does not list `.env`
- [ ] Code pushed to GitHub

---

## 8. Deploy on Render

1. Sign in at <https://render.com> with GitHub.
2. **New → Blueprint** → select your repository. Render reads `render.yaml`.
3. When asked, enter `MONGODB_URI` and `ADMIN_PASSWORD`.
4. Wait for the build to finish (a few minutes).

The free plan sleeps after a period of no traffic, so the first visit afterwards takes up to a minute to load. A paid plan avoids this.

**Using another host instead?** See the Docker and "any Node host" instructions in `README.md`. Build with `npm ci --include=dev && npm run build`, start with `npm start`, and use Node 22.9 or newer.

---

## 9. Check the live site

- [ ] `https://YOUR-APP.onrender.com/api/health` shows `{"status":"ok","db":true}`
- [ ] Home page shows your listings, and both tabs work
- [ ] An app page opens (e.g. `/your-app-slug`) and its download button goes to the right place
- [ ] About, Contact and Disclaimer show your text
- [ ] `/admin` → log in with the **production** password
- [ ] Add a test app with an icon, check it appears on the home page, then delete it
- [ ] Check the site on a phone

---

## 10. Optional extras

- **Custom domain:** Render → your service → Settings → Custom Domains. Follow the DNS instructions; HTTPS is automatic.
- **Analytics or ads:** the server's security policy blocks scripts from other websites. If you add Google Analytics, AdSense or similar, add their domains to the `contentSecurityPolicy` section in `server/app.js` (`scriptSrc`, `connectSrc`, `imgSrc`, and `frameSrc` if needed), or their scripts won't run.
- **Backups:** Atlas free clusters don't include automatic backups. Export the `apps` and `sitecontents` collections now and then, for example with MongoDB Compass.
- **Admin password:** change it by updating `ADMIN_PASSWORD` in Render. Everyone gets logged out when `JWT_SECRET` changes.

---

## 11. Legal check

The site lists real-money gaming apps. India's Promotion and Regulation of Online Gaming Act, 2025 bans advertising and promoting real-money online games, and several states ban them too. Check the legal position before publishing real listings or affiliate links.
