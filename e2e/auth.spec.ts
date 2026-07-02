import { test, expect } from './fixtures';

test.describe('unauthenticated visitor', () => {
    test('sees viewer mode, not admin controls, on team page', async ({ page }) => {
        await page.goto('/team');
        await expect(page.getByRole('button', { name: 'Редактирай' })).toHaveCount(0);
    });

    test('redirects to signin when accessing /statistics', async ({ page }) => {
        await page.goto('/statistics');
        await expect(page).toHaveURL(/\/auth\/signin/);
    });

    test('redirects to signin when accessing /admin', async ({ page }) => {
        await page.goto('/admin');
        await expect(page).toHaveURL(/\/auth\/signin/);
    });
});

test.describe('authenticated admin', () => {
    test.use({ storageState: 'e2e/.auth/admin.json' });

    test('sees admin edit toggle on team page', async ({ page }) => {
        await page.goto('/team');
        await expect(page.getByRole('button', { name: 'Редактирай' })).toBeVisible();
    });

    test('can sign out from statistics page', async ({ page }) => {
        await page.goto('/statistics');
        const signOutButton = page.getByRole('button', { name: 'Изход' });
        await expect(signOutButton).toBeVisible();
        await signOutButton.click();
        await page.waitForURL(/\/auth\/signin/);
        await page.goto('/team');
        await expect(page.getByRole('button', { name: 'Редактирай' })).toHaveCount(0);
    });
});
