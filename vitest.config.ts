import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/**/tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      include: ['packages/**/*.ts', '!**/*.d.ts'],
      exclude: [
        '**/tests/**',
        '**/*.config.*',
        '**/*.test.*',
        '**/node_modules/**',
        './packages/zare/lib/index.ts',
      ],

      reporter: ['text', 'html', 'lcov'],
    },
  },
});
