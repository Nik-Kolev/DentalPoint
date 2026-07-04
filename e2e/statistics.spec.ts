import fs from 'fs';
import path from 'path';
import { test, expect } from './fixtures';
import type { ContactSubmission } from '@/types/contact';

test.describe('statistics — visitor', () => {
    test('redirects unauthenticated visitor to sign-in', async ({ page }) => {
        await page.goto('/statistics');
        await expect(page).toHaveURL(/\/auth\/signin/);
    });
});

test.describe('statistics — admin', () => {
    test.use({ storageState: 'e2e/.auth/admin.json' });

    const submissionsPath = path.join(process.cwd(), 'data', 'contact-submissions.json');
    let originalSubmissions: string;

    test.beforeEach(() => {
        originalSubmissions = fs.readFileSync(submissionsPath, 'utf8');
    });

    test.afterEach(() => {
        fs.writeFileSync(submissionsPath, originalSubmissions);
    });

    test('stats tab loads without mock-toggle button', async ({ page }) => {
        await page.goto('/statistics');

        // Wait for page to load and confirm we're on the stats tab
        await expect(page.getByRole('heading', { name: 'Табло за статистика' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Статистика' })).toHaveClass(/bg-\[var\(--dp-primary\)\]/);

        // Both time periods should render
        await expect(page.getByRole('heading', { name: 'Последни 7 дни' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Последни 30 дни' })).toBeVisible();

        // No mock-data toggle should exist anywhere on the page
        const mockToggle = page.locator('button:has-text("Mock"), label:has-text("Mock"), input[aria-label*="mock" i]');
        await expect(mockToggle).not.toBeVisible();
    });

    test('messages tab displays newest-first, paginated to 5, with load more/less buttons', async ({ page }) => {
        // Seed 7 submissions with varying dates and read states
        const now = new Date();
        const submissions: ContactSubmission[] = [
            {
                id: '1',
                name: 'Иван',
                phone: '0888111111',
                message: 'Първо съобщение (най-ново)',
                createdAt: new Date(now.getTime()).toISOString(),
                read: false,
            },
            {
                id: '2',
                name: 'Петра',
                phone: '0888222222',
                message: 'Второ съобщение',
                createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
                read: false,
            },
            {
                id: '3',
                name: 'Грегор',
                phone: '0888333333',
                message: 'Трето съобщение',
                createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                read: true,
            },
            {
                id: '4',
                name: 'Анна',
                phone: '0888444444',
                message: 'Четвърто съобщение',
                createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
                read: false,
            },
            {
                id: '5',
                name: 'Борис',
                phone: '0888555555',
                message: 'Пето съобщение',
                createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
                read: false,
            },
            {
                id: '6',
                name: 'Виктор',
                phone: '0888666666',
                message: 'Шесто съобщение',
                createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
                read: false,
            },
            {
                id: '7',
                name: 'Деян',
                phone: '0888777777',
                message: 'Седмо съобщение (най-старо)',
                createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
                read: true,
            },
        ];
        fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2));

        await page.goto('/statistics');

        // Switch to messages tab
        await page.getByRole('button', { name: 'Съобщения' }).click();
        await expect(page.getByRole('heading', { name: 'Табло за статистика' })).toBeVisible();

        // Wait for messages to load
        await expect(page.getByText('Първо съобщение')).toBeVisible();

        // Confirm newest-first order — first message name should be "Иван"
        const messages = page.locator('div.rounded-2xl').filter({ has: page.locator('input[type="checkbox"]') });
        const firstMessageName = await messages.first().locator('span.font-semibold').first().textContent();
        expect(firstMessageName).toBe('Иван');

        // Confirm only 5 are visible initially
        const visibleCount = await messages.count();
        expect(visibleCount).toBe(5);

        // "Load more" button should be visible
        await expect(page.getByRole('button', { name: 'Покажи още' })).toBeVisible();

        // "Show less" should NOT be visible yet (we haven't expanded beyond 5)
        await expect(page.getByRole('button', { name: 'Покажи по-малко' })).not.toBeVisible();

        // Click "load more"
        await page.getByRole('button', { name: 'Покажи още' }).click();

        // Now all 7 should be visible
        const expandedMessages = page.locator('div.rounded-2xl').filter({ has: page.locator('input[type="checkbox"]') });
        const expandedCount = await expandedMessages.count();
        expect(expandedCount).toBe(7);

        // Both "load more" (if there were more) and "show less" should be visible
        await expect(page.getByRole('button', { name: 'Покажи по-малко' })).toBeVisible();

        // Click "show less"
        await page.getByRole('button', { name: 'Покажи по-малко' }).click();

        // Back to 5
        const collapsedMessages = page.locator('div.rounded-2xl').filter({ has: page.locator('input[type="checkbox"]') });
        const collapsedCount = await collapsedMessages.count();
        expect(collapsedCount).toBe(5);
    });

    test('individual checkbox toggle persists across reload', async ({ page }) => {
        // Seed 2 submissions
        const now = new Date();
        const submissions: ContactSubmission[] = [
            {
                id: 'persist-1',
                name: 'Иван',
                phone: '0888111111',
                message: 'Съобщение 1',
                createdAt: now.toISOString(),
                read: false,
            },
            {
                id: 'persist-2',
                name: 'Петра',
                phone: '0888222222',
                message: 'Съобщение 2',
                createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
                read: false,
            },
        ];
        fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2));

        await page.goto('/statistics');
        await page.getByRole('button', { name: 'Съобщения' }).click();

        // Wait for messages to load
        await expect(page.getByText('Съобщение 1')).toBeVisible();

        // Get the first message's checkbox and toggle it
        const messages = page.locator('div.rounded-2xl').filter({ has: page.locator('input[type="checkbox"]') });
        const firstMessageCheckbox = messages.first().locator('input[type="checkbox"]');
        await firstMessageCheckbox.check();

        // Wait for the Server Action to complete
        await page.waitForLoadState('networkidle');

        // Reload the page
        await page.reload();

        // After reload, the page defaults to Stats tab — switch back to Messages
        await page.getByRole('button', { name: 'Съобщения' }).click();
        await expect(page.getByText('Съобщение 1')).toBeVisible();

        // Confirm the first message's checkbox is still checked
        const reloadedMessages = page.locator('div.rounded-2xl').filter({ has: page.locator('input[type="checkbox"]') });
        const reloadedFirstCheckbox = reloadedMessages.first().locator('input[type="checkbox"]');
        await expect(reloadedFirstCheckbox).toBeChecked();
    });

    test('mark-all-read is scoped to visible messages only', async ({ page }) => {
        // Seed 8 unread messages so that more than 5 exist
        const now = new Date();
        const submissions: ContactSubmission[] = Array.from({ length: 8 }, (_, i) => ({
            id: `scope-${i}`,
            name: `Person${i}`,
            phone: '0888111111',
            message: `Message ${i}`,
            createdAt: new Date(now.getTime() - i * 60 * 60 * 1000).toISOString(),
            read: false,
        }));
        fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2));

        await page.goto('/statistics');
        await page.getByRole('button', { name: 'Съобщения' }).click();

        // Wait for first 5 to load
        await expect(page.getByText('Message 0')).toBeVisible();

        // Click "mark all read" WITHOUT clicking "load more" first
        const markAllButton = page.getByRole('button', { name: 'Маркирай всички като прочетени' });
        await markAllButton.click();

        // Wait for the Server Action to complete
        await page.waitForLoadState('networkidle');

        // Reload to check what was persisted
        await page.reload();

        // After reload, switch back to Messages tab
        await page.getByRole('button', { name: 'Съобщения' }).click();
        await expect(page.getByText('Message 0')).toBeVisible();

        // The 5 visible ones should now be read (no amber border or unread badge)
        // Check first 5 are marked as read (checkboxes checked, no unread badge)
        const messageTexts = ['Message 0', 'Message 1', 'Message 2', 'Message 3', 'Message 4'];
        for (const text of messageTexts) {
            const messageBox = page.locator('div.rounded-2xl').filter({ has: page.getByText(text) }).first();
            const checkbox = messageBox.locator('input[type="checkbox"]');
            await expect(checkbox).toBeChecked();
            await expect(messageBox.getByText('Непрочетено')).not.toBeVisible();
        }

        // Now expand to see all 8
        await page.getByRole('button', { name: 'Покажи още' }).click();

        // Message 5, 6, 7 (beyond the initial 5) should still be unread
        for (const i of [5, 6, 7]) {
            const messageBox = page.locator('div.rounded-2xl').filter({ has: page.getByText(`Message ${i}`) }).first();
            const checkbox = messageBox.locator('input[type="checkbox"]');
            await expect(checkbox).not.toBeChecked();
            await expect(messageBox.getByText('Непрочетено')).toBeVisible();
        }
    });

    test('date-range filter filters messages and clear-filter restores all with picker reset', async ({ page }) => {
        // Seed 4 messages: 3 from past, 1 from "today" to avoid UTC/local timezone issues
        // The filter uses local date parts, not UTC, so we must match that.
        const now = new Date();
        const dayAgo = new Date(now);
        dayAgo.setDate(dayAgo.getDate() - 1);
        const twoDaysAgo = new Date(now);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const threeDaysAgo = new Date(now);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const submissions: ContactSubmission[] = [
            {
                id: 'date-1',
                name: 'Иван',
                phone: '0888111111',
                message: 'Съобщение днес',
                createdAt: now.toISOString(),
                read: false,
            },
            {
                id: 'date-2',
                name: 'Петра',
                phone: '0888222222',
                message: 'Съобщение вчера',
                createdAt: dayAgo.toISOString(),
                read: false,
            },
            {
                id: 'date-3',
                name: 'Грегор',
                phone: '0888333333',
                message: 'Съобщение преди 2 дни',
                createdAt: twoDaysAgo.toISOString(),
                read: false,
            },
            {
                id: 'date-4',
                name: 'Анна',
                phone: '0888444444',
                message: 'Съобщение преди 3 дни',
                createdAt: threeDaysAgo.toISOString(),
                read: false,
            },
        ];
        fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2));

        await page.goto('/statistics');
        await page.getByRole('button', { name: 'Съобщения' }).click();

        // Wait for messages to load
        await expect(page.getByText('Съобщение днес')).toBeVisible();

        // Confirm all 4 are visible before filtering
        let messageBoxes = page.locator('div.rounded-2xl').filter({ has: page.locator('input[type="checkbox"]') });
        expect(await messageBoxes.count()).toBe(4);

        // Open date picker and select a range: yesterday to day ago (should exclude today and older)
        await page.getByRole('button', { name: 'Избери период' }).click();

        // react-day-picker uses local date parts
        const toDateString = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        const yesterday = toDateString(dayAgo);
        const twoDaysBackStr = toDateString(twoDaysAgo);

        await page.locator(`td[data-day="${yesterday}"] button`).click();
        await page.locator(`td[data-day="${twoDaysBackStr}"] button`).click();

        // Wait a moment for picker to process and then click Done
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: 'Готово' }).click();

        // Wait for filter to apply
        await page.waitForLoadState('networkidle');

        // Now only 2 messages should be visible: yesterday and 2 days ago
        messageBoxes = page.locator('div.rounded-2xl').filter({ has: page.locator('input[type="checkbox"]') });
        expect(await messageBoxes.count()).toBe(2);

        // Confirm the filtered messages are the right ones
        await expect(page.getByText('Съобщение вчера')).toBeVisible();
        await expect(page.getByText('Съобщение преди 2 дни')).toBeVisible();
        await expect(page.getByText('Съобщение днес')).not.toBeVisible();
        await expect(page.getByText('Съобщение преди 3 дни')).not.toBeVisible();

        // "Clear filter" button should be visible
        const clearButton = page.getByRole('button', { name: 'Изчисти филтъра' });
        await expect(clearButton).toBeVisible();

        // Click "clear filter"
        await clearButton.click();

        // Wait for filter to clear
        await page.waitForLoadState('networkidle');

        // All 4 messages should reappear
        messageBoxes = page.locator('div.rounded-2xl').filter({ has: page.locator('input[type="checkbox"]') });
        expect(await messageBoxes.count()).toBe(4);

        // Date picker button should revert to showing the placeholder text (not a date range)
        await expect(page.getByRole('button', { name: 'Избери период' })).toBeVisible();
    });

    test('race-condition regression: simultaneous checkbox toggle and mark-all-read', async ({ page }) => {
        // Seed 3 unread messages
        const now = new Date();
        const submissions: ContactSubmission[] = [
            {
                id: 'race-1',
                name: 'Иван',
                phone: '0888111111',
                message: 'Съобщение 1',
                createdAt: now.toISOString(),
                read: false,
            },
            {
                id: 'race-2',
                name: 'Петра',
                phone: '0888222222',
                message: 'Съобщение 2',
                createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
                read: false,
            },
            {
                id: 'race-3',
                name: 'Грегор',
                phone: '0888333333',
                message: 'Съобщение 3',
                createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                read: false,
            },
        ];
        fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2));

        await page.goto('/statistics');
        await page.getByRole('button', { name: 'Съобщения' }).click();

        // Wait for messages to load
        await expect(page.getByText('Съобщение 1')).toBeVisible();

        // Get references to elements
        const firstMessageCheckbox = page.locator('div.rounded-2xl').filter({ has: page.getByText('Съобщение 1') }).first().locator('input[type="checkbox"]');
        const markAllButton = page.getByRole('button', { name: 'Маркирай всички като прочетени' });

        // Fire both actions back-to-back with no artificial wait between them
        // (matching the worst-case race scenario). Use .click() instead of .check() since
        // mark-all-read might run first and check all boxes, then .check() would be a no-op.
        await Promise.all([
            firstMessageCheckbox.click(),
            markAllButton.click(),
        ]);

        // Wait for async operations to settle
        await page.waitForLoadState('networkidle');

        // Reload to confirm all writes persisted correctly
        await page.reload();

        // After reload, switch back to Messages tab
        await page.getByRole('button', { name: 'Съобщения' }).click();
        await expect(page.getByText('Съобщение 1')).toBeVisible();

        // All 3 messages should be marked as read
        const raceMessages = page.locator('div.rounded-2xl').filter({ has: page.locator('input[type="checkbox"]') });
        const checkboxes = raceMessages.locator('input[type="checkbox"]');
        for (let i = 0; i < 3; i++) {
            await expect(checkboxes.nth(i)).toBeChecked();
        }
    });
});
