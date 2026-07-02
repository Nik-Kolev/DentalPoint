import { test, expect } from './fixtures';
import path from 'path';

const beforeImage = path.join(__dirname, 'fixtures', 'test-before.jpg');
const afterImage = path.join(__dirname, 'fixtures', 'test-after.jpg');

test.describe('gallery cases — visitor', () => {
    test('page loads with title and a before/after slider', async ({ page }) => {
        await page.goto('/gallery');
        await expect(page.locator('h1').first()).toBeVisible();
        await expect(page.locator('img').first()).toBeVisible();
    });

    test('load-more and show-less work on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/gallery');

        const loadMoreButton = page.getByRole('button', { name: 'Зареди още' });
        await expect(loadMoreButton).toBeVisible();
        await loadMoreButton.click();

        const showLessButton = page.getByRole('button', { name: 'Покажи по-малко' });
        await expect(showLessButton).toBeVisible();
        await showLessButton.click();
        await expect(loadMoreButton).toBeVisible();
    });
});

test.describe('gallery cases — admin', () => {
    test.use({ storageState: 'e2e/.auth/admin.json' });

    test.beforeEach(async ({ page }) => {
        page.on('dialog', (dialog) => dialog.accept());
        await page.goto('/gallery');
        await page.getByRole('button', { name: '✏️ Редактирай' }).click();
    });

    test('adds a case, edits its text, replaces an image, then deletes it', async ({ page }) => {
        await page.getByRole('button', { name: '+ Добави нов случай' }).click();

        // The upload areas are <button>s whose visible text is "+ Преди"/"+ След". Plain
        // substring "Преди" also matches "Замени преди"/"Върни преди промените" buttons
        // elsewhere on the page, so match the full "+ <slot>" text these buttons render.
        await page.getByRole('button', { name: '+ Преди' }).click();
        await page.locator('input[type="file"]').first().setInputFiles(beforeImage);
        await page.getByRole('button', { name: '+ След' }).click();
        await page.locator('input[type="file"]').nth(1).setInputFiles(afterImage);

        await page.getByPlaceholder('Композитно възстановяване').fill('E2E Test Case');
        await page.getByPlaceholder('Composite Bonding').fill('E2E Test Case EN');

        await page.getByRole('button', { name: 'Добави случай' }).click();
        await expect(page.getByText('E2E Test Case', { exact: true })).toBeVisible({ timeout: 15_000 });

        // New cases are always prepended to the top of the list, and only one case can be in
        // text-edit mode at a time (editingId is a single value) — so instead of scoping to a
        // "row" container, .first() on each control unambiguously targets our new case.
        await page.getByRole('button', { name: '✏️ Текст и вид' }).first().click();
        await page.getByRole('button', { name: '2:1' }).first().click();
        await page.locator('input[type="text"]').first().fill('E2E Test Case Edited');
        await page.getByRole('button', { name: 'Запази' }).click();
        // Save is a real server round-trip (updateGalleryCaseText) — under load from a full
        // suite run this can take longer than Playwright's 5s default, so give it more room
        // like the other persistence checks in this file already do.
        await expect(page.getByText('E2E Test Case Edited', { exact: true })).toBeVisible({ timeout: 15_000 });

        // Replace the "before" image on this case (first "Замени преди" button = our top case)
        const beforeImg = page.locator('img[alt="Before treatment"]').first();
        const originalBeforeSrc = await beforeImg.getAttribute('src');
        await page.getByRole('button', { name: 'Замени преди' }).first().click();
        await page.locator('input[type="file"]').setInputFiles(afterImage);
        await expect
            .poll(async () => beforeImg.getAttribute('src'), { timeout: 15_000 })
            .not.toBe(originalBeforeSrc);

        // Clean up — delete the disposable case
        await page.getByRole('button', { name: '✕ Изтрий' }).first().click();
        await expect(page.getByText('E2E Test Case Edited', { exact: true })).toHaveCount(0, { timeout: 15_000 });
    });

    test('edit mode toggle enters and exits', async ({ page }) => {
        await expect(page.getByRole('button', { name: '✕ Изход' })).toBeVisible();
        await page.getByRole('button', { name: '✕ Изход' }).click();
        await expect(page.getByRole('button', { name: '✏️ Редактирай' })).toBeVisible();
    });
});
