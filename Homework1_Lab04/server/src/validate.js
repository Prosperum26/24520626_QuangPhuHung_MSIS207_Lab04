import { DIRECTIONS } from './models.js';

/**
 * Id hợp lệ = chuỗi 24 ký tự hex. Không dùng mongoose.isValidObjectId vì nó nhận cả số
 * và chuỗi bất kỳ dài 12 ký tự.
 * @param {unknown} value
 */
export function isObjectIdString(value) {
  return typeof value === 'string' && /^[0-9a-f]{24}$/i.test(value);
}

/**
 * Kiểm body của POST /api/games/:gameId/swipes. Chỉ lấy profileId và direction, bỏ khoá thừa.
 * Thứ tự kiểm theo shared/swipe-api-contract.md mục 3.4.
 * @param {unknown} body
 * @returns {{ value: { profileId: string, direction: 'left'|'right'|'up' } } | { error: string }}
 */
export function validateSwipe(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Body must be a JSON object' };
  }
  const { profileId, direction } = /** @type {Record<string, unknown>} */ (body);
  if (!DIRECTIONS.includes(/** @type {string} */ (direction))) {
    return { error: 'direction must be left, right or up' };
  }
  if (!isObjectIdString(profileId)) return { error: 'profileId is invalid' };
  return { value: { profileId: /** @type {string} */ (profileId), direction: /** @type {'left'|'right'|'up'} */ (direction) } };
}
