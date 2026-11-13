import { describe, it, expect } from 'vitest';
import { CHANNELS, createStore } from './store.js';

describe('CHANNELS', () => {
  it('đúng ba kênh của đề và đóng băng', () => {
    expect(CHANNELS).toEqual(['nasa', 'esports-tribunal', 'notNasa']);
    expect(Object.isFrozen(CHANNELS)).toBe(true);
  });
});

describe('createStore', () => {
  it('mỗi kênh có vài tin mẫu, đúng dạng Message, tăng dần theo timestamp', () => {
    const store = createStore();
    for (const channel of CHANNELS) {
      const messages = store.getMessages(channel);
      expect(messages.length).toBeGreaterThan(0);
      for (const m of messages) {
        expect(typeof m.id).toBe('string');
        expect(typeof m.author).toBe('string');
        expect(typeof m.text).toBe('string');
        expect(Number.isNaN(Date.parse(m.timestamp))).toBe(false);
      }
      const times = messages.map((m) => Date.parse(m.timestamp));
      expect(times).toEqual([...times].sort((a, b) => a - b));
    }
  });

  it('id của mọi tin trong store là duy nhất', () => {
    const store = createStore();
    const ids = CHANNELS.flatMap((c) => store.getMessages(c).map((m) => m.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('kênh lạ thì getMessages và addMessage trả undefined', () => {
    const store = createStore();
    expect(store.getMessages('nope')).toBeUndefined();
    expect(store.addMessage('nope', { author: 'a', text: 'b' })).toBeUndefined();
  });

  it('getMessages trả bản sao: sửa mảng trả về không đổi store', () => {
    const store = createStore();
    const copy = store.getMessages('nasa');
    const length = copy.length;
    copy.push({ id: 'x' });
    expect(store.getMessages('nasa')).toHaveLength(length);
  });

  it('addMessage sinh id và timestamp, thêm vào cuối đúng kênh', () => {
    const store = createStore();
    const before = store.getMessages('nasa').length;
    const created = store.addMessage('nasa', { author: 'Ada', text: 'Hello' });
    expect(created.author).toBe('Ada');
    expect(created.text).toBe('Hello');
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(Number.isNaN(Date.parse(created.timestamp))).toBe(false);
    const after = store.getMessages('nasa');
    expect(after).toHaveLength(before + 1);
    expect(after.at(-1)).toEqual(created);
    expect(store.getMessages('notNasa').some((m) => m.id === created.id)).toBe(false);
  });

  it('hai store độc lập nhau', () => {
    const a = createStore();
    const b = createStore();
    a.addMessage('nasa', { author: 'x', text: 'y' });
    expect(b.getMessages('nasa')).toHaveLength(a.getMessages('nasa').length - 1);
  });
});
