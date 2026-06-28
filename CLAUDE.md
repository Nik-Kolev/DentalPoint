# DentalPoint — CLAUDE.md

## Session start
1. Read `~/.claude/projects/C--Users-user-Documents-GitHub-DentalPoint/memory/MEMORY.md`
2. Read `~/.claude/projects/C--Users-user-Documents-GitHub-DentalPoint/CLAUDE.md` — current state and project rules
3. Read `~/.claude/projects/C--Users-user-Documents-GitHub-DentalPoint/roadmap.md` — full plan and completed work
4. Read this file — stack, structure, conventions

---

## What this is
Production dental clinic website for **Dental Point**, Varna, Bulgaria. Live at `https://dentalpoint.bg`. No backend server — all server-side logic lives in Next.js API routes.

## Stack
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS v4**
- **next-auth v4** — Google OAuth, protects `/statistics/` and `/admin/`
- **next-intl v4** — installed but NOT used for routing; see i18n note below
- **googleapis** — GA4 data for the analytics dashboard
- **sharp** — image optimization at build time

## Project structure
```
src/
  app/
    [locale]/         # Public pages: home, contact, team, gallery, licenses, reviews
    statistics/       # Protected analytics dashboard (Bulgarian only)
    auth/             # sign-in, error pages
    api/analytics/    # GA4 API route
  components/         # Shared UI components
  lib/
    useTranslation.ts # Custom i18n helper — see i18n note
    analytics.ts      # GA4 fetch + mock data generator
    auth.ts / auth-config.ts
    blurPlaceholders.ts
    imageVersion.ts
    cloudflareLoader.ts
  locales/
    bg.json           # Bulgarian strings (default locale)
    en.json           # English strings
  middleware.ts       # Protects /statistics/ and /admin/
scripts/
  optimize-images.js            # Compresses images in /public/Images
  generate-blur-placeholders.js # Bakes base64 blur data URLs into blurPlaceholders.ts
```

## Commands
```bash
npm run dev              # Local dev server
npm run build            # Production build (runs image scripts first via prebuild)
npm run optimize-images  # Compress public/Images/**
npm run generate-blur    # Regenerate blur placeholders
npm run process-images   # Both optimize + generate-blur
```

## Deployment
- **Auto-deploy triggers on every push to `main`** via GitHub Actions → PM2 restart on VPS
- Server: VPS (1 CPU, 1GB RAM) with PM2 + Nginx + Cloudflare CDN (DigitalOcean droplet)
- Server path: `/var/www/DentalPoint`
- Nginx config is version-controlled: `nginx.conf.dentalpoint`
- To skip deploy: include `[skip ci]` in the commit message
- Manual fallback on server: `bash fix-build.sh`

## Conventions & gotchas

### i18n — custom helper, NOT next-intl routing
Despite `next-intl` being installed, all translation is done via a hand-rolled system.
- Every page receives `params.locale` (`'bg'` | `'en'`) from the `[locale]` segment.
- Call `getTranslation(locale)` from `src/lib/useTranslation.ts` to get a `t(section, key)` function.
- Bulgarian is the default locale and the fallback for missing English keys.
- **Do NOT add `NextIntlClientProvider` or any next-intl routing setup** — it is not wired in.
- To add a string: add it to both `src/locales/bg.json` and `en.json` under the same section/key.

### LCP-critical server component rule
The home page (`src/app/[locale]/page.tsx`) must stay a **server component**.
- Hero image renders in the initial HTML → browser fetches it immediately, no JS wait.
- LCP was 9.3s (mobile) before this was fixed; it is now 2.9s.
- **Never add `'use client'` to this file.** Interactive parts live in `ClientGallery.tsx`.

### Image pipeline
- `prebuild` runs `optimize-images.js` then `generate-blur-placeholders.js` automatically before every build.
- Blur data URLs are baked into `src/lib/blurPlaceholders.ts` at build time — not dynamic.
- If you add new images to `/public/Images/`, run `npm run process-images` to regenerate.
- Use `getImageUrl(path)` and `getBlurPlaceholder(path)` from `@/lib/imageVersion` on every `<Image>`.

### Analytics (GA4)
- In production, real GA4 data comes from `POST /api/analytics` (uses `googleapis`).
- In dev, the statistics page has a toggle button (`useMockData` state) that switches to generated mock data.
- The statistics dashboard (`/statistics/`) is Bulgarian-only — all UI strings are hardcoded in Bulgarian.

### Auth
- Google OAuth via next-auth. Config: `src/lib/auth-config.ts` and `src/lib/auth.ts`.
- Protected routes: `/statistics/*` and `/admin/*` (enforced in `middleware.ts`).

### Brand
- Primary blue: `#005baa` | Accent blue: `#009fe3`
- Background gradient: `from-[#e3f3fb] to-white`
- Fonts: `font-playfair` (Playfair Display) and `font-montserrat` (Montserrat)
  — CSS variables defined in `src/app/[locale]/layout.tsx`, used as Tailwind classes.

### Cloudflare image loader
- `src/lib/cloudflareLoader.ts` is ready but not active in `next.config.js`.
- Enabling it offloads all image resizing to Cloudflare's edge network (free tier).
