import { SCORE } from './swipeConfig.js';

/**
 * Hàm thuần, gọi trong lúc render. Bộ bài, điểm và thống kê đều dẫn xuất từ `history`,
 * không bao giờ nằm trong state riêng.
 * @typedef {{ id: string }} Profile
 * @typedef {{ id: string, profileId: string, direction: import('./swipeConfig.js').Direction }} Swipe
 */

/**
 * Thẻ còn lại = hồ sơ chưa quẹt, giữ thứ tự gốc. Hoàn tác (bỏ phần tử cuối của history)
 * tự trả thẻ về đúng vị trí.
 * @param {readonly Profile[]} profiles
 * @param {readonly Swipe[]} history
 */
export function deriveDeck(profiles, history) {
  const swipedIds = new Set(history.map((swipe) => swipe.profileId));
  return profiles.filter((profile) => !swipedIds.has(profile.id));
}

/** @param {readonly Swipe[]} history */
export function scoreOf(history) {
  return history.reduce((sum, swipe) => sum + SCORE[swipe.direction], 0);
}

/**
 * @param {readonly Swipe[]} history
 * @returns {{ left: number, right: number, up: number }}
 */
export function tally(history) {
  const counts = { left: 0, right: 0, up: 0 };
  for (const swipe of history) counts[swipe.direction] += 1;
  return counts;
}
