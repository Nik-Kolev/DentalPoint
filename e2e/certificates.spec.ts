import { test, expect } from './fixtures';

test.describe('certificates — visitor', () => {
    test('page loads with title and stats section', async ({ page }) => {
        await page.goto('/licenses');
        await expect(page.locator('h1').first()).toBeVisible();
        await expect(page.getByText('Доволни пациенти')).toBeVisible();
    });

    test('load-more and show-less work on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/licenses');

        const loadMoreButton = page.getByRole('button', { name: 'Зареди още' });
        await expect(loadMoreButton).toBeVisible();
        const cards = page.locator('img[alt^="certificate-"]');
        const initialCount = await cards.count();

        await loadMoreButton.click();
        await expect(cards).toHaveCount(initialCount + 3);

        const showLessButton = page.getByRole('button', { name: 'Покажи по-малко' });
        await expect(showLessButton).toBeVisible();
        await showLessButton.click();
        await expect(cards).toHaveCount(initialCount);
    });
});

// Upload/delete/reorder are covered by home-gallery.spec.ts — Certificates and Home Gallery
// share the exact same ImageSlot/useReorderableCollection/AdminActionBar primitives and the
// same generic uploadGalleryImage/removeGalleryImage/reorderGallery server actions, so a second
// full CRUD pass here would only re-verify the identical code path, not different behavior.
// This keeps just what's genuinely certificates-specific: that the Admin component actually
// mounts and gates on the session correctly for this route.
test.describe('certificates — admin', () => {
    test.use({ storageState: 'e2e/.auth/admin.json' });

    test('edit mode toggle enters and exits', async ({ page }) => {
        await page.goto('/licenses');
        await page.getByRole('button', { name: '✏️ Редактирай' }).click();
        await expect(page.getByRole('button', { name: '✕ Изход' })).toBeVisible();
        await page.getByRole('button', { name: '✕ Изход' }).click();
        await expect(page.getByRole('button', { name: '✏️ Редактирай' })).toBeVisible();
    });
});
