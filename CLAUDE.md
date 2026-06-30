@AGENTS.md

# DentalPoint — CLAUDE.md

## Session start
1. Read `~/.claude/projects/C--Users-user-Documents-GitHub-DentalPoint/memory/MEMORY.md`
2. Read `~/.claude/projects/C--Users-user-Documents-GitHub-DentalPoint/CLAUDE.md` — current state and project rules
3. Read `~/.claude/projects/C--Users-user-Documents-GitHub-DentalPoint/roadmap.md` — full plan and completed work
4. Read this file — stack, structure, conventions

---

## What this is
Production dental clinic website for **Dental Point**, Varna, Bulgaria. Live at `https://dentalpoint.bg`. No backend server — all server-side logic lives in Next.js Server Actions and API routes.

## Stack
- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Auth.js (next-auth v5)** — Google OAuth, protects `/statistics/` and `/admin/`
- **next-intl v4** — wired for routing since Phase 3; `localePrefix: 'never'`, cookie-based locale switching
- **googleapis** — GA4 data for the analytics dashboard
- **sharp** — image rotation and processing for admin uploads

## Project structure
```
src/
  app/
    [locale]/         # Public pages: home, contact, team, gallery, licenses, reviews
    statistics/       # Protected analytics dashboard (Bulgarian only)
    auth/             # sign-in, error pages
    api/analytics/    # GA4 API route
  auth.ts             # Auth.js config — exports { auth, handlers, signIn, signOut }
  components/
    gallery/          # HomeGallery (server wrapper), HomeGalleryViewer, HomeGalleryAdmin,
                      # CertificatesViewer, CertificatesAdmin,
                      # GalleryCasesViewer, GalleryCasesAdmin,
                      # BeforeAfterSlider, ImageLightbox
    layout/           # Navigation, DeferredWidgets
    shared/           # StaticCTA, FloatingCTA, BackToTop, CookieConsent, DentalPointLogo, etc.
    statistics/       # BarChart
  lib/
    actions/
      gallery.ts      # Server Actions: uploadGalleryImage, removeGalleryImage,
                      # reorderGallery (home/certs), reorderGalleryCases, addGalleryCase,
                      # removeGalleryCase, replaceGalleryCaseImage, updateGalleryCaseText
    analytics.ts      # GA4 fetch + mock data generator
    gallery-data.ts   # readHomeGallery, writeHomeGallery, readCertificates, writeCertificates,
                      # readGalleryCases, writeGalleryCases
    blurPlaceholders.ts
    imageVersion.ts
    cloudflareLoader.ts
  i18n/
    routing.ts        # defineRouting — localePrefix: 'never', locales: ['bg','en']
    request.ts        # getRequestConfig — lazy JSON loading from src/locales/
  locales/
    bg.json           # Bulgarian strings (default locale)
    en.json           # English strings
  proxy.ts            # Middleware — next-intl + next-auth auth check
                      # (Next.js 16 uses proxy.ts, not middleware.ts)
data/
  home-gallery.json   # Home gallery images (managed by admin)
  certificates.json   # Certificate images (managed by admin)
  gallery-cases.json  # Before/after treatment cases (full CRUD managed by admin)
  pending-changes.json
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

### i18n — next-intl v4, wired since Phase 3
- `createNextIntlPlugin` wraps `next.config.js`; `NextIntlClientProvider` in root layout.
- Locale comes from the `[locale]` URL segment (`'bg'` | `'en'`), but the prefix never shows in URLs (`localePrefix: 'never'`).
- Server: `getTranslations('namespace')` → returns typed `t(key)` function.
- Client: `useTranslations('namespace')` → same API.
- `LanguageSwitcher` sets `NEXT_LOCALE` cookie + calls `router.refresh()` — no URL change.
- To add a string: add to `src/locales/bg.json` AND `en.json` under the same namespace/key.
- Bulgarian is the default locale and the fallback for missing English keys.
- **Never call `useLocale()` from a client component that might render outside `[locale]/layout.tsx`** — `NextIntlClientProvider` lives there; components used in `statistics/` or standalone contexts won't have it.

### LCP-critical server component rule
The home page (`src/app/[locale]/page.tsx`) must stay a **server component**.
- Hero image renders in the initial HTML → browser fetches it immediately, no JS wait.
- LCP was 9.3s (mobile) before this was fixed; it is now 2.9s.
- **Never add `'use client'` to this file.** Interactive gallery parts live in `HomeGalleryViewer.tsx` (visitor) and `HomeGalleryAdmin.tsx` (admin).

### Admin gallery pattern — Viewer/Admin split
Every gallery has three files: a server wrapper, a Viewer, and an Admin.

```
HomeGallery.tsx          ← async server component: reads data + checks auth()
HomeGalleryViewer.tsx    ← 'use client', lightbox only — ships to all visitors
HomeGalleryAdmin.tsx     ← 'use client', full edit controls — only rendered when session?.user
```

The server wrapper always follows this pattern:
```tsx
const [items, session] = await Promise.all([readData(), auth()]);
if (session?.user) return <*Admin initialItems={items} />;
return <*Viewer items={items} />;
```

Admin JS never ships to unauthenticated visitors. Only the lightweight Viewer bundle does.

**Gallery cases** follow the same split but the Admin is full CRUD (add/delete/replace images/edit text+aspect ratio) rather than just reorder:
```
gallery/page.tsx         ← async server component: readGalleryCases() + auth()
GalleryCasesViewer.tsx   ← 'use client', slider + load-more — receives locale as string prop
GalleryCasesAdmin.tsx    ← 'use client', full CRUD — receives locale as string prop
```
`locale` must be a **string prop** (not `useLocale()`) because these components can render outside `[locale]/layout.tsx` context.

### Server Actions — gallery mutations
All gallery mutations live in `src/lib/actions/gallery.ts` (file-level `'use server'`).

- `GalleryConfig` interface + config map keyed by `Gallery = 'home' | 'certificates'` — 3 shared private impls (`_upload`, `_remove`, `_reorder`)
- Gallery cases use separate named actions: `addGalleryCase`, `removeGalleryCase`, `replaceGalleryCaseImage`, `updateGalleryCaseText`, `reorderGalleryCases`
- `assertAdmin()` is called first in every action — throws `new Error('Unauthorized')` (NOT `Response` — Server Actions throw, API routes return)
- Client components call them directly: `await uploadGalleryImage('home', formData)` — no `fetch()`
- Body size limit for large image uploads lives under `experimental.serverActions.bodySizeLimit` in `next.config.js` — NOT top-level (Next.js 16.2.9 differs from Next.js 15 here)

### Gallery data
Source of truth lives in `data/` as JSON files. Read/write via `src/lib/gallery-data.ts`.
- `home-gallery.json` — home page clinic photos
- `certificates.json` — license certificates
- `gallery-cases.json` — before/after treatment cases

### Image pipeline — admin uploads
- Images uploaded via browser, saved to `public/Images/<gallery>/` with UUID filenames.
- **Home/certificates:** raw JPEG bytes passed through (no re-encode); EXIF rotation is handled by the browser (no quality loss). Non-JPEGs converted via `sharp` at quality 95.
- **Gallery cases (`processGalleryImage(file, targetRatio?)`):** when a ratio is provided, applies EXIF auto-rotation first (`sharp.rotate()`), reads post-rotation pixel dimensions, then center-crops to the target ratio with `sharp.resize(w, h, { fit: 'cover', position: 'center' })`. Both before and after images are cropped to the same ratio on upload, so `object-cover` fills them identically in the slider with no zoom mismatch.
- **No manual rotation UI** — removed in Phase 8. Doctor uploads via Xerox scanner (not iPhone), so EXIF rotation issues don't occur and re-encoding would cause quality loss. The `sharp.rotate()` EXIF auto-correction in `processGalleryImage` is kept (it's part of upload, not a UI button).
- **Windows sharp file lock fix:** on Windows, `sharp(filePath)` holds the file handle open; writing to the same path fails. Always read to buffer first: `const buf = fs.readFileSync(filePath); sharp(buf)...` — then write the output buffer back.
- `unoptimized` prop on all gallery `<Image>` — bypasses Next.js Lanczos3 downscaler which caused ringing on thumbnails.
- The static `prebuild` scripts (`optimize-images.js`, `generate-blur-placeholders.js`) still run before every `npm run build` for non-gallery static images.

### Analytics (GA4)
- In production, real GA4 data comes from `POST /api/analytics` (uses `googleapis`).
- In dev, the statistics page has a toggle button (`useMockData` state) that switches to generated mock data.
- The statistics dashboard (`/statistics/`) is Bulgarian-only — all UI strings are in `bg.json` statistics namespace.

### Auth
- Google OAuth via Auth.js (next-auth v5). Config: `src/auth.ts` — single entry point.
- **Import: `import { auth } from '@/auth'` — NOT `@/lib/auth`** (old path, doesn't export `auth`).
- Protected routes: `/statistics/*` and `/admin/*` (enforced in `src/proxy.ts`).
- In server components and Server Actions: call `await auth()` to get the session.

### Brand
- Design tokens live in `src/app/globals.css` as CSS custom properties, referenced everywhere via `var(--dp-*)`.
- Primary teal: `--dp-primary: #1a7a8a` | Accent amber: `--dp-accent: #f4a261`
- Background from: `--dp-bg-from: #f7f4ef` | Heading: `--dp-heading: #1a7a8a`
- CTA block: `--dp-cta-bg: #1a7a8a` | CTA button: `--dp-cta-btn-bg: #f4a261`
- Use `var(--dp-primary)` in JSX (inline styles or Tailwind arbitrary values like `text-[var(--dp-primary)]`).
- Fonts: `font-playfair` (Playfair Display) and `font-montserrat` (Montserrat)
  — CSS variables defined in `src/app/[locale]/layout.tsx`, used as Tailwind classes.
- Logo wordmark: `DentalPointLogo` component (`src/components/shared/DentalPointLogo.tsx`) — renders "DENTAL POINT" in Montserrat bold, primary + accent colors.

### Footer layout
Footer uses `flex justify-between` to push two groups to opposite edges:
- **Left:** wordmark (`DentalPointLogo` variant) + tagline (`t('footerTagline')`) + social icons, constrained to `max-w-[280px]`
- **Right:** `flex gap-16` — Navigation column + Contact column, both left-aligned inside their column
- On mobile: stacks to `flex-col`; columns always left-aligned
- Copyright bar: `text-white/60` (not the accent color)

### Cloudflare image loader
- `src/lib/cloudflareLoader.ts` is ready but not active in `next.config.js`.
- Enabling it offloads all image resizing to Cloudflare's edge network (free tier).
