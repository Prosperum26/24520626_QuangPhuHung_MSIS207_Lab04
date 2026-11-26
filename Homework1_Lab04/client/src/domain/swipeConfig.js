/**
 * Mọi hằng số của Swipe Deck ở một chỗ. Đổi luật chơi = sửa file này.
 * @typedef {'left'|'right'|'up'} Direction  left = Bỏ qua, right = Thích, up = Siêu thích
 */

/** Điểm bất đối xứng: bỏ qua bị trừ ít hơn mức thích được cộng. */
export const SCORE = Object.freeze({ right: 10, left: -5, up: 20 });

export const DIRECTIONS = Object.freeze(['left', 'right', 'up']);

export const DIRECTION_LABEL = Object.freeze({ left: 'Bỏ qua', right: 'Thích', up: 'Siêu thích' });

/** Đọc theo e.key (mã phím dạng số đã lỗi thời). */
export const KEY_TO_DIRECTION = Object.freeze({ ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up' });

export const UNDO_KEY = 'Backspace';

/** Kéo quá ngưỡng này (px) mới tính là quẹt; ngắn hơn thì thẻ về chỗ. */
export const SWIPE_THRESHOLD_PX = 80;
