import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { profile } from '../test/fakeSwipeServer.js';
import { SwipeCard } from './SwipeCard.jsx';

function setup(p = profile('p1', 'Linh', 'female', 21)) {
  const onSwipe = vi.fn();
  render(<SwipeCard profile={p} onSwipe={onSwipe} />);
  return { onSwipe, card: screen.getByRole('article') };
}

/** Kéo từ (100, 100) tới (100 + dx, 100 + dy). */
function drag(card, dx, dy = 0, { up = true } = {}) {
  fireEvent.pointerDown(card, { clientX: 100, clientY: 100, button: 0 });
  fireEvent.pointerMove(card, { clientX: 100 + dx, clientY: 100 + dy });
  if (up) fireEvent.pointerUp(card, { clientX: 100 + dx, clientY: 100 + dy });
}

describe('SwipeCard', () => {
  it('hiện tên, tuổi, bio và avatar theo giới tính', () => {
    const { card } = setup(profile('p2', 'Minh', 'male', 23));
    expect(screen.getByRole('heading', { level: 2, name: 'Minh, 23' })).toBeInTheDocument();
    expect(screen.getByText('Bio Minh')).toBeInTheDocument();
    expect(card).toHaveAccessibleName('Minh, 23');
    expect(card.querySelector('img')).toHaveAttribute('src', '/avatars/male.svg');
    expect(card.querySelector('img')).toHaveAttribute('alt', '');
  });

  it.each([
    [120, 0, 'right'],
    [-120, 0, 'left'],
    [10, -120, 'up'],
  ])('kéo dx=%i dy=%i thì quẹt %s', (dx, dy, direction) => {
    const { onSwipe, card } = setup();
    drag(card, dx, dy);
    expect(onSwipe).toHaveBeenCalledWith(direction);
    expect(onSwipe).toHaveBeenCalledTimes(1);
  });

  it('kéo xuống không phải là quẹt', () => {
    const { onSwipe, card } = setup();
    drag(card, 0, 150);
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('R4: kéo ngắn hơn ngưỡng (40px) thì thẻ về chỗ, không quẹt', () => {
    const { onSwipe, card } = setup();
    drag(card, 40, 0);
    expect(onSwipe).not.toHaveBeenCalled();
    expect(card).not.toHaveAttribute('data-drag');
    expect(card.style.getPropertyValue('--dx')).toBe('');
  });

  it('R4: pointerUp không có pointerDown thì không quẹt, không lỗi', () => {
    const { onSwipe, card } = setup();
    expect(() => fireEvent.pointerUp(card, { clientX: 400, clientY: 100 })).not.toThrow();
    expect(() => fireEvent.pointerMove(card, { clientX: 400, clientY: 100 })).not.toThrow();
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('R4: pointerCancel giữa chừng thì không quẹt', () => {
    const { onSwipe, card } = setup();
    drag(card, 150, 0, { up: false });
    fireEvent.pointerCancel(card);
    fireEvent.pointerUp(card, { clientX: 250, clientY: 100 });
    expect(onSwipe).not.toHaveBeenCalled();
    expect(card).not.toHaveAttribute('data-drag');
  });

  it('chỉ nhận nút chuột chính', () => {
    const { onSwipe, card } = setup();
    fireEvent.pointerDown(card, { clientX: 100, clientY: 100, button: 2 });
    fireEvent.pointerUp(card, { clientX: 300, clientY: 100 });
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('đang kéo quá ngưỡng thì hiện nhãn chữ theo hướng (không chỉ dựa vào màu)', () => {
    const { card } = setup();
    drag(card, 100, 0, { up: false });
    expect(card).toHaveAttribute('data-drag', 'right');
    expect(screen.getByText('THÍCH')).toBeInTheDocument();
    expect(card.style.getPropertyValue('--dx')).toBe('100px');

    fireEvent.pointerMove(card, { clientX: 0, clientY: 100 });
    expect(card).toHaveAttribute('data-drag', 'left');
    expect(screen.getByText('BỎ QUA')).toBeInTheDocument();
  });
});
