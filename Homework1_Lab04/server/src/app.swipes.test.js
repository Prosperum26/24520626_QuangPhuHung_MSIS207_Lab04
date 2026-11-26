import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { Game, Profile, Swipe } from './models.js';
import { useTestDb } from './test/db.js';

useTestDb();

const app = createApp();
const MISSING_ID = '6745f0c2a1b2c3d4e5f60718';

let gameId;
let a;
let b;

beforeEach(async () => {
  gameId = String((await Game.create({}))._id);
  [a, b] = (
    await Profile.create([
      { name: 'A', age: 20, gender: 'male', bio: '' },
      { name: 'B', age: 21, gender: 'female', bio: '' },
    ])
  ).map((p) => String(p._id));
});

const swipe = (profileId, direction, id = gameId) =>
  request(app).post(`/api/games/${id}/swipes`).send({ profileId, direction });
const undo = (id = gameId) => request(app).delete(`/api/games/${id}/swipes/last`);

describe('POST /api/games/:gameId/swipes', () => {
  it('ghi lượt quẹt, trả 201 Swipe đúng contract', async () => {
    const res = await swipe(a, 'right');
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ gameId, profileId: a, direction: 'right' });
    expect(Object.keys(res.body).sort()).toEqual(['createdAt', 'direction', 'gameId', 'id', 'profileId']);
    expect(await Swipe.countDocuments({ gameId })).toBe(1);
  });

  it('gameId sai định dạng trả 400, không phải 500', async () => {
    const res = await swipe(a, 'right', 'abc');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'gameId is invalid' });
  });

  it('body sai trả 400 với thông báo của validateSwipe', async () => {
    const res = await swipe(a, 'down');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'direction must be left, right or up' });
    const bad = await swipe('abc', 'left');
    expect(bad.body).toEqual({ error: 'profileId is invalid' });
  });

  it('game không tồn tại trả 404 Game not found', async () => {
    const res = await swipe(a, 'right', MISSING_ID);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Game not found' });
  });

  it('profile không tồn tại trả 404 Profile not found', async () => {
    const res = await swipe(MISSING_ID, 'right');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Profile not found' });
  });

  it('quẹt trùng hồ sơ trong cùng ván trả 409', async () => {
    await swipe(a, 'right');
    const res = await swipe(a, 'left');
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'Profile already swiped in this game' });
    expect(await Swipe.countDocuments({ gameId })).toBe(1);
  });
});

describe('DELETE /api/games/:gameId/swipes/last', () => {
  it('hoàn tác theo LIFO: lượt sau cùng bị xoá trước', async () => {
    await swipe(a, 'right');
    await swipe(b, 'up');

    const first = await undo();
    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({ profileId: b, direction: 'up' });

    const second = await undo();
    expect(second.body).toMatchObject({ profileId: a, direction: 'right' });

    const empty = await undo();
    expect(empty.status).toBe(404);
    expect(empty.body).toEqual({ error: 'No swipe to undo' });
  });

  it('sau khi hoàn tác thì quẹt lại được đúng hồ sơ đó', async () => {
    await swipe(a, 'right');
    await undo();
    const res = await swipe(a, 'left');
    expect(res.status).toBe(201);
  });

  it('chỉ xoá lượt của ván được chỉ định', async () => {
    const other = String((await Game.create({}))._id);
    await swipe(a, 'right', other);
    await swipe(b, 'left');
    const res = await undo();
    expect(res.body).toMatchObject({ profileId: b });
    expect(await Swipe.countDocuments({ gameId: other })).toBe(1);
  });

  it('gameId sai định dạng trả 400', async () => {
    const res = await undo('abc');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'gameId is invalid' });
  });

  it('game không tồn tại trả 404 Game not found', async () => {
    const res = await undo(MISSING_ID);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Game not found' });
  });
});
