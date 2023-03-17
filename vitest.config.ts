/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    reporters: 'verbose',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/__tests__/**/*.+(js|jsx|ts|tsx)'],
    exclude: ['**/node_modules/**', '**/__fixtures__/**', '/\\.'],
    clearMocks: true,
    restoreMocks: true,
  },
});
