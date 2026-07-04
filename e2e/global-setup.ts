import fs from 'fs';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), 'e2e', '.data-backup');

const DATA_FILES = [
    'data/home-gallery.json',
    'data/certificates.json',
    'data/gallery-cases.json',
    'data/team.json',
    'data/contact-settings.json',
    'data/pending-changes.json',
];

const IMAGE_DIRS = ['public/Images/certificates', 'public/Images/gallery', 'public/Images/owners', 'public/Images/front'];

export default async function globalSetup() {
    // Snapshot admin-mutable content to a scratch backup dir so teardown can restore it
    // regardless of git tracking status. These paths are gitignored (Phase 11) precisely so
    // production deploys never reset them — which also means `git checkout`/`git clean` can no
    // longer be used to reset them after a test run. Whatever is on disk right now (including
    // any real, in-progress admin edits) becomes the restore point.
    fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
    fs.mkdirSync(BACKUP_DIR, { recursive: true });

    for (const file of DATA_FILES) {
        fs.cpSync(path.join(process.cwd(), file), path.join(BACKUP_DIR, path.basename(file)));
    }
    for (const dir of IMAGE_DIRS) {
        fs.cpSync(path.join(process.cwd(), dir), path.join(BACKUP_DIR, path.basename(dir)), { recursive: true });
    }

    // Contact-form specs submit the real form, which calls the real sendNtfyNotification —
    // this marker tells that function to skip sending while a test run is in progress, so the
    // suite can't fire real push notifications to whoever's subscribed to NTFY_TOPIC.
    fs.writeFileSync(path.join(process.cwd(), '.e2e-running'), '');
}
