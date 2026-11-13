import cors from 'cors';
import express from 'express';
import { createStore } from './store.js';

/**
 * Tạo app Express (không listen để test được bằng supertest).
 * @param {{ store?: ReturnType<typeof createStore>, clientOrigin?: string }} [options]
 */
export function createApp({ store = createStore(), clientOrigin = 'http://localhost:5173' } = {}) {
  const app = express();

  // Chỉ origin của client, không dùng '*'.
  app.use(cors({ origin: clientOrigin }));

  app.get('/api/channels/:channel/messages', (req, res) => {
    const messages = store.getMessages(req.params.channel);
    if (!messages) return res.status(404).json({ error: 'Unknown channel' });
    return res.json(messages);
  });

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));

  return app;
}
