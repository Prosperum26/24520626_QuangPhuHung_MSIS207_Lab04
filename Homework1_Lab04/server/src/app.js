import cors from 'cors';
import express from 'express';
import { Game, Profile, Swipe, toDto } from './models.js';

/** GameState của contract: ván + lượt quẹt của ván, cũ trước. */
async function gameState(game) {
  const swipes = await Swipe.find({ gameId: game._id }).sort({ createdAt: 1, _id: 1 }).lean();
  return { game: toDto(game), swipes: swipes.map(toDto) };
}

/**
 * Tạo app Express (không listen để test được bằng supertest). Contract: shared/swipe-api-contract.md.
 * Express 5 tự chuyển lỗi của handler async vào middleware lỗi ở cuối.
 * @param {{ clientOrigin?: string }} [options]
 */
export function createApp({ clientOrigin = 'http://localhost:5174' } = {}) {
  const app = express();

  // Chỉ origin của client, không dùng '*'.
  app.use(cors({ origin: clientOrigin }));
  // Thiếu dòng này thì req.body là undefined và POST sập.
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/profiles', async (req, res) => {
    // .lean(): chỉ đọc, không cần document Mongoose đầy đủ.
    const profiles = await Profile.find().sort({ _id: 1 }).lean();
    res.json(profiles.map(toDto));
  });

  app.get('/api/games/current', async (req, res) => {
    // Ván dở = ván mới nhất; chưa có ván nào thì tạo.
    const latest = await Game.findOne().sort({ createdAt: -1, _id: -1 }).lean();
    const game = latest ?? (await Game.create({})).toObject();
    res.json(await gameState(game));
  });

  app.post('/api/games', async (req, res) => {
    const game = (await Game.create({})).toObject();
    res.status(201).json(await gameState(game));
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
