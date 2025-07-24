import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        include: [
            'packages/**/tests/**/*.{test,spec}.{js,ts,jsx,tsx}'
        ],
        exclude: [
            '**/node_modules/**',
            '**/dist/**'
        ],
        coverage: {
            provider: 'v8',
            include: [
                'packages/**/*.ts',
                '!**/*.d.ts'
            ],
            exclude: [
                '**/tests/**',
                '**/*.config.*',
                '**/*.test.*',
                '**/node_modules/**',
                "./packages/zare/lib/index.ts",
            ],

            reporter: ['text', 'html', 'lcov'],
        }
    },
});
