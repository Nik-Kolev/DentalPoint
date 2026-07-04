import { test, expect } from '@playwright/test';

test.describe('mobile layout', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('page renders on mobile viewport', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);

        const pageContent = page.locator('body');
        await expect(pageContent).toBeVisible();

        const viewport = page.viewportSize();
        expect(viewport?.width).toBe(375);
    });

    test('team page displays on mobile', async ({ page }) => {
        await page.goto('/team');
        await page.waitForTimeout(500);

        const pageTitle = page.locator('h1').first();
        await expect(pageTitle).toBeVisible();

        const teamCards = page.locator('article');
        const count = await teamCards.count();
        expect(count).toBeGreaterThan(0);
    });

    test('images fit viewport on mobile', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const images = page.locator('img').first();
        if (await images.isVisible({ timeout: 2000 }).catch(() => false)) {
            const imageBounds = await images.boundingBox();
            const viewportSize = page.viewportSize();

            if (imageBounds && viewportSize) {
                expect(imageBounds.width).toBeLessThanOrEqual(viewportSize.width + 10);
            }
        }
    });

    test('gallery page responsive on mobile', async ({ page }) => {
        await page.goto('/gallery');
        await page.waitForTimeout(500);

        const pageTitle = page.locator('h1').first();
        await expect(pageTitle).toBeVisible();

        const images = page.locator('img').first();
        await expect(images).toBeVisible({ timeout: 3000 });
    });
});
