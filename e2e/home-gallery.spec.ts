import { test, expect } from './fixtures';
import path from 'path';

const testImage = path.join(__dirname, 'fixtures', 'test-before.jpg');

test.describe('home gallery — visitor', () => {
    test('displays clinic photos without edit controls', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('img[alt^="clinic-interior"]').first()).toBeVisible();
        await expect(page.getByRole('button', { name: '✏️ Редактирай' })).toHaveCount(0);
    });
});

test.describe('home gallery — admin', () => {
    test.use({ storageState: 'e2e/.auth/admin.json' });

    test.beforeEach(async ({ page }) => {
        page.on('dialog', (dialog) => dialog.accept());
        await page.goto('/');
        await page.getByRole('button', { name: '✏️ Редактирай' }).click();
    });

    test('uploads an image then deletes it, and the deletion actually persists server-side', async ({ page }) => {
        const cards = page.locator('div[draggable="true"]');
        const initialCount = await cards.count();

        await page.locator('input[type="file"]').setInputFiles(testImage);
        await expect(cards).toHaveCount(initialCount + 1, { timeout: 15_000 });

        const newCard = cards.last();
        await newCard.hover();
        // Delete is optimistic (removes from the DOM immediately, server call fires in the
        // background) — wait for network idle so the server round-trip actually completes
        // before we move on, otherwise a fresh page load could still show the "deleted" item.
        await newCard.getByTitle('Изтрий').click();
        await expect(cards).toHaveCount(initialCount);
        await page.waitForLoadState('networkidle');

        // A fresh reload resets client-side editMode to false, so draggable="true" no longer
        // matches anything — check the image count itself instead, which renders either way.
        await page.reload();
        await expect(page.locator('img[alt^="clinic-interior"]')).toHaveCount(initialCount);
    });

    test('drag-reorders images and reverts back to the original order', async ({ page }) => {
        const cards = page.locator('div[draggable="true"]');
        const count = await cards.count();
        test.skip(count < 2, 'need at least 2 seeded images to test reordering');

        // Compare by src, not alt — the seed data has duplicate alt text across items
        // (multiple "clinic-interior-6"), so alt can't distinguish a real swap from a no-op.
        const altsBefore = await cards.locator('img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));

        // locator.dragTo() simulates mouse gestures, which native HTML5 draggable/dragover/drop
        // handlers (used here, not a drag library) don't reliably respond to. Dispatch the real
        // DragEvent sequence instead — these handlers only read component state (dragId), not
        // dataTransfer payloads, so an empty DataTransfer is fine. Small delays are needed around
        // each step so React actually commits each state update (setDragId, setDragOverId, the
        // reorder itself) before the next event fires or we read the DOM — confirmed via a
        // throwaway diagnostic test that dragstart/dragover/drop all reach their handlers
        // immediately, but the resulting re-renders lag by a tick or two.
        await page.evaluate(async () => {
            const nodes = document.querySelectorAll('div[draggable="true"]');
            const source = nodes[0] as HTMLElement;
            const target = nodes[1] as HTMLElement;
            const dataTransfer = new DataTransfer();
            const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

            source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer }));
            await wait(50);
            target.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer }));
            await wait(50);
            target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }));
            await wait(300);
            source.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer }));
        });

        const altsAfterDrag = await cards.locator('img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
        expect(altsAfterDrag).not.toEqual(altsBefore);
        expect(altsAfterDrag[0]).toBe(altsBefore[1]);
        expect(altsAfterDrag[1]).toBe(altsBefore[0]);

        await page.getByRole('button', { name: '↩ Върни преди промените' }).click();

        const altsAfterRevert = await cards.locator('img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
        expect(altsAfterRevert).toEqual(altsBefore);

        // Confirm the reverted order actually persisted server-side, not just in client state —
        // reload resets editMode to false, so check via the plain img list again (same reason
        // as the upload/delete test above).
        await page.waitForLoadState('networkidle');
        await page.reload();
        const altsAfterReload = await page
            .locator('img[alt^="clinic-interior"]')
            .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
        expect(altsAfterReload).toEqual(altsBefore);
    });

    test('edit mode toggle enters and exits', async ({ page }) => {
        await expect(page.getByRole('button', { name: '✕ Изход' })).toBeVisible();
        await page.getByRole('button', { name: '✕ Изход' }).click();
        await expect(page.getByRole('button', { name: '✏️ Редактирай' })).toBeVisible();
    });
});
