import { StrictMode } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { PHOTOS } from '../data/photos.js';
import { PhotoLightbox } from './PhotoLightbox.jsx';

const [p1, p2, p3] = PHOTOS;

function Harness({ photo, prev = null, next = null, position = { index: 0, total: 3 }, onClose, wrapper: Wrapper = 'div' }) {
  const location = useLocation();
  return (
    <Wrapper>
      <span data-testid="search">{location.search}</span>
      <PhotoLightbox
        photo={photo}
        prev={prev}
        next={next}
        position={position}
        hrefFor={(id) => `?photoId=${id}`}
        onClose={onClose}
      />
    </Wrapper>
  );
}

function setup(props = {}) {
  const onClose = vi.fn();
  const ui = (p) => (
    <MemoryRouter initialEntries={['/?photoId=p01']}>
      <Harness photo={p1} onClose={onClose} {...p} />
    </MemoryRouter>
  );
  const view = render(ui(props));
  return { onClose, view, rerenderWith: (p) => view.rerender(ui({ ...props, ...p })) };
}

const dialog = () => document.querySelector('dialog');

describe('PhotoLightbox', () => {
  it('photo có giá trị thì dialog mở; chuyển null thì đóng và KHÔNG gọi onClose', () => {
    const { onClose, rerenderWith } = setup();
    expect(dialog()).toHaveAttribute('open');
    rerenderWith({ photo: null });
    expect(dialog()).not.toHaveAttribute('open');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('dialog có tên là tiêu đề ảnh, img có alt đầy đủ, hiện chú thích', () => {
    setup();
    expect(screen.getByRole('dialog', { name: p1.title })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: p1.alt })).toHaveAttribute('src', p1.src);
    expect(screen.getByText(p1.caption)).toBeInTheDocument();
  });

  it('nút Đóng là phần tử focus được đầu tiên trong dialog', () => {
    setup();
    const first = dialog().querySelector('button, a[href], input, [tabindex]');
    expect(first).toHaveAccessibleName('Đóng');
  });

  it('bấm Đóng gọi onClose đúng một lần', async () => {
    const { onClose } = setup();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Đóng' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('R2: Esc (dialog tự close) gọi onClose một lần', () => {
    const { onClose } = setup();
    act(() => dialog().close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('bấm nền tối thì đóng, bấm vào ảnh thì không', async () => {
    const { onClose } = setup();
    const user = userEvent.setup();
    await user.click(screen.getByRole('img', { name: p1.alt }));
    expect(onClose).not.toHaveBeenCalled();
    await user.click(dialog());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('R5: chạy được dưới StrictMode và khi render lại cùng photo', () => {
    const onClose = vi.fn();
    const ui = (
      <StrictMode>
        <MemoryRouter>
          <Harness photo={p1} onClose={onClose} />
        </MemoryRouter>
      </StrictMode>
    );
    const view = render(ui);
    expect(() => view.rerender(ui)).not.toThrow();
    expect(dialog()).toHaveAttribute('open');
  });

  it('R7: ảnh đầu thì Ảnh trước aria-disabled và bấm không đổi URL; hiện vị trí', async () => {
    setup({ next: p2, position: { index: 0, total: 3 } });
    const prev = screen.getByRole('button', { name: 'Ảnh trước' });
    expect(prev).toHaveAttribute('aria-disabled', 'true');
    expect(prev).not.toBeDisabled();
    await userEvent.setup().click(prev);
    expect(screen.getByTestId('search')).toHaveTextContent('?photoId=p01');
    expect(screen.getByText('Ảnh 1/3')).toBeInTheDocument();
  });

  it('R7: ảnh cuối thì Ảnh sau aria-disabled; Ảnh trước chuyển ảnh bằng replace', async () => {
    setup({ photo: p3, prev: p2, next: null, position: { index: 2, total: 3 } });
    expect(screen.getByRole('button', { name: 'Ảnh sau' })).toHaveAttribute('aria-disabled', 'true');
    const prev = screen.getByRole('button', { name: 'Ảnh trước' });
    expect(prev).not.toHaveAttribute('aria-disabled', 'true');
    await userEvent.setup().click(prev);
    expect(screen.getByTestId('search')).toHaveTextContent('?photoId=p02');
  });

  it('không có position thì không hiện chữ vị trí và không có nút chuyển ảnh', () => {
    setup({ position: null });
    expect(screen.queryByText(/^Ảnh \d+\/\d+$/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ảnh trước' })).not.toBeInTheDocument();
  });
});
