import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from './app.js';
import { CHANNELS } from './store.js';

const ORIGIN = 'http://localhost:5173';

describe('GET /api/channels/:channel/messages', () => {
  it.each(CHANNELS)('kênh %s: 200 và mảng Message tăng dần theo timestamp', async (channel) => {
    const res = await request(createApp()).get(`/api/channels/${channel}/messages`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    for (const m of res.body) {
      expect(Object.keys(m).sort()).toEqual(['author', 'id', 'text', 'timestamp']);
    }
    const times = res.body.map((m) => Date.parse(m.timestamp));
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it('kênh lạ: 404 { error: "Unknown channel" }', async () => {
    const res = await request(createApp()).get('/api/channels/nope/messages');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Unknown channel' });
  });

  it('tên kênh phân biệt hoa thường (NotNasa không phải notNasa)', async () => {
    const res = await request(createApp()).get('/api/channels/NotNasa/messages');
    expect(res.status).toBe(404);
  });

  it('đường dẫn không có trong hợp đồng: 404 JSON, không phải HTML', async () => {
    const res = await request(createApp()).get('/api/whatever');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});

describe('CORS', () => {
  it('cho origin của client', async () => {
    const res = await request(createApp()).get('/api/channels/nasa/messages').set('Origin', ORIGIN);
    expect(res.headers['access-control-allow-origin']).toBe(ORIGIN);
  });

  it('preflight OPTIONS cho POST JSON được chấp nhận', async () => {
    const res = await request(createApp())
      .options('/api/channels/nasa/messages')
      .set('Origin', ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(ORIGIN);
    expect(res.headers['access-control-allow-methods']).toMatch(/POST/);
  });

  it('clientOrigin lấy từ tham số, không phải chuỗi cứng', async () => {
    const res = await request(createApp({ clientOrigin: 'https://example.test' }))
      .get('/api/channels/nasa/messages')
      .set('Origin', 'https://example.test');
    expect(res.headers['access-control-allow-origin']).toBe('https://example.test');
  });

  it('không dùng dấu * (không mở cho mọi origin)', async () => {
    const res = await request(createApp()).get('/api/channels/nasa/messages').set('Origin', 'http://evil.test');
    expect(res.headers['access-control-allow-origin']).not.toBe('*');
    expect(res.headers['access-control-allow-origin']).not.toBe('http://evil.test');
  });
});

describe('POST /api/channels/:channel/messages', () => {
  const post = (app, channel = 'nasa') => request(app).post(`/api/channels/${channel}/messages`);

  it('201 trả Message do server sinh id và timestamp, rồi GET thấy ở cuối danh sách', async () => {
    const app = createApp();
    const before = (await request(app).get('/api/channels/nasa/messages')).body;
    const res = await post(app).send({ author: 'Ada', text: 'Hello' });
    expect(res.status).toBe(201);
    expect(Object.keys(res.body).sort()).toEqual(['author', 'id', 'text', 'timestamp']);
    expect(res.body.author).toBe('Ada');
    expect(res.body.text).toBe('Hello');
    expect(res.body.id).toMatch(/^[0-9a-f-]{36}$/);
    const after = (await request(app).get('/api/channels/nasa/messages')).body;
    expect(after).toHaveLength(before.length + 1);
    expect(after.at(-1)).toEqual(res.body);
  });

  it('chỉ vào đúng kênh được gửi', async () => {
    const app = createApp();
    const other = (await request(app).get('/api/channels/notNasa/messages')).body;
    await post(app, 'esports-tribunal').send({ author: 'a', text: 'b' });
    const otherAfter = (await request(app).get('/api/channels/notNasa/messages')).body;
    expect(otherAfter).toEqual(other);
  });

  it('cắt khoảng trắng hai đầu', async () => {
    const res = await post(createApp()).send({ author: '  Ada  ', text: '  hi  ' });
    expect(res.status).toBe(201);
    expect(res.body.author).toBe('Ada');
    expect(res.body.text).toBe('hi');
  });

  it('bỏ qua id và timestamp do client gửi', async () => {
    const res = await post(createApp()).send({ author: 'a', text: 'b', id: 'mine', timestamp: '2000-01-01T00:00:00.000Z' });
    expect(res.status).toBe(201);
    expect(res.body.id).not.toBe('mine');
    expect(res.body.timestamp).not.toBe('2000-01-01T00:00:00.000Z');
  });

  it('biên: author 40 và text 500 ký tự được chấp nhận', async () => {
    const res = await post(createApp()).send({ author: 'a'.repeat(40), text: 'b'.repeat(500) });
    expect(res.status).toBe(201);
  });

  it.each([
    ['thiếu author', { text: 'b' }],
    ['thiếu text', { author: 'a' }],
    ['author không phải chuỗi', { author: 5, text: 'b' }],
    ['text không phải chuỗi', { author: 'a', text: { x: 1 } }],
    ['author rỗng sau trim', { author: '   ', text: 'b' }],
    ['text rỗng sau trim', { author: 'a', text: '' }],
    ['author dài hơn 40', { author: 'a'.repeat(41), text: 'b' }],
    ['text dài hơn 500', { author: 'a', text: 'b'.repeat(501) }],
    ['body là mảng', [{ author: 'a', text: 'b' }]],
    ['body rỗng {}', {}],
  ])('400 khi %s, và không ghi vào store', async (_name, body) => {
    const app = createApp();
    const before = (await request(app).get('/api/channels/nasa/messages')).body.length;
    const res = await post(app).send(body);
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.length).toBeGreaterThan(0);
    const after = (await request(app).get('/api/channels/nasa/messages')).body.length;
    expect(after).toBe(before);
  });

  it('400 { error: "Invalid JSON" } khi JSON hỏng', async () => {
    const res = await post(createApp()).set('Content-Type', 'application/json').send('{"author": "a", ');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid JSON' });
  });

  it('400 khi không gửi body JSON (req.body không có)', async () => {
    const res = await post(createApp()).set('Content-Type', 'text/plain').send('author=a&text=b');
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
  });

  it('413 khi body quá lớn', async () => {
    const res = await post(createApp()).send({ author: 'a', text: 'x'.repeat(20_000) });
    expect(res.status).toBe(413);
    expect(res.body).toEqual({ error: 'Payload too large' });
  });

  it('kênh lạ: 404 dù body hợp lệ', async () => {
    const res = await post(createApp(), 'nope').send({ author: 'a', text: 'b' });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Unknown channel' });
  });

  it('kênh lạ được kiểm trước body: body sai vẫn là 404', async () => {
    const res = await post(createApp(), 'nope').send({});
    expect(res.status).toBe(404);
  });
});

describe('RESPONSE_DELAY_MS (delayMs)', () => {
  it('mặc định không trễ', async () => {
    const start = Date.now();
    await request(createApp()).get('/api/channels/nasa/messages');
    expect(Date.now() - start).toBeLessThan(500);
  });

  it('delayMs làm trễ phản hồi (để kiểm chứng huỷ request bằng DevTools)', async () => {
    const start = Date.now();
    const res = await request(createApp({ delayMs: 80 })).get('/api/channels/nasa/messages');
    expect(res.status).toBe(200);
    expect(Date.now() - start).toBeGreaterThanOrEqual(75);
  });
});
