import cors from 'cors';
import express from 'express';
import { CHANNELS, createStore } from './store.js';
import { validateMessage } from './validate.js';

/** Làm trễ phản hồi để kiểm chứng huỷ request bằng DevTools; 0 = tắt. Dọn timer nếu client đóng kết nối. */
function delayResponse(ms) {
  return (req, res, next) => {
    if (ms <= 0) return next();
    const timer = setTimeout(next, ms);
    res.on('close', () => clearTimeout(timer));
    return undefined;
  };
}

/**
 * Tạo app Express (không listen để test được bằng supertest).
 * @param {{ store?: ReturnType<typeof createStore>, clientOrigin?: string, delayMs?: number }} [options]
 */
export function createApp({ store = createStore(), clientOrigin = 'http://localhost:5173', delayMs = 0 } = {}) {
  const app = express();

  // Chỉ origin của client, không dùng '*'.
  app.use(cors({ origin: clientOrigin }));
  // Thiếu dòng này thì req.body là undefined và POST sập.
  app.use(express.json({ limit: '10kb' }));
  app.use(delayResponse(delayMs));

  app.get('/api/channels/:channel/messages', (req, res) => {
    const messages = store.getMessages(req.params.channel);
    if (!messages) return res.status(404).json({ error: 'Unknown channel' });
    return res.json(messages);
  });

  app.post('/api/channels/:channel/messages', (req, res) => {
    // Kiểm kênh trước body: kênh lạ luôn là 404.
    if (!CHANNELS.includes(req.params.channel)) return res.status(404).json({ error: 'Unknown channel' });

    const result = validateMessage(req.body);
    if ('error' in result) return res.status(400).json({ error: result.error });

    const message = store.addMessage(req.params.channel, result.value);
    return res.status(201).json(message);
  });

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));

  // Express nhận diện middleware lỗi qua đúng 4 tham số.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Payload too large' });
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
