import { existsSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// Đọc Homework1_Lab04/.env (MONGODB_URI_TEST) bằng API có sẵn của Node; thiếu file thì bỏ qua.
const ENV_FILE = new URL('../.env', import.meta.url);
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

export default defineConfig({
  test: {
    env: { MONGODB_URI_TEST: process.env.MONGODB_URI_TEST ?? '' },
    // Mọi file test dùng chung một DB test nên chạy lần lượt.
    fileParallelism: false,
  },
});
