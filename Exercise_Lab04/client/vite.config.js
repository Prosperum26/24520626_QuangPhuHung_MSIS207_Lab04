import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // .env nằm ở Exercise_Lab04/ (dùng chung với server); chỉ biến VITE_* lộ ra client.
  envDir: '..',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
});
