/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    reporters: 'verbose',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/__tests__/**/*.+(js|jsx|ts|tsx)'],
    exclude: ['**/node_modules/**', '**/__fixtures__/**'],
    clearMocks: true,
    restoreMocks: true,
    server: {
      deps: {
        // Needed to spy on "zod/v4/core" parse method without getting the error
        // TypeError: Cannot redefine property: parse
        inline: ['z'],
      },
    },
  },
});
