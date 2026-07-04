import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        // next.config.js is genuinely CommonJS (module.exports), so require() here is correct,
        // not a migration leftover — this rule is meant for TS/ESM source files.
        files: ['next.config.js'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        // e2e/ is Playwright test infrastructure, not React application code. Playwright's own
        // fixture-override pattern (test.extend({ page: async ({ page }, use) => { ... } }))
        // matches react-hooks/rules-of-hooks' naive "function calling something named use()" check
        // — `use` is Playwright's callback, not React's use() hook.
        files: ['e2e/**'],
        rules: {
            'react-hooks/rules-of-hooks': 'off',
        },
    },
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
