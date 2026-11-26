import { createApp } from './app.js';
import { DEFAULT_SLA_HOURS, createStore } from './store.js';

/** Đọc số từ biến môi trường; thiếu hoặc sai thì dùng giá trị mặc định. */
function readNumber(name, fallback, isValid) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  return isValid(value) ? value : fallback;
}

const port = readNumber('PORT', 3003, (v) => Number.isInteger(v) && v >= 0);
const slaHours = readNumber('SLA_HOURS', DEFAULT_SLA_HOURS, (v) => Number.isFinite(v) && v > 0);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5175';

const store = createStore({ slaHours });
const deadline = new Date(store.listDossiers()[0].appealDeadline).toISOString();

createApp({ store, clientOrigin }).listen(port, () => {
  console.log(`Appeal server on http://localhost:${port}, SLA deadline ${deadline} (CORS: ${clientOrigin})`);
});
