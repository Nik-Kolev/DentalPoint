import { execSync } from 'child_process';

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
}
