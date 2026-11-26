import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // .env nằm ở Homework1_Lab04/ (dùng chung với server); chỉ biến VITE_* lộ ra client.
  envDir: '..',
  // 5174 để chạy song song với Exercise (5173).
  server: { port: 5174, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
});
