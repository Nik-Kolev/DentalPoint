import { defineConfig, devices } from '@playwright/test';

process.loadEnvFile('.env.local');

export default defineConfig({
    testDir: './e2e',
    // Admin specs mutate shared server-side JSON files (data/*.json) — parallel workers would
    // race on the same files (e.g. two tests' upload-count assertions stepping on each other).
    fullyParallel: false,
    workers: 1,
    globalSetup: './e2e/global-setup.ts',
    globalTeardown: './e2e/global-teardown.ts',
    forbidOnly: !!process.env.CI,
    // A full sequential run occasionally hits a transient dev-server slowdown (Turbopack
    // recompiling, sharp image processing) that shows up as a single test failing on a plain
    // navigation or assertion, then passing cleanly in isolation — retrying once locally too
    // (not just in CI) absorbs that without masking a real, consistently-failing bug.
    retries: process.env.CI ? 2 : 1,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'setup', testMatch: /.*\.setup\.ts/ },
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            dependencies: ['setup'],
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 60_000,
    },
});
