import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 5176 để chạy song song với Exercise (5173), HW1 (5174), HW2 (5175).
  server: { port: 5176, strictPort: true },
  preview: { port: 5176, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
});
