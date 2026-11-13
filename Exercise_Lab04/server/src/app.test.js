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
