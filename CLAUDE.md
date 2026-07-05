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
- **Auth.js (next-auth v5)** — Google OAuth, multi-email allowlist (`ALLOWED_EMAILS`, comma-separated). No dedicated `/admin` page — admin controls render inline on content pages (home/team/gallery/licenses) when signed in. `proxy.ts` still lists `/admin` in `protectedPaths` from an earlier design; harmless (no page exists there to protect) but not load-bearing.
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
    admin/            # Shared admin primitives: ImageSlot, AdminActionBar, BilingualTextFields
                      # — composed by all 4 admin components, see Conventions below
    layout/           # Navigation, DeferredWidgets
    shared/           # StaticCTA, BackToTop, CookieConsent, DentalPointLogo, etc.
    statistics/       # BarChart
  hooks/
    useImageUpload.ts           # Headless upload-state hook
    useReorderableCollection.ts # Drag-reorder + revert state/handlers
  lib/
    actions/
      gallery.ts      # Server Actions: uploadGalleryImage, removeGalleryImage,
                      # reorderGallery (home/certs), reorderGalleryCases, addGalleryCase,
                      # removeGalleryCase, replaceGalleryCaseImage, updateGalleryCaseText
    analytics.ts      # GA4 fetch + mock data generator
    gallery-data.ts   # readHomeGallery, writeHomeGallery, readCertificates, writeCertificates,
                      # readGalleryCases, writeGalleryCases
    heroBlurPlaceholder.ts
    imageVersion.ts
    cloudflareLoader.ts
    reviews.ts        # ReviewItem type + getAverageRating — shared by HomeReviews and layout.tsx's JSON-LD
  i18n/
    routing.ts        # defineRouting — localePrefix: 'never', locales: ['bg','en']
    request.ts        # getRequestConfig — lazy JSON loading from src/locales/
  locales/
    bg.json           # Bulgarian strings (default locale)
    en.json           # English strings
  proxy.ts            # Middleware — next-intl rewrite + protected-route session check via
                      # next-auth/jwt's getToken() (NOT the auth() wrapper — see Auth section)
                      # (Next.js 16 uses proxy.ts, not middleware.ts)
data/
  home-gallery.json   # Home gallery images (managed by admin) — gitignored (Phase 11), admin-mutated
  certificates.json   # Certificate images (managed by admin) — gitignored (Phase 11), admin-mutated
  gallery-cases.json  # Before/after treatment cases (full CRUD managed by admin) — gitignored (Phase 11)
  team.json           # Team member bios/photos (managed by admin) — gitignored (Phase 11)
  contact-settings.json  # Away-mode toggle — gitignored (Phase 11)
  pending-changes.json   # gitignored (Phase 11)
e2e/                  # Playwright e2e suite — see "E2E testing" in Conventions below
playwright.config.ts
```

## Commands
```bash
npm run dev              # Local dev server
npm run build            # Production build
npm run test:e2e         # Playwright e2e suite (npx playwright test)
npm run test:e2e:ui      # Playwright UI mode, for debugging a single spec
```

## Deployment
- **Auto-deploy triggers on every push to `main`** via GitHub Actions → PM2 restart on VPS
- Server: VPS (1 CPU, 1GB RAM) with PM2 + Nginx + Cloudflare CDN (DigitalOcean droplet)
- Server path: `/var/www/DentalPoint`
- Nginx config is version-controlled: `nginx.conf.dentalpoint`
- **`public/maintenance.html`** — served directly by nginx's `@maintenance` fallback (`try_files /maintenance.html =502`) when the Next.js app itself is down, so it's plain static HTML/CSS/JS with no access to `globals.css` custom properties, next-intl, or React — brand colors are hardcoded hex (`#1a7a8a`/`#f4a261`/`#f7f4ef`, matching the design tokens), and the wordmark logo is hand-replicated markup, not the `DentalPointLogo` component. Bilingual: an inline `<script>` in `<head>` (runs before paint, same no-FOUC pattern as theme-detection scripts) reads the `NEXT_LOCALE` cookie, falling back to `navigator.language` if absent — mirrors next-intl's own cookie-then-Accept-Language resolution order. Content is deliberately not just an apology message — it includes both doctors' phone numbers (plain text, not `tel:` links) and the clinic's Facebook/Instagram/address, since an outage shouldn't cut visitors off from every way of reaching the clinic.
- To skip deploy: include `[skip ci]` in the commit message
- Manual fallback on server: `bash fix-build.sh`
- Admin-mutated content (`data/*.json`, `public/Images/{certificates,gallery,owners}`, and everything in `public/Images/front/` except `clinic.jpg`) is gitignored (Phase 11) — deploy's `git reset --hard` never touches it. `deploy.yml` deliberately has no `git clean -fd` for the same reason.
- **`package.json` has an `overrides` entry pinning `@swc/helpers` to `^0.5.17`.** Without it, npm's resolver can silently pick a version that satisfies `next`'s own requirement but not `next-intl`'s bundled `@swc/core` (`>=0.5.17`) — `npm install`/`tsc`/lint/build/e2e all pass locally regardless, but `npm ci` (which deploy.yml uses) fails hard with `EUSAGE: Missing @swc/helpers@X from lock file`. If you ever bump `next-intl` again, run a clean `npm ci` locally before trusting the lockfile — this is the one check that catches it.
- **First real production deploy since 2026-04-04 confirmed working end-to-end as of 2026-07-05** (Phase 12) — see `roadmap.md` Phase 12 for the full incident log (3 issues found and fixed: the `@swc/helpers` lockfile gotcha above, the Auth.js `proxy.ts` redirect loop, and a `callbackUrl` bug — both documented in the Auth section below).

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

