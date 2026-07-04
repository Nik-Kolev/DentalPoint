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

export default async function globalTeardown() {
    // Restore the global-setup.ts snapshot — file-copy based, not git, since these paths are
    // gitignored (Phase 11) and `git checkout`/`git clean` can no longer touch them.
    for (const file of DATA_FILES) {
        fs.cpSync(path.join(BACKUP_DIR, path.basename(file)), path.join(process.cwd(), file));
    }
    for (const dir of IMAGE_DIRS) {
        const target = path.join(process.cwd(), dir);
        // Remove first so files created during the run (new uploads) don't survive the restore —
        // matches what `git clean -fd` used to do for untracked additions.
        fs.rmSync(target, { recursive: true, force: true });
        fs.cpSync(path.join(BACKUP_DIR, path.basename(dir)), target, { recursive: true });
    }
    fs.rmSync(BACKUP_DIR, { recursive: true, force: true });

    // contact-submissions.json holds patient PII under a 60-day retention policy —
    // always reset to empty after a test run rather than restoring prior content.
    fs.writeFileSync(path.join(process.cwd(), 'data', 'contact-submissions.json'), '[]\n', 'utf8');

    // Remove the marker from global-setup.ts so sendNtfyNotification resumes sending real
    // notifications once the suite has finished (pass or fail).
    fs.rmSync(path.join(process.cwd(), '.e2e-running'), { force: true });
}
