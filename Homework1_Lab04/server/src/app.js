import cors from 'cors';
import express from 'express';
import { Game, Profile, Swipe, toDto } from './models.js';
import { isObjectIdString, validateSwipe } from './validate.js';

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

  app.post('/api/games/:gameId/swipes', async (req, res) => {
    const { gameId } = req.params;
    if (!isObjectIdString(gameId)) return res.status(400).json({ error: 'gameId is invalid' });

    const result = validateSwipe(req.body);
    if ('error' in result) return res.status(400).json({ error: result.error });

    if (!(await Game.exists({ _id: gameId }))) return res.status(404).json({ error: 'Game not found' });
    if (!(await Profile.exists({ _id: result.value.profileId }))) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    try {
      const swipe = await Swipe.create({ gameId, ...result.value });
      return res.status(201).json(toDto(swipe.toObject()));
    } catch (err) {
      // Index unique { gameId, profileId }: hồ sơ này đã quẹt trong ván.
      if (err.code === 11000) return res.status(409).json({ error: 'Profile already swiped in this game' });
      throw err;
    }
  });

  // Hoàn tác LIFO: xoá lượt quẹt mới nhất của ván.
  app.delete('/api/games/:gameId/swipes/last', async (req, res) => {
    const { gameId } = req.params;
    if (!isObjectIdString(gameId)) return res.status(400).json({ error: 'gameId is invalid' });
    if (!(await Game.exists({ _id: gameId }))) return res.status(404).json({ error: 'Game not found' });

    const removed = await Swipe.findOneAndDelete({ gameId }, { sort: { createdAt: -1, _id: -1 } }).lean();
    if (!removed) return res.status(404).json({ error: 'No swipe to undo' });
    return res.json(toDto(removed));
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