### Admin primitives — shared mechanisms across all 4 admin components
`HomeGalleryAdmin`, `CertificatesAdmin`, `GalleryCasesAdmin`, `TeamAdmin` each compose 5 shared building blocks instead of reimplementing the same mechanisms 4 times:

- `src/hooks/useImageUpload.ts` — headless upload-state hook (`{ uploading, handleFile }`). Doesn't own an `<input>` — callers wire their own, so a single shared input can still drive many items (e.g. Gallery Cases' before/after replace buttons, which need per-slot busy state `useImageUpload`'s single-flag model doesn't fit, so that one stays bespoke by design — not a missed extraction).
- `src/hooks/useReorderableCollection.ts` — plain hook, not a rendering component. Owns `items`/`dragId`/`dragOverId`/drag handlers/`revert(confirmMessage)`. Used by Home Gallery, Certificates, Gallery Cases — not Team, which has nothing to reorder (2 fixed doctors).
- `src/components/admin/ImageSlot.tsx` — "one image, optionally editable." `variant="grid-cell"` (drag handle + delete, no replace — Home/Certs never supported per-item replace) or `variant="portrait"` (camera-overlay replace, no delete — Team). Not used for Gallery Cases' before/after images (stays on `BeforeAfterSlider`, a comparison-slider widget that doesn't fit an image+overlay shape).
- `src/components/admin/AdminActionBar.tsx` — the floating revert/done pill bar. Independent of drag/reorder (Team uses it too, despite having no collection to reorder).
- `src/components/admin/BilingualTextFields.tsx` — renders only BG/EN field pairs; does not own Save/Cancel or extra controls (callers compose their own action row, since e.g. Gallery Cases needs aspect-ratio preset buttons between the fields and its Save/Cancel row). Three `layout` modes (`columns`/`rows`/`grouped`) exist because Gallery Cases' add-form, Gallery Cases' edit-form, and Team's edit-form each had a genuinely different existing visual layout — pass an explicit `idPrefix` too, since two instances (e.g. an open "add new" form + an open per-case edit form) can coexist on the same page and would otherwise collide on duplicate DOM ids.

**Native HTML5 drag-and-drop, not a library.** `draggable={editMode}`, `onDragStart`/`onDragOver`/`onDrop`/`onDragEnd`, with `dragId`/`dragOverId` state and a swap-two-array-indices reorder algorithm. Gallery Cases additionally gates with `draggable={editMode && !isEditing}` so a case can't be dragged while its own text-edit form is open.

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

**The production server is the sole source of truth for all admin-mutated content** — every file in `data/*.json` plus admin-uploaded images (`public/Images/{certificates,gallery,owners}` and `public/Images/front/` except `clinic.jpg`) and `data/contact-submissions.json` ("messages"). This is deliberate and one-way: code flows git → GitHub → deploy → server; this content never flows in the other direction, and never will — that's what Phase 11's gitignore rule exists to guarantee (see Deployment section above). There is no backup/sync step that mirrors the server's content down to a local machine.

Practical implications:
- **A fresh `git clone` has none of these files.** `gallery-data.ts`'s and `contact-data.ts`'s read functions all default to `[]` (or a sane default object) when a file is missing, specifically so `npm run dev` works out of the box with an empty gallery/team/messages state — don't reintroduce a bare `fs.readFileSync` without that check.
- Any `data/*.json` or admin-uploaded image sitting in a local working copy is disconnected scratch content (either from local testing or a one-off manual copy) — it does not reflect, and cannot be pushed to, what's actually live on the server.
- To fix already-live admin content (e.g. a bad upload), either re-do the action through the live admin UI, or SSH into the server directly — a code deploy cannot touch it.

