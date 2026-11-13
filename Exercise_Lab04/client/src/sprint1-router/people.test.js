import { describe, it, expect } from 'vitest';
import { PEOPLE } from './people.js';

describe('PEOPLE', () => {
  it('có ít nhất một người', () => {
    expect(PEOPLE.length).toBeGreaterThan(0);
  });

  it('id là chuỗi và duy nhất (useParams luôn trả chuỗi)', () => {
    const ids = PEOPLE.map((p) => p.id);
    expect(ids.every((id) => typeof id === 'string' && id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('name là chuỗi không rỗng; age và iq là số hữu hạn', () => {
    for (const p of PEOPLE) {
      expect(typeof p.name).toBe('string');
      expect(p.name.trim().length).toBeGreaterThan(0);
      expect(Number.isFinite(p.age)).toBe(true);
      expect(Number.isFinite(p.iq)).toBe(true);
    }
  });

  it('mảng và từng phần tử đều đóng băng', () => {
    expect(Object.isFrozen(PEOPLE)).toBe(true);
    expect(PEOPLE.every((p) => Object.isFrozen(p))).toBe(true);
  });
});
