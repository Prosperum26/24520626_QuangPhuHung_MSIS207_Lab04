import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // .env nằm ở Homework2_Lab04/ (dùng chung với server); chỉ biến VITE_* lộ ra client.
  envDir: '..',
  server: {
    port: 5175,
    strictPort: true,
    // Cho dev server đọc ../shared/appealRules.js (luật validation dùng chung với server).
    fs: { allow: ['..'] },
  },
  preview: { port: 5175, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
});
