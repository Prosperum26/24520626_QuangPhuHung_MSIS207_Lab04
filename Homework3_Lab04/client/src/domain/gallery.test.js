import { describe, expect, it } from 'vitest';
import { PHOTOS } from '../data/photos.js';
import { filterPhotos, findPhoto, neighbors, parseCategory, withParams } from './gallery.js';

describe('gallery domain', () => {
  it('parseCategory chỉ nhận slug hợp lệ (R4)', () => {
    expect(parseCategory('document')).toBe('document');
    for (const bad of ['xyz', '', null, 'constructor', '__proto__', 'Scene']) expect(parseCategory(bad)).toBe('all');
  });

  it('filterPhotos', () => {
    expect(filterPhotos(PHOTOS, 'all')).toHaveLength(12);
    const scene = filterPhotos(PHOTOS, 'scene');
    expect(scene).toHaveLength(4);
    expect(scene.every((p) => p.category === 'scene')).toBe(true);
  });

  it('findPhoto: id lạ, null và khóa nguyên mẫu đều trả null', () => {
    expect(findPhoto(PHOTOS, 'p01').id).toBe('p01');
    for (const bad of ['zz', null, 'constructor']) expect(findPhoto(PHOTOS, bad)).toBeNull();
  });

  it('neighbors giữa, đầu, cuối, vắng mặt (R7)', () => {
    const list = PHOTOS.slice(0, 3);
    expect(neighbors(list, 'p02')).toMatchObject({ index: 1, total: 3, prev: { id: 'p01' }, next: { id: 'p03' } });
    expect(neighbors(list, 'p01')).toMatchObject({ prev: null, next: { id: 'p02' } });
    expect(neighbors(list, 'p03')).toMatchObject({ prev: { id: 'p02' }, next: null });
    expect(neighbors(list, 'p09')).toEqual({ prev: null, next: null, index: -1, total: 3 });
  });

  it('withParams áp patch, xóa khi null, giữ khóa khác, không đổi input', () => {
    const current = new URLSearchParams('category=chart&photoId=p09&utm=1');
    const next = withParams(current, { photoId: null });
    expect(Object.fromEntries(next)).toEqual({ category: 'chart', utm: '1' });
    expect(Object.fromEntries(withParams(current, { category: 'scene', photoId: 'p01' }))).toEqual({
      category: 'scene',
      photoId: 'p01',
      utm: '1',
    });
    expect(current.toString()).toBe('category=chart&photoId=p09&utm=1');
  });
});
