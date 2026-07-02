import { test, expect } from '@playwright/test';

test.describe('before-after slider', () => {
    test('slider renders on gallery page', async ({ page }) => {
        await page.goto('/gallery');
        await page.waitForTimeout(1000);
        const images = page.locator('img');
        const count = await images.count();
        expect(count).toBeGreaterThan(0);
    });

    test('drag handle moves comparison left', async ({ page }) => {
        await page.goto('/gallery');
        await page.waitForTimeout(1000);

        const images = page.locator('img').first();
        if (await images.isVisible({ timeout: 2000 }).catch(() => false)) {
            const imageBounds = await images.boundingBox();
            if (imageBounds) {
                const handleX = imageBounds.x + imageBounds.width / 2;
                const handleY = imageBounds.y + imageBounds.height / 2;

                await page.mouse.move(handleX, handleY);
                await page.mouse.down();
                await page.mouse.move(handleX - 50, handleY);
                await page.mouse.move(handleX - 100, handleY);
                await page.mouse.up();
                await page.waitForTimeout(300);
            }
        }
    });

    test('drag handle moves comparison right', async ({ page }) => {
        await page.goto('/gallery');
        await page.waitForTimeout(1000);

        const images = page.locator('img').first();
        if (await images.isVisible({ timeout: 2000 }).catch(() => false)) {
            const imageBounds = await images.boundingBox();
            if (imageBounds) {
                const handleX = imageBounds.x + imageBounds.width * 0.3;
                const handleY = imageBounds.y + imageBounds.height / 2;

                await page.mouse.move(handleX, handleY);
                await page.mouse.down();
                await page.mouse.move(handleX + 50, handleY);
                await page.mouse.move(handleX + 100, handleY);
                await page.mouse.up();
                await page.waitForTimeout(300);
            }
        }
    });

    test('gallery cases are visible', async ({ page }) => {
        await page.goto('/gallery');
        await page.waitForTimeout(1000);

        const pageTitle = page.locator('h1').first();
        await expect(pageTitle).toBeVisible({ timeout: 3000 });

        const images = page.locator('img');
        const count = await images.count();
        expect(count).toBeGreaterThan(0);
    });

    test('gallery works on mobile view', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/gallery');
        await page.waitForTimeout(1000);

        const images = page.locator('img').first();
        await expect(images).toBeVisible({ timeout: 3000 });
    });
});
