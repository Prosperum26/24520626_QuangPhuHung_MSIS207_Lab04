import { createApp } from './app.js';

/** Đọc số nguyên không âm từ biến môi trường; thiếu hoặc sai thì dùng giá trị mặc định. */
function readInt(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

const port = readInt('PORT', 3001);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const delayMs = readInt('RESPONSE_DELAY_MS', 0);

createApp({ clientOrigin, delayMs }).listen(port, () => {
  console.log(`Forum API: http://localhost:${port} (CORS: ${clientOrigin}, delay: ${delayMs}ms)`);
});
