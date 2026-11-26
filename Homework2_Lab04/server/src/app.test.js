import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app.js';
import { createStore } from './store.js';

const START = Date.UTC(2026, 10, 26, 12, 0, 0);
const VALID = {
  email: 'a@b.vn',
  grounds: ['friendly-match', 'not-notified'],
  statement: 'x'.repeat(120),
  evidenceUrl: 'https://youtu.be/abc',
  confirm: true,
};

let now;
let app;
let store;

beforeEach(() => {
  now = START;
  const clock = () => now;
  store = createStore({ now: clock });
  app = createApp({ store, now: clock });
});

describe('GET', () => {
  it('/api/time trả giờ server', async () => {
    now = START + 1234;
    const res = await request(app).get('/api/time');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ now: START + 1234 });
  });

  it('/api/dossiers trả tóm tắt', async () => {
    const res = await request(app).get('/api/dossiers');
    expect(res.status).toBe(200);
    expect(res.body.map((d) => d.id)).toEqual(['himass', 'tanvuu']);
  });

  it('/api/dossiers/himass trả hồ sơ đầy đủ', async () => {
    const res = await request(app).get('/api/dossiers/himass');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 'himass', factors: { eventTier: 'exhibition' }, appeal: null });
    expect(res.body.appealDeadline).toBe(START + 48 * 3_600_000);
  });

  it('id lạ thì 404', async () => {
    const res = await request(app).get('/api/dossiers/xyz');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Dossier not found' });
  });

  it('route lạ thì 404 Not found', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('CORS chỉ cho client 5175', async () => {
    const res = await request(app).get('/api/time').set('Origin', 'http://localhost:5175');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5175');
  });
});

describe('POST /api/dossiers/:playerId/appeals', () => {
  const post = (id, body) => request(app).post(`/api/dossiers/${id}/appeals`).send(body);

  it('đơn hợp lệ thì 201 và được lưu (chuẩn hoá)', async () => {
    now = START + 60_000;
    const res = await post('himass', { ...VALID, email: ' a@b.vn ', extra: 1 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ...VALID, playerId: 'himass', submittedAt: START + 60_000 });
    expect(res.body).not.toHaveProperty('extra');
    const dossier = await request(app).get('/api/dossiers/himass');
    expect(dossier.body.appeal).toEqual(res.body);
  });

  it('R5: nộp lần hai thì 409', async () => {
    await post('himass', VALID);
    const res = await post('himass', VALID);
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'Appeal already submitted' });
  });

  it('R6: sai kiểu thì 400 kèm lỗi field, không 500', async () => {
    const res = await post('himass', { ...VALID, grounds: 'x', statement: 42 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.fields).toEqual({ grounds: 'Chọn ít nhất một căn cứ', statement: 'Bản giải trình là bắt buộc' });
  });

  it('body là mảng thì 400', async () => {
    const res = await post('himass', []);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Body must be a JSON object' });
  });

  it('JSON hỏng thì 400 Invalid JSON', async () => {
    const res = await request(app)
      .post('/api/dossiers/himass/appeals')
      .set('Content-Type', 'application/json')
      .send('{"email":');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid JSON' });
  });

  it('body quá lớn thì 413', async () => {
    const res = await post('himass', { ...VALID, statement: 'x'.repeat(30_000) });
    expect(res.status).toBe(413);
    expect(res.body).toEqual({ error: 'Payload too large' });
  });

  it('R4: tới hạn thì 409 Appeal window closed', async () => {
    now = store.getDossier('tanvuu').appealDeadline;
    const res = await post('tanvuu', VALID);
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'Appeal window closed' });
  });

  it('hồ sơ lạ thì 404 trước khi kiểm body', async () => {
    const res = await post('xyz', {});
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Dossier not found' });
  });

  it('lỗi bất ngờ thì 500 Internal server error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    store.addAppeal = () => {
      throw new Error('boom');
    };
    const res = await post('himass', VALID);
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
    vi.restoreAllMocks();
  });
});