### Image pipeline — admin uploads
- Images uploaded via browser, saved to `public/Images/<gallery>/` with UUID filenames.
- **Home/certificates:** raw JPEG bytes passed through (no re-encode); EXIF rotation is handled by the browser (no quality loss). Non-JPEGs converted via `sharp` at quality 95.
- **Certificates display aspect ratio (`src/lib/certificateAspectRatio.ts`):** each certificate still stores its *exact* measured aspect ratio at upload time (`actions/gallery.ts`'s `computeAspectRatio` flag, unchanged), but `CertificatesViewer`/`CertificatesAdmin` no longer apply that raw value directly to the CSS container. Since CSS Grid gives every card in a row equal width, deriving height from each image's own micro-varying ratio made same-orientation cards render at visibly different heights (Phase 13 bug report). `getCertificateDisplayRatio()` snaps the *displayed* ratio to one of two fixed values — `1600/1121` (landscape) or `1121/1600` (portrait) — chosen because that's the single most common exact measurement already present across the real scanned certificates, not an arbitrary preset. `object-contain` still guarantees zero cropping; the only visible cost is a sliver of extra card-mat margin on the few outlier images. This is a display-only transform — it's automatic for any future upload, no reprocessing step needed. Different from the single-global-preset system Phase 8.5 explicitly rejected: that one used a made-up ratio that didn't fit the real photos and caused heavy letterboxing; this one is derived from the real data, so it fits almost all images almost exactly.
- **Gallery cases (`processGalleryImage(file, targetRatio?)`):** when a ratio is provided, applies EXIF auto-rotation first (`sharp.rotate()`), reads post-rotation pixel dimensions, then center-crops to the target ratio with `sharp.resize(w, h, { fit: 'cover', position: 'center' })`. Both before and after images are cropped to the same ratio on upload, so `object-cover` fills them identically in the slider with no zoom mismatch.
- **Home gallery images should be pre-cropped to the grid's actual display aspect ratio, not left to the browser.** `HomeGalleryViewer.tsx`'s grid cells are a fixed `aspect-[4/3]` box, but portrait source photos (common — a phone held upright, EXIF-rotated) don't match that ratio. Leaving the crop to `object-cover` at render time means the *browser* crops+scales a full-resolution image live on every page load, which visibly looks worse than doing the same crop once, server-side, with a proper resize algorithm — confirmed directly (Phase 13, 2026-07-05): a set of 6 live photos that looked "soft"/blurry were not actually a JPEG-quality problem at all, they were this exact mismatch. Fix by applying the same `fit: 'cover', position: 'center'` resize used for gallery cases, targeting the grid's real 4:3 ratio, before the file is ever served — not by adjusting JPEG quality or resolution caps, which don't address a shape mismatch.
- **Reusing a filename to swap an image's content does not bust the Cloudflare cache.** `/Images/` is served with `Cache-Control: public, max-age=31536000, immutable` — confirmed via `curl -I` that Cloudflare will keep serving the old bytes at that exact URL for up to a year (`Cf-Cache-Status: HIT`) even after the origin file changes. Any manual/SSH content swap for an existing gallery image must use a new filename (and update the referencing `data/*.json` entry), not overwrite the old one in place.
- **No manual rotation UI** — removed in Phase 8. Doctor uploads via Xerox scanner (not iPhone), so EXIF rotation issues don't occur and re-encoding would cause quality loss. The `sharp.rotate()` EXIF auto-correction in `processGalleryImage` is kept (it's part of upload, not a UI button).
- **Windows sharp file lock fix:** on Windows, `sharp(filePath)` holds the file handle open; writing to the same path fails. Always read to buffer first: `const buf = fs.readFileSync(filePath); sharp(buf)...` — then write the output buffer back.
- `unoptimized` prop on all gallery `<Image>` — bypasses Next.js Lanczos3 downscaler which caused ringing on thumbnails.
- Blur-up placeholder for the home hero image (`clinic.jpg`) is a single hardcoded constant (`src/lib/heroBlurPlaceholder.ts`), not a generated lookup table — it's the only image on the site that ever uses one, so a scanning script + generic `Record` map was more machinery than the one value needed (Phase 11).
- **No image-optimization maintenance script** (removed Phase 11) — `optimize-images.js` scanned all of `public/Images/`, including the admin-managed folders (`front/`, `certificates/`, `gallery/`, `owners/`). Re-running it against live admin content would silently desync stored metadata — certificates' `aspectRatio` in `certificates.json` is measured at upload time from exact pixel dimensions, and any later resize/trim would invalidate it without updating the JSON. Its one legitimately-static target (`logo/`) had a config bug (missing `minSize`) that made it a permanent no-op there anyway, and 3 of the 4 logo files were unused (deleted; only `cropped_logo_dp.jpg` is referenced, as an SEO JSON-LD URL, not a rendered `<Image>`).

