import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/**/tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      include: ['packages/**/*.ts'],
      exclude: [
        '**/*.d.ts',
        '**/tests/**',
        '**/*.config.*',
        '**/*.test.*',
        '**/node_modules/**',
        './packages/cli/**',
        './packages/zare/lib/config.ts',
        './packages/zare/lib/index.ts',
        './packages/zare/lib/utils/**',
      ],
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
