import { fireEvent, render, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSwipeKeyboard } from './useSwipeKeyboard.js';

function setup(enabled = true) {
  const onSwipe = vi.fn();
  const onUndo = vi.fn();
  const hook = renderHook((props) => useSwipeKeyboard(props), { initialProps: { onSwipe, onUndo, enabled } });
  return { onSwipe, onUndo, ...hook };
}

/** fireEvent trả false khi handler gọi preventDefault. */
const press = (key, init = {}, target = window) => fireEvent.keyDown(target, { key, ...init });

describe('useSwipeKeyboard', () => {
  it.each([
    ['ArrowLeft', 'left'],
    ['ArrowRight', 'right'],
    ['ArrowUp', 'up'],
  ])('%s gọi onSwipe(%s) và chặn hành vi mặc định', (key, direction) => {
    const { onSwipe } = setup();
    expect(press(key)).toBe(false);
    expect(onSwipe).toHaveBeenCalledWith(direction);
  });

  it('Backspace gọi onUndo và chặn trình duyệt quay lại trang trước', () => {
    const { onUndo, onSwipe } = setup();
    expect(press('Backspace')).toBe(false);
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('phím khác không làm gì và không bị chặn', () => {
    const { onSwipe, onUndo } = setup();
    expect(press('ArrowDown')).toBe(true);
    expect(press('a')).toBe(true);
    expect(onSwipe).not.toHaveBeenCalled();
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('R2: giữ phím (repeat) không quẹt liên tục', () => {
    const { onSwipe } = setup();
    press('ArrowRight', { repeat: true });
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it.each(['ctrlKey', 'metaKey', 'altKey'])('bỏ qua khi có %s (phím tắt trình duyệt)', (modifier) => {
    const { onSwipe } = setup();
    press('ArrowLeft', { [modifier]: true });
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('bỏ qua khi focus đang ở ô nhập chữ', () => {
    const { onUndo } = setup();
    const { getByRole } = render(<input type="text" aria-label="ghi chú" />);
    press('Backspace', {}, getByRole('textbox'));
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('vẫn nhận phím khi focus ở một nút', () => {
    const { onSwipe } = setup();
    const { getByRole } = render(<button type="button">Thích</button>);
    press('ArrowRight', {}, getByRole('button'));
    expect(onSwipe).toHaveBeenCalledWith('right');
  });

  it('enabled false thì không làm gì', () => {
    const { onSwipe } = setup(false);
    expect(press('ArrowRight')).toBe(true);
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('luôn gọi callback mới nhất sau khi rerender', () => {
    const { rerender, onUndo } = setup();
    const latest = vi.fn();
    rerender({ onSwipe: latest, onUndo, enabled: true });
    press('ArrowUp');
    expect(latest).toHaveBeenCalledWith('up');
  });

  it('gỡ listener khi unmount', () => {
    const { onSwipe, unmount } = setup();
    unmount();
    press('ArrowLeft');
    expect(onSwipe).not.toHaveBeenCalled();
  });
});
