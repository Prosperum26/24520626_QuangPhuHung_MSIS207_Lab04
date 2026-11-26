import { CATEGORIES } from '../data/photos.js';

/** Hàm thuần cho gallery. Slug và id luôn tra bằng so sánh giá trị, không tra khóa object. */

/** @param {string | null} raw @returns {import('../data/photos.js').CategorySlug} */
export function parseCategory(raw) {
  return CATEGORIES.some((c) => c.slug === raw) ? /** @type {any} */ (raw) : 'all';
}

/** @param {readonly import('../data/photos.js').Photo[]} photos @param {string} category */
export function filterPhotos(photos, category) {
  return category === 'all' ? [...photos] : photos.filter((p) => p.category === category);
}

/** @param {readonly import('../data/photos.js').Photo[]} photos @param {string | null} id */
export function findPhoto(photos, id) {
  return photos.find((p) => p.id === id) ?? null;
}

/**
 * Ảnh trước/sau trong danh sách đang hiện. Ảnh không nằm trong danh sách thì không có trước/sau.
 * @param {readonly import('../data/photos.js').Photo[]} list
 * @param {string} id
 */
export function neighbors(list, id) {
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return { prev: null, next: null, index: -1, total: list.length };
  return { prev: list[index - 1] ?? null, next: list[index + 1] ?? null, index, total: list.length };
}

/**
 * Bản sao của query có áp patch: giá trị null thì xóa khóa, mọi khóa khác được giữ nguyên.
 * @param {URLSearchParams} current
 * @param {Record<string, string | null>} patch
 */
export function withParams(current, patch) {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) next.delete(key);
    else next.set(key, value);
  }
  return next;
}
