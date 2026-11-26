import cors from 'cors';
import express from 'express';
import { evaluateErrors, toAppeal } from '../../shared/appealRules.js';

/**
 * API theo shared/appeal-api-contract.md. Server là nguồn thật của giờ và hạn SLA:
 * client chỉ hiển thị đếm ngược, còn việc chặn nộp quá hạn nằm ở đây.
 * @param {{ store: ReturnType<typeof import('./store.js').createStore>, now?: () => number, clientOrigin?: string }} options
 */
export function createApp({ store, now = Date.now, clientOrigin = 'http://localhost:5175' }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: clientOrigin }));
  app.use(express.json({ limit: '20kb' }));

  app.get('/api/time', (req, res) => {
    res.json({ now: now() });
  });

  app.get('/api/dossiers', (req, res) => {
    res.json(store.listDossiers());
  });

  app.get('/api/dossiers/:playerId', (req, res) => {
    const dossier = store.getDossier(req.params.playerId);
    if (!dossier) return res.status(404).json({ error: 'Dossier not found' });
    return res.json(dossier);
  });

  app.post('/api/dossiers/:playerId/appeals', (req, res) => {
    const { playerId } = req.params;
    const dossier = store.getDossier(playerId);
    if (!dossier) return res.status(404).json({ error: 'Dossier not found' });

    const body = req.body;
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ error: 'Body must be a JSON object' });
    }
    const fields = evaluateErrors(body);
    if (Object.keys(fields).length > 0) return res.status(400).json({ error: 'Validation failed', fields });

    if (now() >= dossier.appealDeadline) return res.status(409).json({ error: 'Appeal window closed' });
    if (dossier.appeal) return res.status(409).json({ error: 'Appeal already submitted' });

    return res.status(201).json(store.addAppeal(playerId, toAppeal(body)));
  });

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));

  // Express 5 tự chuyển lỗi vào đây. Đủ 4 tham số thì Express mới nhận là error handler.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Payload too large' });
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
