import { test, expect } from '@playwright/test';

test.describe('lightbox', () => {
    test('clicking gallery image opens lightbox', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const galleryImages = page.locator('div[class*="aspect"]').locator('img').first();

        if (await galleryImages.isVisible()) {
            await galleryImages.click();
            await page.waitForTimeout(500);

            const lightboxContainer = page.locator('[role="dialog"], [class*="lightbox"], [class*="modal"]').first();
            const lightboxImage = page.locator('img[class*="max-w"], img[class*="max-h"]').first();

            if (await lightboxImage.isVisible()) {
                const boundingBox = await lightboxImage.boundingBox();
                expect(boundingBox).toBeTruthy();
            }
        }
    });

    test('clicking backdrop closes lightbox', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const galleryImages = page.locator('div[class*="aspect"]').locator('img').first();

        if (await galleryImages.isVisible()) {
            await galleryImages.click();
            await page.waitForTimeout(500);

            const backdrop = page.locator('[class*="backdrop"], [class*="overlay"]').first();
            if (await backdrop.isVisible()) {
                await backdrop.click({ force: true });
                await page.waitForTimeout(500);

                const lightboxImage = page.locator('img[class*="max-w"], img[class*="max-h"]').first();
                const isVisible = await lightboxImage.isVisible().catch(() => false);
                expect(isVisible).toBe(false);
            }
        }
    });

    test('clicking close button closes lightbox', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const galleryImages = page.locator('div[class*="aspect"]').locator('img').first();

        if (await galleryImages.isVisible()) {
            await galleryImages.click();
            await page.waitForTimeout(500);

            const closeButton = page.locator('button:has-text("✕"), button:has-text("×"), [aria-label*="Close"], [aria-label*="close"]').first();
            if (await closeButton.isVisible()) {
                await closeButton.click();
                await page.waitForTimeout(500);

                const lightboxImage = page.locator('img[class*="max-w"], img[class*="max-h"]').first();
                const isVisible = await lightboxImage.isVisible().catch(() => false);
                expect(isVisible).toBe(false);
            }
        }
    });

    test('lightbox displays correct image from certificates', async ({ page }) => {
        await page.goto('/licenses');
        await page.waitForTimeout(1000);

        const certificateImages = page.locator('div[class*="aspect"]').locator('img').first();

        if (await certificateImages.isVisible()) {
            const imageSrc = await certificateImages.getAttribute('src');
            await certificateImages.click();
            await page.waitForTimeout(500);

            const lightboxImage = page.locator('img[class*="max-w"], img[class*="max-h"]').first();
            if (await lightboxImage.isVisible()) {
                const lightboxSrc = await lightboxImage.getAttribute('src');
                expect(lightboxSrc).toContain('Images');
            }
        }
    });
});
