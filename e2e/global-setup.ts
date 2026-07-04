import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export default async function globalSetup() {
    const status = execSync('git status --porcelain -- data public/Images', { encoding: 'utf-8' }).trim();
    if (status) {
        throw new Error(
            'e2e tests mutate data/ and public/Images/, then hard-reset both to the last commit ' +
                'at teardown. You have uncommitted changes there right now — commit or stash them ' +
                'before running tests, or teardown will discard that work:\n\n' +
                status,
        );
    }

    // Contact-form specs submit the real form, which calls the real sendNtfyNotification —
    // this marker tells that function to skip sending while a test run is in progress, so the
    // suite can't fire real push notifications to whoever's subscribed to NTFY_TOPIC.
    fs.writeFileSync(path.join(process.cwd(), '.e2e-running'), '');
}
