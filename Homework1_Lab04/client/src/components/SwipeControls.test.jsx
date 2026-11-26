import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SwipeControls } from './SwipeControls.jsx';

function setup(props = {}) {
  const onSwipe = vi.fn();
  const onUndo = vi.fn();
  render(<SwipeControls onSwipe={onSwipe} onUndo={onUndo} canSwipe canUndo {...props} />);
  return { onSwipe, onUndo };
}

describe('SwipeControls', () => {
  it('bốn nút có tên bằng chữ, type="button" và phím tắt tương ứng', () => {
    setup();
    const expected = [
      ['Bỏ qua', 'ArrowLeft'],
      ['Siêu thích', 'ArrowUp'],
      ['Thích', 'ArrowRight'],
      ['Hoàn tác', 'Backspace'],
    ];
    for (const [name, key] of expected) {
      const button = screen.getByRole('button', { name });
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('aria-keyshortcuts', key);
    }
  });

  it('bấm nút gọi đúng hướng và hoàn tác', async () => {
    const user = userEvent.setup();
    const { onSwipe, onUndo } = setup();
    await user.click(screen.getByRole('button', { name: 'Bỏ qua' }));
    await user.click(screen.getByRole('button', { name: 'Siêu thích' }));
    await user.click(screen.getByRole('button', { name: 'Thích' }));
    await user.click(screen.getByRole('button', { name: 'Hoàn tác' }));
    expect(onSwipe.mock.calls).toEqual([['left'], ['up'], ['right']]);
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('canSwipe false tắt ba nút quẹt; canUndo false tắt nút hoàn tác', () => {
    setup({ canSwipe: false, canUndo: false });
    for (const name of ['Bỏ qua', 'Siêu thích', 'Thích', 'Hoàn tác']) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
  });
});
