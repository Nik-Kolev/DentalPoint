import { test, expect } from '@playwright/test';

test.describe('navigation', () => {
    test('home link resolves', async ({ page }) => {
        await page.goto('/');
        await expect(page).not.toHaveURL(/404|error/);
    });

    test('team link resolves', async ({ page }) => {
        await page.goto('/');
        const teamLink = page.getByRole('link', { name: 'Екип' });
        if (await teamLink.isVisible()) {
            await teamLink.click();
            await expect(page).toHaveURL(/\/team/);
            await expect(page).not.toHaveURL(/404|error/);
        }
    });

    test('gallery/results link resolves', async ({ page }) => {
        await page.goto('/');
        const galleryLink = page.getByRole('link', { name: 'Резултати' });
        if (await galleryLink.isVisible()) {
            await galleryLink.click();
            await expect(page).toHaveURL(/\/gallery/);
            await expect(page).not.toHaveURL(/404|error/);
        }
    });

    test('licenses/certificates link resolves', async ({ page }) => {
        await page.goto('/');
        const licensesLink = page.getByRole('link', { name: 'Сертификати' });
        if (await licensesLink.isVisible()) {
            await licensesLink.click();
            await expect(page).toHaveURL(/\/licenses/);
            await expect(page).not.toHaveURL(/404|error/);
        }
    });

    test('contact link resolves', async ({ page }) => {
        await page.goto('/');
        const contactLink = page.getByRole('link', { name: 'Контакти' });
        if (await contactLink.isVisible()) {
            await contactLink.click();
            await expect(page).toHaveURL(/\/contact/);
            await expect(page).not.toHaveURL(/404|error/);
        }
    });

    test('active nav item is marked correctly', async ({ page }) => {
        await page.goto('/team');

        const navLinks = page.locator('a[href*="team"], a[href*="/team"]');
        const activeLink = navLinks.filter({ has: page.locator('[class*="active"], [class*="current"]') }).first();

        if (await activeLink.isVisible()) {
            const href = await activeLink.getAttribute('href');
            expect(href).toContain('team');
        }
    });
});
