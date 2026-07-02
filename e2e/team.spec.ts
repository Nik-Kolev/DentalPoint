import { test, expect } from './fixtures';
import path from 'path';

const testImage = path.join(__dirname, 'fixtures', 'test-cert.jpg');

test.describe('team — visitor', () => {
    test('page loads with two members and no edit controls', async ({ page }) => {
        await page.goto('/team');
        await expect(page.locator('h1').first()).toBeVisible();
        await expect(page.locator('article')).toHaveCount(2);
        await expect(page.getByRole('button', { name: '✏️ Редактирай' })).toHaveCount(0);
    });
});

test.describe('team — admin', () => {
    test.use({ storageState: 'e2e/.auth/admin.json' });

    test.beforeEach(async ({ page }) => {
        page.on('dialog', (dialog) => dialog.accept());
        await page.goto('/team');
        await page.getByRole('button', { name: '✏️ Редактирай' }).click();
    });

    test('edits a member\'s text, saves, then reverts back to the original via the global revert', async ({ page }) => {
        const firstCard = page.locator('article').first();
        // Each portrait's ImageSlot owns its own hidden file input inside the article now, so
        // scope to input[type="text"] specifically rather than "first input" (which would hit
        // the hidden file input instead of the name field).
        const nameInput = firstCard.locator('input[type="text"]').first();
        const originalName = await nameInput.inputValue();

        await nameInput.fill('E2E Test Name');
        await firstCard.getByRole('button', { name: 'Запази' }).click();

        // Saving exits edit mode globally (documented, intentional) — re-enter to verify persistence
        await expect(page.getByRole('button', { name: '✏️ Редактирай' })).toBeVisible();
        await expect(page.locator('article').first().locator('h2')).toHaveText('E2E Test Name');

        await page.getByRole('button', { name: '✏️ Редактирай' }).click();
        await page.locator('article').first().locator('input[type="text"]').first().fill(originalName);
        await page.locator('article').first().getByRole('button', { name: 'Запази' }).click();
        await expect(page.locator('article').first().locator('h2')).toHaveText(originalName);
    });

    test('per-card cancel resets fields without saving to disk', async ({ page }) => {
        const firstCard = page.locator('article').first();
        const nameInput = firstCard.locator('input[type="text"]').first();
        const originalName = await nameInput.inputValue();

        await nameInput.fill('Should not persist');
        await firstCard.getByRole('button', { name: '↩ Върни промените на тази карта' }).click();
        await expect(nameInput).toHaveValue(originalName);

        // Never saved — exiting and re-entering edit mode should show the untouched original
        await page.getByRole('button', { name: '✕ Изход' }).click();
        await page.getByRole('button', { name: '✏️ Редактирай' }).click();
        await expect(page.locator('article').first().locator('input[type="text"]').first()).toHaveValue(originalName);
    });

    test('replaces a member photo', async ({ page }) => {
        const firstCard = page.locator('article').first();
        const originalSrc = await firstCard.locator('img').getAttribute('src');

        // The camera overlay button sits on top of the <img> itself (absolute inset-0) —
        // click the overlay button, not the image, which the overlay would just intercept anyway.
        // Each portrait now owns its own hidden file input (one per ImageSlot instance), so
        // scope to this card specifically rather than a page-wide input[type="file"] query.
        await firstCard.locator('button').first().click();
        await firstCard.locator('input[type="file"]').setInputFiles(testImage);

        await expect
            .poll(async () => firstCard.locator('img').getAttribute('src'), { timeout: 15_000 })
            .not.toBe(originalSrc);
    });

    test('edit mode toggle enters and exits', async ({ page }) => {
        await expect(page.getByRole('button', { name: '✕ Изход' })).toBeVisible();
        await page.getByRole('button', { name: '✕ Изход' }).click();
        await expect(page.getByRole('button', { name: '✏️ Редактирай' })).toBeVisible();
    });
});
