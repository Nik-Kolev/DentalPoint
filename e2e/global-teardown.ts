import { execSync } from 'child_process';

export default async function globalTeardown() {
    execSync('git checkout -- data public/Images', { stdio: 'inherit' });
    execSync('git clean -fd -- public/Images', { stdio: 'inherit' });
}
