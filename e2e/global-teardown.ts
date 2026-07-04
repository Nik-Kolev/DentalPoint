import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export default async function globalTeardown() {
    execSync('git checkout -- data public/Images', { stdio: 'inherit' });
    execSync('git clean -fd -- public/Images', { stdio: 'inherit' });

    // contact-submissions.json is gitignored (holds patient PII under a 60-day retention
    // policy), so `git checkout` above can't restore it like every other data/*.json file —
    // reset it directly instead.
    fs.writeFileSync(path.join(process.cwd(), 'data', 'contact-submissions.json'), '[]\n', 'utf8');

    // Remove the marker from global-setup.ts so sendNtfyNotification resumes sending real
    // notifications once the suite has finished (pass or fail).
    fs.rmSync(path.join(process.cwd(), '.e2e-running'), { force: true });
}