### E2E testing (Playwright)
Suite lives in `e2e/` at project root, config at `playwright.config.ts`. Single sequential project (`workers: 1`, `fullyParallel: false`) — admin specs mutate shared server-side JSON files (`data/*.json`), so parallel workers would race on them. `retries: 1` locally too (not just CI) — a full run occasionally hits a transient dev-server slowdown that shows up as one test failing on a plain navigation, unrelated to app logic.

- **`e2e/global-setup.ts`/`global-teardown.ts`** — file-copy based snapshot/restore, not git: setup copies the current `data/*.json` + `public/Images/{certificates,gallery,owners}` into `e2e/.data-backup/` (gitignored); teardown restores from that snapshot and deletes the backup, pass or fail. This is what makes it safe for tests to freely add/delete/replace real-shaped content — never hand-track cleanup per test, rely on this net. (Was `git checkout`/`git clean`-based before Phase 11 — switched to filesystem copy once `data/*.json` and those image dirs became gitignored, since git can no longer reset paths it doesn't track.) `contact-submissions.json` is always reset to `[]` rather than restored (PII, 60-day retention — never worth preserving across a test run).
- **`e2e/setup/auth.setup.ts`** — mints a real Auth.js session JWT directly via `next-auth/jwt`'s `encode()`, using the actual `NEXTAUTH_SECRET`, bypassing Google OAuth entirely (Playwright can't click through a real Google consent screen). Zero changes to `src/auth.ts`. The `salt` param must equal the literal cookie name (`'authjs.session-token'` for non-HTTPS dev) — this was confirmed by reading `@auth/core`'s internal callback source, not guessed.
- **`e2e/fixtures.ts`** — every spec imports `test`/`expect` from here, not `@playwright/test` directly. Auto-injects a `cookie-consent` localStorage flag (a fresh browser context has no prior consent, so the banner blocks clicks on real content) and a `NEXT_LOCALE=bg` cookie (Playwright's default context reports the OS locale via `Accept-Language`, which next-intl falls back to without a cookie — silently rendering English instead of the app's actual Bulgarian default).
- **Native HTML5 drag-and-drop:** `locator.dragTo()` does not reliably trigger this app's `draggable`/`ondragstart`/`ondragover`/`ondrop` handlers. Dispatch real `DragEvent`s via `page.evaluate()` instead, with short waits between dragstart→dragover→drop→dragend so React actually commits each state update before the next event fires.

### Analytics (GA4)
- In production, real GA4 data comes from `POST /api/analytics` (uses `googleapis`, service-account credentials, reads GA4's Reports API — this has a 24–48h processing lag and `getDateRange()` deliberately excludes "today", so brand-new traffic never appears same-day).
- In dev, the statistics page has a toggle button (`useMockData` state) that switches to generated mock data.
- The statistics dashboard (`/statistics/`) is Bulgarian-only — all UI strings are in `bg.json` statistics namespace.
- **Client-side tracking (`CookieConsent.tsx`) uses `@next/third-parties`'s `<GoogleAnalytics gaId={...} />`**, not a hand-rolled `gtag`/`dataLayer` script injection — the latter was tried first and never actually sent a beacon (confirmed by direct `sendBeacon`/`fetch` instrumentation showing zero calls, even with Google's own unmodified reference snippet tested the same way). The component is conditionally rendered based on cookie-consent state (mounted only after accept, or on future visits if already accepted) rather than always-mounted with a Consent Mode `consent: 'default'` gate — since it never loads until consent is real, there's nothing left to default-deny.

