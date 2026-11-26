import { createApp } from './app.js';
import { connectDb } from './db.js';

/** Đọc số nguyên không âm từ biến môi trường; thiếu hoặc sai thì dùng giá trị mặc định. */
function readInt(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

const port = readInt('PORT', 3002);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5174';

// Thiếu MONGODB_URI thì connectDb ném lỗi và server dừng ngay, không chạy với DB rỗng.
await connectDb(process.env.MONGODB_URI);

createApp({ clientOrigin }).listen(port, () => {
  console.log(`Swipe Deck API: http://localhost:${port} (CORS: ${clientOrigin})`);
});
