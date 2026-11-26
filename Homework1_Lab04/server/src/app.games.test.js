import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { Game, Profile, Swipe } from './models.js';
import { useTestDb } from './test/db.js';

useTestDb();

const app = createApp();

describe('GET /api/games/current', () => {
  it('chưa có ván nào thì tạo một ván mới với swipes rỗng', async () => {
    const res = await request(app).get('/api/games/current');
    expect(res.status).toBe(200);
    expect(res.body.swipes).toEqual([]);
    expect(res.body.game.id).toMatch(/^[0-9a-f]{24}$/);
    expect(Object.keys(res.body.game).sort()).toEqual(['createdAt', 'id']);
    expect(await Game.countDocuments()).toBe(1);
  });

  it('gọi lại lần hai trả cùng một ván, không tạo thêm', async () => {
    const first = await request(app).get('/api/games/current');
    const second = await request(app).get('/api/games/current');
    expect(second.body.game.id).toBe(first.body.game.id);
    expect(await Game.countDocuments()).toBe(1);
  });

  it('trả lượt quẹt của ván dở theo thứ tự tạo, cũ trước', async () => {
    const game = await Game.create({});
    const [a, b] = await Profile.create([
      { name: 'A', age: 20, gender: 'male', bio: '' },
      { name: 'B', age: 21, gender: 'female', bio: '' },
    ]);
    await Swipe.create({ gameId: game._id, profileId: b._id, direction: 'left' });
    await Swipe.create({ gameId: game._id, profileId: a._id, direction: 'up' });

    const res = await request(app).get('/api/games/current');
    expect(res.body.game.id).toBe(String(game._id));
    expect(res.body.swipes.map((s) => [s.profileId, s.direction])).toEqual([
      [String(b._id), 'left'],
      [String(a._id), 'up'],
    ]);
    expect(res.body.swipes[0]).toMatchObject({ gameId: String(game._id) });
  });

  it('không lẫn lượt quẹt của ván khác', async () => {
    const old = await Game.create({});
    const profile = await Profile.create({ name: 'A', age: 20, gender: 'male', bio: '' });
    await Swipe.create({ gameId: old._id, profileId: profile._id, direction: 'right' });
    await request(app).post('/api/games');

    const res = await request(app).get('/api/games/current');
    expect(res.body.game.id).not.toBe(String(old._id));
    expect(res.body.swipes).toEqual([]);
  });
});

describe('POST /api/games', () => {
  it('tạo ván mới, trả 201 với swipes rỗng', async () => {
    const res = await request(app).post('/api/games');
    expect(res.status).toBe(201);
    expect(res.body.swipes).toEqual([]);
    expect(res.body.game.id).toMatch(/^[0-9a-f]{24}$/);
  });

  it('ván vừa tạo trở thành ván dở, ván cũ vẫn giữ trong DB', async () => {
    const first = await request(app).get('/api/games/current');
    const created = await request(app).post('/api/games');
    const current = await request(app).get('/api/games/current');
    expect(current.body.game.id).toBe(created.body.game.id);
    expect(current.body.game.id).not.toBe(first.body.game.id);
    expect(await Game.countDocuments()).toBe(2);
  });
});
