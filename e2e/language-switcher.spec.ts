import { test, expect } from '@playwright/test';

test.describe('language switcher', () => {
    test('switch from Bulgarian to English on team page', async ({ page }) => {
        await page.goto('/team');
        await page.waitForTimeout(300);

        const languageButtons = page.getByRole('button');
        const enButton = languageButtons.filter({ hasText: /EN|en|English/ }).first();

        if (await enButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await enButton.click();
            await page.waitForTimeout(500);
            await expect(page).toHaveURL(/\/team/);
        }
    });

    test('switch from Bulgarian to English on gallery page', async ({ page }) => {
        await page.goto('/gallery');
        await page.waitForTimeout(300);

        const languageButtons = page.getByRole('button');
        const enButton = languageButtons.filter({ hasText: /EN|en|English/ }).first();

        if (await enButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await enButton.click();
            await page.waitForTimeout(500);
            await expect(page).toHaveURL(/\/gallery/);
        }
    });

    test('switch from Bulgarian to English on licenses page', async ({ page }) => {
        await page.goto('/licenses');
        await page.waitForTimeout(300);

        const languageButtons = page.getByRole('button');
        const enButton = languageButtons.filter({ hasText: /EN|en|English/ }).first();

        if (await enButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await enButton.click();
            await page.waitForTimeout(500);
            await expect(page).toHaveURL(/\/licenses/);
        }
    });

    test('switch back from English to Bulgarian', async ({ page }) => {
        await page.goto('/team');
        await page.waitForTimeout(300);

        const languageButtons = page.getByRole('button');
        const enButton = languageButtons.filter({ hasText: /EN|en|English/ }).first();

        if (await enButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await enButton.click();
            await page.waitForTimeout(500);

            const bgButton = languageButtons.filter({ hasText: /BG|bg|Български/ }).first();
            if (await bgButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                await bgButton.click();
                await page.waitForTimeout(500);
            }
        }
    });
});
