import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  // Force JSX transformation for Vitest, regardless of tsconfig.json
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // 1. Strictly limit Vitest to the src directory
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // 2. Explicitly prevent it from looking into the root 'tests' directory (Playwright)
    exclude: [...configDefaults.exclude, 'tests/**', '.next/**', 'dist/**'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Exclude non-app logic and build artifacts from coverage metrics
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/storybook-static/**',
        '**/.storybook/**',
        '**/scripts/**',
        '**/*.stories.tsx',
        '**/*.stories.ts',
        '**/*.config.{js,ts,mjs}',
        '**/test/**',
        'tests/**', // Playwright tests
        'src/types/**',
        'src/app/api/**', // BFF routes
        'src/i18n/**', // Boilerplate
        '**/*.d.ts',
      ],
      all: true,
    },
  },
});
