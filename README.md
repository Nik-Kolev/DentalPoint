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
npm run test:e2e         # Playwright e2e suite
npm run test:e2e:ui      # Playwright UI mode, for debugging a single spec
```

> `npm run build` automatically runs `optimize-images` and `generate-blur-placeholders` before building.

## Admin

Visit `/admin` and sign in with the authorised Google account.

Capabilities: upload/delete/reorder clinic photos and certificates; add/edit/delete/reorder before/after treatment cases; edit team member photos and bilingual bios.

## Testing

Playwright e2e suite in `e2e/`. Mutates real server-side data during admin tests, then hard-resets `data/` and `public/Images/` to the last commit after every run — commit or stash any in-progress admin edits before running (`npm run test:e2e` will refuse to start otherwise).

## Deployment

Auto-deploys on every push to `main` via GitHub Actions → PM2 on a DigitalOcean VPS (1 CPU, 1 GB RAM) behind Nginx + Cloudflare CDN.

To skip a deploy: add `[skip ci]` to the commit message.
