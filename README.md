# Sparrow — Scroll Animation Website (Functional Build)

This package adds the requested functionality to the supplied Sparrow design.

## Included
- Cyan custom cursor with the browser/system cursor hidden on desktop.
- Clickable Work rows open real project detail popups.
- Services open detailed popups.
- `/admin` protected content-management page for hero, site settings, services and work popup content.
- Server-backed content stored in `data/content.json`.
- Contact form posts to a server endpoint and sends mail through Gmail SMTP.
- Direct `mailto:` fallback and visible `sparrowsnexus@gmail.com` contact link.
- Vite proxy + one-command local dev launcher.

## Install / run locally
```bash
npm install
npm run dev
```

`npm run dev` starts both the API server (8787) and Vite client.

Open `/admin` for the content manager.

## Gmail app password
1. Turn on 2-Step Verification for the Gmail account.
2. Create a Google App Password for this website/server.
3. Copy `.env.example` to `.env`.
4. Add the values:

```env
ADMIN_PASSWORD=your-strong-admin-password
SMTP_USER=sparrowsnexus@gmail.com
SMTP_APP_PASSWORD=your-16-character-google-app-password
PORT=8787
```

**Never put the app password in `src/`, `VITE_*` variables, or frontend code.** It belongs only in the server-side `.env` file.

For production, keep `.env` out of git and use your hosting provider's server environment variables instead.

## Production
```bash
npm run build
npm start
```
The Express server serves the built site and the admin/API endpoints.
