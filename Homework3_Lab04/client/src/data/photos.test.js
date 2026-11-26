import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CATEGORIES, PHOTOS } from './photos.js';

describe('PHOTOS', () => {
  it('12 ảnh, id duy nhất theo dạng pNN', () => {
    expect(PHOTOS).toHaveLength(12);
    expect(new Set(PHOTOS.map((p) => p.id)).size).toBe(12);
    expect(PHOTOS.every((p) => /^p\d{2}$/.test(p.id))).toBe(true);
  });

  it('mỗi danh mục thật có đúng 4 ảnh', () => {
    const real = CATEGORIES.filter((c) => c.slug !== 'all');
    expect(real.map((c) => c.slug)).toEqual(['scene', 'document', 'chart']);
    for (const { slug } of real) expect(PHOTOS.filter((p) => p.category === slug)).toHaveLength(4);
  });

  it('CATEGORIES đúng thứ tự, có Tất cả đầu tiên', () => {
    expect(CATEGORIES.map((c) => c.label)).toEqual(['Tất cả', 'Hiện trường', 'Tài liệu', 'Biểu đồ']);
  });

  it('title, caption không rỗng; alt đủ dài và khác nhau', () => {
    expect(PHOTOS.every((p) => p.title.trim() !== '' && p.caption.trim() !== '')).toBe(true);
    expect(PHOTOS.every((p) => p.alt.length >= 20)).toBe(true);
    expect(new Set(PHOTOS.map((p) => p.alt)).size).toBe(12);
  });

  it('kích thước 600x400 và mỗi src có file trong public/', () => {
    for (const p of PHOTOS) {
      expect([p.width, p.height]).toEqual([600, 400]);
      expect(existsSync(resolve(process.cwd(), 'public', p.src.slice(1)))).toBe(true);
    }
  });
});
