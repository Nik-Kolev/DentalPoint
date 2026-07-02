import { test as base, expect } from '@playwright/test';

// Every spec imports test/expect from here instead of '@playwright/test' directly, so the
// cookie-consent banner (CookieConsent.tsx, gated on localStorage — not a cookie, so it isn't
// covered by storageState's cookie jar alone) never blocks clicks on real page content. A fresh
// Playwright context has no localStorage, so without this every single test would hit the banner.
export const test = base.extend({
    page: async ({ page, context }, use) => {
        // Without a NEXT_LOCALE cookie, next-intl's middleware negotiates locale from
        // Accept-Language, and Playwright's default context reports the OS locale (English) —
        // overriding the app's actual Bulgarian default and breaking every Bulgarian-text assertion.
        await context.addCookies([
            { name: 'NEXT_LOCALE', value: 'bg', domain: 'localhost', path: '/' },
        ]);
        await page.addInitScript(() => {
            localStorage.setItem('cookie-consent', 'true');
        });
        await use(page);
    },
});

export { expect };
