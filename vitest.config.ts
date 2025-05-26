import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            reporter: ['text', 'json', 'html'],
            exclude: ['**/node_modules/**', '**/dist/**', './vitest.config.ts', './lib/index.ts', './lib/types/token.d.ts'],
        },
    },
});
