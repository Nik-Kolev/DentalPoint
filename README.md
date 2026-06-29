# DentalPoint

Production website for **Dental Point**, a dental clinic in Varna, Bulgaria. Live at [dentalpoint.bg](https://dentalpoint.bg).

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Auth.js (next-auth v5)** — Google OAuth for admin access
- **next-intl v4** — Bulgarian / English, cookie-based switching
- **sharp** — image processing for admin uploads
- **googleapis** — GA4 analytics data

## Dev

```bash
npm run dev              # Start local dev server (http://localhost:3000)
npm run build            # Production build
npm run process-images   # Compress images + regenerate blur placeholders
```

> `npm run build` automatically runs `optimize-images` and `generate-blur-placeholders` before building.

## Admin

Visit `/admin` and sign in with the authorised Google account.

Capabilities: upload/delete/rotate/reorder clinic photos and certificates, reorder before/after treatment cases.

## Deployment

Auto-deploys on every push to `main` via GitHub Actions → PM2 on a DigitalOcean VPS (1 CPU, 1 GB RAM) behind Nginx + Cloudflare CDN.

To skip a deploy: add `[skip ci]` to the commit message.
