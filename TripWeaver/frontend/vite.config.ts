/// <reference types="vitest" />
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { port: 3005 },
  preview: { port: 3005 },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    deps: { optimizer: { web: { include: ['solid-js'] } } },
  },
});
