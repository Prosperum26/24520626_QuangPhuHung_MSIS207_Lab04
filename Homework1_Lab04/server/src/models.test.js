import { describe, expect, it } from 'vitest';
import { connectDb } from './db.js';
import { DIRECTIONS, Game, Profile, Swipe, toDto } from './models.js';
import { useTestDb } from './test/db.js';

useTestDb();

const linh = { name: 'Linh', age: 21, gender: 'female', bio: 'Thích cà phê' };

describe('connectDb', () => {
  it('ném lỗi khi thiếu uri', async () => {
    await expect(connectDb(undefined)).rejects.toThrow('MONGODB_URI missing');
    await expect(connectDb('')).rejects.toThrow('MONGODB_URI missing');
  });
});

describe('Profile', () => {
  it('lưu hồ sơ hợp lệ', async () => {
    const doc = await Profile.create(linh);
    expect(doc.name).toBe('Linh');
  });

  it('từ chối tuổi dưới 18 và trên 99', async () => {
    await expect(Profile.create({ ...linh, age: 17 })).rejects.toThrow();
    await expect(Profile.create({ ...linh, age: 100 })).rejects.toThrow();
  });

  it('từ chối gender lạ', async () => {
    await expect(Profile.create({ ...linh, gender: 'x' })).rejects.toThrow();
  });

  it('từ chối tên rỗng sau trim hoặc dài hơn 40 ký tự', async () => {
    await expect(Profile.create({ ...linh, name: '   ' })).rejects.toThrow();
    await expect(Profile.create({ ...linh, name: 'a'.repeat(41) })).rejects.toThrow();
  });

  it('từ chối bio dài hơn 140 ký tự', async () => {
    await expect(Profile.create({ ...linh, bio: 'a'.repeat(141) })).rejects.toThrow();
  });
});

describe('Swipe', () => {
  it('DIRECTIONS là left, right, up', () => {
    expect(DIRECTIONS).toEqual(['left', 'right', 'up']);
  });

  it('từ chối direction lạ', async () => {
    const game = await Game.create({});
    const profile = await Profile.create(linh);
    await expect(Swipe.create({ gameId: game._id, profileId: profile._id, direction: 'down' })).rejects.toThrow();
  });

  it('không cho quẹt trùng một hồ sơ trong cùng một ván', async () => {
    const game = await Game.create({});
    const profile = await Profile.create(linh);
    await Swipe.create({ gameId: game._id, profileId: profile._id, direction: 'right' });
    await expect(
      Swipe.create({ gameId: game._id, profileId: profile._id, direction: 'left' }),
    ).rejects.toMatchObject({ code: 11000 });
  });

  it('cho quẹt cùng hồ sơ ở hai ván khác nhau', async () => {
    const [g1, g2] = await Promise.all([Game.create({}), Game.create({})]);
    const profile = await Profile.create(linh);
    await Swipe.create({ gameId: g1._id, profileId: profile._id, direction: 'right' });
    await expect(Swipe.create({ gameId: g2._id, profileId: profile._id, direction: 'right' })).resolves.toBeTruthy();
  });
});

describe('toDto', () => {
  it('đổi _id thành id chuỗi, bỏ _id và __v', async () => {
    const doc = await Profile.create(linh);
    const dto = toDto(await Profile.findById(doc._id).lean());
    expect(dto).toEqual({ id: String(doc._id), name: 'Linh', age: 21, gender: 'female', bio: 'Thích cà phê' });
  });

  it('đổi gameId, profileId thành chuỗi và createdAt thành ISO', async () => {
    const game = await Game.create({});
    const profile = await Profile.create(linh);
    const swipe = await Swipe.create({ gameId: game._id, profileId: profile._id, direction: 'up' });
    const dto = toDto(await Swipe.findById(swipe._id).lean());
    expect(dto).toEqual({
      id: String(swipe._id),
      gameId: String(game._id),
      profileId: String(profile._id),
      direction: 'up',
      createdAt: swipe.createdAt.toISOString(),
    });
  });

  it('Game chỉ còn id và createdAt', async () => {
    const game = await Game.create({});
    expect(toDto(await Game.findById(game._id).lean())).toEqual({
      id: String(game._id),
      createdAt: game.createdAt.toISOString(),
    });
  });
});
