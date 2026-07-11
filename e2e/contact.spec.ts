import fs from 'fs';
import path from 'path';
import { test, expect } from './fixtures';
import { toSofiaDateString } from '@/lib/format';

function sofiaDatePlusDays(days: number): string {
    const todayIso = toSofiaDateString(new Date());
    return new Date(new Date(`${todayIso}T00:00:00Z`).getTime() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

test.describe('contact — visitor', () => {
    test('page loads with contact form and no admin controls', async ({ page }) => {
        await page.goto('/contact');

        await expect(page.locator('input[name="name"]')).toBeVisible();
        await expect(page.locator('input[name="phone"]')).toBeVisible();
        await expect(page.locator('textarea[name="message"]')).toBeVisible();

        await expect(page.locator('input[type="checkbox"]')).not.toBeVisible();
    });

    test('submitting filled form shows success message', async ({ page }) => {
        await page.goto('/contact');

        await page.locator('input[name="name"]').fill('Иван Петров');
        await page.locator('input[name="phone"]').fill('0888123456');
        await page.locator('textarea[name="message"]').fill('Искам да направя терапия.');

        await page.locator('button[type="submit"]').click();

        await expect(page.getByText('Ще се свържем с вас възможно най-скоро.', { exact: true })).toBeVisible();
    });

    test('form validation prevents submission with empty message field', async ({ page }) => {
        await page.goto('/contact');

        await page.locator('input[name="name"]').fill('Иван Петров');
        await page.locator('input[name="phone"]').fill('0888123456');

        const messageValid = await page.locator('textarea[name="message"]').evaluate(
            (el: HTMLTextAreaElement) => el.validity.valid
        );
        expect(messageValid).toBe(false);

        await page.locator('button[type="submit"]').click();
        await expect(page.getByText('Ще се свържем с вас възможно най-скоро.', { exact: true })).not.toBeVisible();
    });

    // These three deliberately never submit a fully valid combination — submitContactForm
    // (src/lib/actions/contact.ts) returns on the validation-errors branch before it ever calls
    // appendContactSubmission/sendNtfyNotification, so an invalid submission can't reach ntfy.
    // That's what makes it safe to actually click submit here instead of only checking
    // el.validity.valid like the test above.
    test('invalid phone shows a format error and does not submit', async ({ page }) => {
        await page.goto('/contact');

        await page.locator('input[name="name"]').fill('Иван Петров');
        await page.locator('input[name="phone"]').fill('abc123');
        await page.locator('textarea[name="message"]').fill('Искам да направя терапия.');

        await page.locator('button[type="submit"]').click();

        await expect(page.getByText('Моля, въведете валиден телефонен номер (напр. 0876 346 261 или +359 876 346 261).')).toBeVisible();
        await expect(page.getByText('Ще се свържем с вас възможно най-скоро.', { exact: true })).not.toBeVisible();
    });

    test('too-short name shows a length error and does not submit', async ({ page }) => {
        await page.goto('/contact');

        await page.locator('input[name="name"]').fill('A');
        await page.locator('input[name="phone"]').fill('0888123456');
        await page.locator('textarea[name="message"]').fill('Искам да направя терапия.');

        await page.locator('button[type="submit"]').click();

        await expect(page.getByText('Името трябва да е поне 2 символа.')).toBeVisible();
        await expect(page.getByText('Ще се свържем с вас възможно най-скоро.', { exact: true })).not.toBeVisible();
    });

    test('too-short message shows a length error and does not submit', async ({ page }) => {
        await page.goto('/contact');

        await page.locator('input[name="name"]').fill('Иван Петров');
        await page.locator('input[name="phone"]').fill('0888123456');
        await page.locator('textarea[name="message"]').fill('Здравей');

        await page.locator('button[type="submit"]').click();

        await expect(page.getByText('Съобщението трябва да е поне 10 символа.')).toBeVisible();
        await expect(page.getByText('Ще се свържем с вас възможно най-скоро.', { exact: true })).not.toBeVisible();
    });
});

test.describe('contact — visitor — away-soon banner', () => {
    const settingsPath = path.join(process.cwd(), 'data', 'contact-settings.json');
    let originalSettings: string;

    test.beforeEach(() => {
        originalSettings = fs.readFileSync(settingsPath, 'utf8');
    });

    test.afterEach(() => {
        fs.writeFileSync(settingsPath, originalSettings);
    });

    // isContactAwaySoon() has a 3-day lead window before awayFrom. These two tests pin both
    // ends an admin actually cares about: "2 days out" (mid-window) and "3 days out" (the
    // exact boundary where the banner first appears) — both should still show the form (a
    // response just might be delayed), not replace it with the full away notice.
    test('shows a warning banner and a working form 2 days before the away period starts', async ({ page }) => {
        const from = sofiaDatePlusDays(2);
        const until = sofiaDatePlusDays(10);
        fs.writeFileSync(settingsPath, JSON.stringify({ awayEnabled: true, awayFrom: from, awayUntil: until }, null, 2));

        await page.goto('/contact');

        await expect(page.getByText(/Кабинетът ще бъде затворен от/)).toBeVisible();
        await expect(page.getByText('Отсъстваме временно')).not.toBeVisible();
        await expect(page.locator('input[name="name"]')).toBeEnabled();
    });

    test('still shows the banner exactly 3 days before the away period starts (upper boundary)', async ({ page }) => {
        const from = sofiaDatePlusDays(3);
        const until = sofiaDatePlusDays(10);
        fs.writeFileSync(settingsPath, JSON.stringify({ awayEnabled: true, awayFrom: from, awayUntil: until }, null, 2));

        await page.goto('/contact');

        await expect(page.getByText(/Кабинетът ще бъде затворен от/)).toBeVisible();
        await expect(page.locator('input[name="name"]')).toBeEnabled();
    });

    // The form actually closes FORM_CLOSE_LEAD_DAYS (1 day) before awayFrom, not on awayFrom
    // itself — a message sent the evening before has no realistic chance of a same-day reply,
    // so 1 day out should already show the full away notice instead of the banner+form.
    test('shows the full away notice (not the banner) 1 day before the away period starts', async ({ page }) => {
        const from = sofiaDatePlusDays(1);
        const until = sofiaDatePlusDays(10);
        fs.writeFileSync(settingsPath, JSON.stringify({ awayEnabled: true, awayFrom: from, awayUntil: until }, null, 2));

        await page.goto('/contact');

        await expect(page.getByText('Отсъстваме временно')).toBeVisible();
        await expect(page.getByText(/Кабинетът ще бъде затворен от/)).not.toBeVisible();
        await expect(page.locator('input[name="name"]')).not.toBeVisible();
    });
});

test.describe('contact — admin', () => {
    test.use({ storageState: 'e2e/.auth/admin.json' });

    test.beforeEach(async ({ page }) => {
        page.on('dialog', (dialog) => dialog.accept());
        await page.goto('/contact');
    });

    test('admin sees away-mode toggle and a working form preview initially', async ({ page }) => {
        await expect(page.getByLabel('Режим "Отсъстваме"')).toBeVisible();
        await expect(page.getByText('Изберете период')).not.toBeVisible();

        await expect(page.getByText('Отсъстваме временно')).not.toBeVisible();
        // The preview is real ContactForm markup, fully interactive — it mirrors exactly what a
        // visitor sees so the admin can validate copy/dates against the live page, not a locked mock.
        await expect(page.locator('input[name="name"]')).toBeEnabled();
    });

    test('enabling away mode reveals the calendar, updates live preview, and persists across contexts', async ({ page, browser }) => {
        const toggle = page.getByLabel('Режим "Отсъстваме"');

        await toggle.check();
        await page.getByText('Изберете период').click();

        // react-day-picker renders each day as <td data-day="YYYY-MM-DD"><button>...
        // — a stable, locale-independent selector, unlike the visible label text. The widget
        // computes "today" from LOCAL date parts, not UTC, so the test must match using the
        // same local getters — a UTC-based toISOString() can disagree near a timezone boundary.
        const today = new Date();
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        await page.locator(`td[data-day="${toIso(today)}"] button`).click();
        await page.locator(`td[data-day="${toIso(nextWeek)}"] button`).click();

        // Picking a complete range auto-saves — there's no Save button. Wait for that async
        // Server Action to actually land before continuing.
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: 'Готово' }).click();

        // Live preview updates immediately
        const previewCard = page.locator('.rounded-3xl');
        await expect(page.getByText('Отсъстваме временно')).toBeVisible();
        await expect(previewCard.getByText(/Кабинетът няма да работи от/)).toBeVisible();
        await expect(page.locator('input[name="name"]')).not.toBeVisible();

        // Fresh unauthenticated context to verify a real visitor sees the away notice too.
        // This describe block's `test.use({ storageState: 'e2e/.auth/admin.json' })` turns out
        // to apply even to browser.newContext() calls made from within the test — an empty
        // options object still silently inherited the admin session-token cookie. Passing an
        // explicit blank storageState overrides that instead of relying on "no options" meaning
        // "no state" (confirmed by dumping newContext.cookies(), which showed authjs.session-token
        // present before this context had done anything of its own).
        const newContext = await browser.newContext({ storageState: { cookies: [], origins: [] } });
        const newPage = await newContext.newPage();

        await newContext.addCookies([
            { name: 'NEXT_LOCALE', value: 'bg', domain: 'localhost', path: '/' },
        ]);
        await newPage.addInitScript(() => {
            localStorage.setItem('cookie-consent', 'true');
        });

        await newPage.goto('/contact');

        await expect(newPage.getByText('Отсъстваме временно')).toBeVisible();
        await expect(newPage.getByText(/Кабинетът няма да работи от/)).toBeVisible();
        await expect(newPage.locator('input[name="name"]')).not.toBeVisible();

        // Scoped to <main> — the site footer (rendered on every page) shows these same
        // numbers in its Contact column, so an unscoped getByText() matches both.
        await expect(newPage.getByRole('main').getByText('0876 346 261')).toBeVisible();
        await expect(newPage.getByRole('main').getByText('0878 355 494')).toBeVisible();

        await newContext.close();
    });

    test('disabling away mode restores form view and auto-saves without a Save click', async ({ page }) => {
        // Self-contained: seed the "on" state directly rather than relying on the previous test
        // having left it enabled, so this test doesn't cascade-fail if that one does.
        const settingsPath = path.join(process.cwd(), 'data', 'contact-settings.json');
        const today = sofiaDatePlusDays(0);
        const nextWeek = sofiaDatePlusDays(7);
        fs.writeFileSync(settingsPath, JSON.stringify({ awayEnabled: true, awayFrom: today, awayUntil: nextWeek }, null, 2));

        await page.reload();
        const toggle = page.getByLabel('Режим "Отсъстваме"');
        await expect(toggle).toBeChecked();

        // Unchecking saves itself immediately — no Save button is shown while away-mode is off,
        // so there's nothing to click here.
        await toggle.uncheck();

        await expect(page.getByText('Отсъстваме временно')).not.toBeVisible();
        await expect(page.locator('input[name="name"]')).toBeEnabled();

        // Unchecking triggers an async Server Action save with no visible "saved" indicator (no
        // Save button is shown while away-mode is off) — wait for that request to actually land
        // before reloading, otherwise the reload can race ahead of the disk write.
        await page.waitForLoadState('networkidle');

        // Reload to confirm the off-state (and cleared dates) actually persisted to disk, not
        // just local React state
        await page.reload();
        await expect(toggle).not.toBeChecked();
        const saved = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        expect(saved).toEqual({ awayEnabled: false, awayFrom: '', awayUntil: '' });
    });
});
