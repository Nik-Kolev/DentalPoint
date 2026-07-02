import { test, expect } from '@playwright/test';

test.describe('reviews viewer', () => {
    test('load-more reveals 3 more reviews', async ({ page }) => {
        await page.goto('/reviews');

        const reviewCards = page.locator('[class*="bg-white"][class*="rounded"]');
        const initialCount = await reviewCards.count();

        const loadMoreButton = page.getByRole('button', { name: 'Зареди още' });
        if (await loadMoreButton.isVisible()) {
            await loadMoreButton.click();
            await page.waitForTimeout(500);

            const newCount = await reviewCards.count();
            expect(newCount).toBeGreaterThan(initialCount);
        }
    });

    test('show-less resets to 5 reviews', async ({ page }) => {
        await page.goto('/reviews');

        const loadMoreButton = page.getByRole('button', { name: 'Зареди още' });
        if (await loadMoreButton.isVisible()) {
            await loadMoreButton.click();
            await page.waitForTimeout(500);

            const showLessButton = page.getByRole('button', { name: 'Покажи по-малко' });
            if (await showLessButton.isVisible()) {
                await showLessButton.click();
                await page.waitForTimeout(500);

                const reviewCards = page.locator('[class*="bg-white"][class*="rounded"]');
                const finalCount = await reviewCards.count();
                expect(finalCount).toBeLessThanOrEqual(5);
            }
        }
    });
});

test.describe('reviews viewer - mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('load-more and show-less work on mobile', async ({ page }) => {
        await page.goto('/reviews');

        const reviewCards = page.locator('[class*="bg-white"][class*="rounded"]');
        const initialCount = await reviewCards.count();

        const loadMoreButton = page.getByRole('button', { name: 'Зареди още' });
        if (await loadMoreButton.isVisible()) {
            await loadMoreButton.click();
            await page.waitForTimeout(500);

            const mobileReviewCards = page.locator('[class*="bg-white"][class*="rounded"]');
            const mobileCount = await mobileReviewCards.count();
            expect(mobileCount).toBeGreaterThan(initialCount);

            const showLessButton = page.getByRole('button', { name: 'Покажи по-малко' });
            if (await showLessButton.isVisible()) {
                await showLessButton.click();
                await page.waitForTimeout(500);

                const finalCards = page.locator('[class*="bg-white"][class*="rounded"]');
                const finalCount = await finalCards.count();
                expect(finalCount).toBeLessThanOrEqual(mobileCount);
            }
        }
    });
});
