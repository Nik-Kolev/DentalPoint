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
npm run test:e2e         # Playwright e2e suite
npm run test:e2e:ui      # Playwright UI mode, for debugging a single spec
```

## Admin

There's no separate `/admin` route — sign in with the authorised Google account and admin controls appear inline on the relevant public page (home, team, gallery, licenses).

Capabilities: upload/delete/reorder clinic photos and certificates; add/edit/delete/reorder before/after treatment cases; edit team member photos and bilingual bios.

## Testing

Playwright e2e suite in `e2e/`. Mutates real server-side data during admin tests, then restores `data/` and `public/Images/` from a snapshot taken before the run — safe to run any time, admin content is never permanently affected.

## Deployment

Auto-deploys on every push to `main` via GitHub Actions → PM2 on a DigitalOcean VPS (1 CPU, 1 GB RAM) behind Nginx + Cloudflare CDN.

To skip a deploy: add `[skip ci]` to the commit message.