### Auth
- Google OAuth via Auth.js (next-auth v5). Config: `src/auth.ts` — single entry point.
- **Import: `import { auth } from '@/auth'` — NOT `@/lib/auth`** (old path, doesn't export `auth`).
- Protected routes: `/statistics/*` and `/admin/*` (enforced in `src/proxy.ts`).
- In server components and Server Actions: call `await auth()` to get the session. This is fine and correct there.
- **`src/proxy.ts` deliberately does NOT use the `auth((req) => {...})` wrapper pattern** (Phase 12 incident, 2026-07-05). Wrapping the whole proxy in `auth()` mutates the request's perceived origin (via `NEXTAUTH_URL`) *before* `next-intl`'s middleware runs on it inside the callback — this made `next-intl` build an absolute rewrite URL instead of a relative one, which Next.js then treats as a real cross-origin redirect instead of an internal rewrite, producing an infinite `/` → `/` redirect loop. This is invisible in local dev and even local `next start` — it only reproduces when `NEXTAUTH_URL` differs from the request's actual origin, i.e. only in real production behind nginx/Cloudflare, which is why it wasn't caught until the very first real deploy since April. `proxy.ts` instead calls `next-auth/jwt`'s `getToken({ req, secret: process.env.NEXTAUTH_SECRET })` directly for the protected-path check — it reads the session cookie without touching `req.nextUrl` at all. If you ever reintroduce the `auth()` wrapper here, retest a real deploy behind Cloudflare, not just local dev.
- Relatedly: when building a redirect URL in `proxy.ts` (e.g. the sign-in `callbackUrl`), use `req.nextUrl.pathname + req.nextUrl.search` (relative), never the raw `req.url` or `req.nextUrl.origin` — `req.nextUrl`'s origin is Next.js's internal server address (e.g. `http://localhost:3000`), not the public domain. Caught live once already (callbackUrl pointed at `localhost:3000` in production).
- `AUTH_TRUST_HOST=true` is set both in `.env.production` and as `trustHost: true` in `src/auth.ts`'s config — a genuine requirement for Auth.js v5 behind a reverse proxy, kept even though it didn't turn out to be what fixed the redirect loop above.

### SEO
- **Every page's `generateMetadata` must set its own `alternates: { canonical: '/<path>' }`.** Next.js metadata inheritance is shallow per top-level key — a child route only overrides a key if it explicitly sets it; otherwise the parent's value flows through untouched. The root `[locale]/layout.tsx` sets `alternates: { canonical: '/' }` for the homepage, so any page that skips its own `alternates` silently inherits `/` as its canonical URL — telling Google that page is a duplicate of the homepage. Found live on `contact`/`team`/`gallery`/`licenses`/`privacy` (Phase 14, 2026-07-05) before this rule existed.
- `sitemap.ts` must list flat, unprefixed URLs (`/`, `/contact`, `/team`, `/gallery`, `/licenses`) — the site uses `localePrefix: 'never'`, so `/bg`/`/en`-prefixed entries 307-redirect before Google ever indexes them there.
- **The `DentalClinic` JSON-LD block in `[locale]/layout.tsx` (address, phone, hours) has no automatic single source of truth with the visible page copy** — when the real address/hours change in `bg.json`/`en.json` (footer, home contact bar), the structured-data fields must be updated by hand in the same pass. Caught live (Phase 14): the schema still had the clinic's old street address (`ул. "Ген. Гурко" 5`) and old hours weeks after the footer/home page had already moved to the real ones (`ул. "Подполковник Калитин" 2`, 09:30–18:30) — a real NAP (Name/Address/Phone) mismatch that erodes local-SEO trust signals, not just a cosmetic inconsistency.
- **`AggregateRating`/`Review` JSON-LD in `[locale]/layout.tsx` is derived from the same real review data `HomeReviews.tsx` renders on the home page** (name/rating/date/text, translated under the `reviews` namespace) — not invented separately, since Google's structured-data guidelines require it to match content actually visible to visitors. The average-rating calculation (`getAverageRating`) lives once in `src/lib/reviews.ts` and is imported by both `HomeReviews.tsx` and `layout.tsx`, so the visible "X.X · N reviews" summary and the JSON-LD `ratingValue`/`reviewCount` can't drift apart.

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
- **Active** since Phase 11 (`next.config.js`: `images.loader: 'custom'`, `loaderFile: './src/lib/cloudflareLoader.ts'`). Confirmed working in production — image requests resolve through `https://dentalpoint.bg/cdn-cgi/image/...`.
- Only affects the 4 `<Image>` call sites that don't set `unoptimized`: home hero (`page.tsx`, LCP-critical), `TeamViewer.tsx`, `TeamAdmin.tsx`, `BeforeAfterSlider.tsx`. All gallery/certificate images use `unoptimized` and bypass this entirely.
- `cloudflareLoader.ts` requires the `'use client'` directive at the top — Next.js needs to serialize a custom `loaderFile`'s exported function across the server/client boundary.
- Offloads resize/format work to Cloudflare's edge, reducing CPU load on the 1 CPU/1GB VPS.
