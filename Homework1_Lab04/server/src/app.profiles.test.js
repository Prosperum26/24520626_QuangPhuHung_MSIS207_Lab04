import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { SEED_PROFILES, seedProfiles } from './seed.js';
import { useTestDb } from './test/db.js';

useTestDb();

const app = createApp({ clientOrigin: 'http://localhost:5174' });

describe('GET /api/profiles', () => {
  it('DB rỗng thì trả mảng rỗng', async () => {
    const res = await request(app).get('/api/profiles');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('trả 12 hồ sơ theo thứ tự seed, đúng khoá của contract', async () => {
    await seedProfiles();
    const res = await request(app).get('/api/profiles');
    expect(res.status).toBe(200);
    expect(res.body.map((p) => p.name)).toEqual(SEED_PROFILES.map((p) => p.name));
    for (const profile of res.body) {
      expect(Object.keys(profile).sort()).toEqual(['age', 'bio', 'gender', 'id', 'name']);
      expect(profile.id).toMatch(/^[0-9a-f]{24}$/);
    }
  });

  it('chỉ cho phép origin của client', async () => {
    const res = await request(app).get('/api/profiles').set('Origin', 'http://localhost:5174');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5174');
  });
});

describe('lỗi chung', () => {
  it('route lạ trả 404 Not found', async () => {
    const res = await request(app).get('/api/khong-co');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('JSON hỏng trả 400 Invalid JSON', async () => {
    const res = await request(app)
      .post('/api/games')
      .set('Content-Type', 'application/json')
      .send('{"profileId":');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid JSON' });
  });

  it('body quá 10 kB trả 413', async () => {
    const res = await request(app)
      .post('/api/games')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ pad: 'x'.repeat(11 * 1024) }));
    expect(res.status).toBe(413);
    expect(res.body).toEqual({ error: 'Payload too large' });
  });
});
