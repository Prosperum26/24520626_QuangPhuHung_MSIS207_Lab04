import { useEffect, useEffectEvent } from 'react';
import { KEY_TO_DIRECTION, UNDO_KEY } from '../domain/swipeConfig.js';

// Ô đang gõ chữ: không cướp phím (Backspace phải xoá chữ). Lấy từ useDrumKeyboard của Lab 3:
// <input> chỉ tính khi nhận chữ; checkbox, nút... vẫn để phím tắt chạy.
const NON_TEXT_INPUTS = ['checkbox', 'radio', 'range', 'button', 'submit', 'reset', 'image', 'file', 'color']
  .map((type) => `[type="${type}"]`)
  .join(', ');
const TYPING_TARGET = `input:not(${NON_TEXT_INPUTS}), textarea, select, [contenteditable]`;

/**
 * Phím tắt trên window: ← Bỏ qua, → Thích, ↑ Siêu thích, Backspace hoàn tác.
 * @param {{ onSwipe: (direction: 'left'|'right'|'up') => void, onUndo: () => void, enabled?: boolean }} options
 */
export function useSwipeKeyboard({ onSwipe, onUndo, enabled = true }) {
  // useEffectEvent luôn đọc callback mới nhất mà không gắn lại listener mỗi lần render.
  const handleKeyDown = useEffectEvent((e) => {
    if (e.repeat) return; // giữ phím: OS bắn lặp
    if (e.ctrlKey || e.metaKey || e.altKey) return; // phím tắt của trình duyệt
    if (e.target instanceof Element && e.target.closest(TYPING_TARGET)) return;

    const direction = KEY_TO_DIRECTION[e.key];
    if (direction) {
      e.preventDefault(); // mũi tên không cuộn trang
      onSwipe(direction);
    } else if (e.key === UNDO_KEY) {
      e.preventDefault();
      onUndo();
    }
  });

  useEffect(() => {
    if (!enabled) return undefined;
    const listener = (e) => handleKeyDown(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [enabled]);
}
