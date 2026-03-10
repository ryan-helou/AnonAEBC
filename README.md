# AnonAEBC

Anonymous question submission platform for AEBC church.

## Quick Start

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Access

- Click the small **Admin** link in the bottom-right corner of the homepage.
- Default password: `aebc2024` (change this in `server.js` or set the `ADMIN_PASSWORD` environment variable).

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in [vercel.com](https://vercel.com).
3. Set the environment variable `ADMIN_PASSWORD` in Vercel project settings.
4. Deploy.

> **Note:** SQLite stores data in a local file (`data/questions.db`). On Vercel's serverless platform, this storage is **ephemeral** — data may be lost between deployments or cold starts. For persistent production use, swap SQLite for a cloud database (e.g., Turso, PlanetScale, or Supabase). For a single church session, ephemeral storage works fine.

## Project Structure

```
public/
  index.html      User-facing submission page
  admin.html      Admin dashboard
  css/style.css   Styles
  js/app.js       User submission logic
  js/admin.js     Admin dashboard logic
server.js         Express server + API routes
data/             SQLite database (auto-created)
```
