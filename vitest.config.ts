import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            reporter: ['text', 'json', 'html'],
            exclude: ['**/node_modules/**', '**/dist/**', './vitest.config.ts', './packages/zare/lib/index.ts', '**/*.d.ts'],
        },
    },
});
