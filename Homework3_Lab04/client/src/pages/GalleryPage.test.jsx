import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import { describe, expect, it } from 'vitest';
import { PHOTOS } from '../data/photos.js';
import { App } from '../App.jsx';

// Nút Back giả lập nút Back của trình duyệt (MemoryRouter không có UI lịch sử).
function Probe() {
  const navigate = useNavigate();
  const { search } = useLocation();
  return (
    <>
      <span data-testid="search">{search}</span>
      <button type="button" onClick={() => navigate(-1)}>
        browser-back
      </button>
    </>
  );
}

function renderAt(url) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Probe />
      <App />
    </MemoryRouter>,
  );
}

const dialog = () => document.querySelector('dialog');
const gridLinks = () => within(screen.getByRole('list')).getAllByRole('link');
const search = () => screen.getByTestId('search').textContent;
const query = () => Object.fromEntries(new URLSearchParams(search()));
const photoById = (id) => PHOTOS.find((p) => p.id === id);

describe('GalleryPage', () => {
  it('vào / : 12 ảnh, Tất cả đang chọn, status báo số ảnh', () => {
    renderAt('/');
    expect(gridLinks()).toHaveLength(12);
    expect(screen.getByRole('link', { name: 'Tất cả' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Hiển thị 12 ảnh, danh mục Tất cả');
    expect(dialog()).not.toHaveAttribute('open');
  });

  it('?category=document : chỉ 4 ảnh p05-p08, link ảnh giữ category', () => {
    renderAt('/?category=document');
    const links = gridLinks();
    expect(links).toHaveLength(4);
    expect(links.map((l) => new URLSearchParams(l.getAttribute('href').split('?')[1]).get('photoId'))).toEqual(['p05', 'p06', 'p07', 'p08']);
    expect(links.every((l) => l.getAttribute('href').includes('category=document'))).toBe(true);
    expect(screen.getByRole('link', { name: 'Tài liệu' })).toHaveAttribute('aria-current', 'true');
  });

  it('R4: category lạ thì hiện tất cả, không lỗi', () => {
    renderAt('/?category=xyz');
    expect(gridLinks()).toHaveLength(12);
  });

  it('deep link ?category=document&photoId=p06 mở lightbox đúng ảnh, vị trí 2/4', () => {
    renderAt('/?category=document&photoId=p06');
    expect(dialog()).toHaveAttribute('open');
    expect(screen.getByRole('dialog', { name: photoById('p06').title })).toBeInTheDocument();
    expect(screen.getByRole('dialog').querySelector('[role="status"]')).toHaveTextContent('Ảnh 2/4');
  });

  it('bấm thumbnail mở lightbox và ghi cả category lẫn photoId vào URL', async () => {
    renderAt('/?category=scene');
    await userEvent.setup().click(screen.getByRole('link', { name: photoById('p02').title }));
    expect(dialog()).toHaveAttribute('open');
    expect(query()).toEqual({ category: 'scene', photoId: 'p02' });
  });

  it('R2: bấm Đóng chỉ xóa photoId, giữ category', async () => {
    renderAt('/?category=scene&photoId=p02');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Đóng' }));
    expect(query()).toEqual({ category: 'scene' });
    expect(dialog()).not.toHaveAttribute('open');
  });

  it('R2: Esc (dialog tự close) cũng giữ category', () => {
    renderAt('/?category=scene&photoId=p02');
    act(() => dialog().close());
    expect(query()).toEqual({ category: 'scene' });
  });

  it('R1: Back khi lightbox đang mở thì đóng lightbox, giữ danh mục', async () => {
    renderAt('/?category=scene');
    const user = userEvent.setup();
    await user.click(screen.getByRole('link', { name: photoById('p01').title }));
    expect(dialog()).toHaveAttribute('open');
    await user.click(screen.getByRole('button', { name: 'browser-back' }));
    expect(dialog()).not.toHaveAttribute('open');
    expect(query()).toEqual({ category: 'scene' });
  });

  it('chuyển ảnh bằng Ảnh sau dùng replace: Back về thẳng lưới', async () => {
    renderAt('/?category=scene');
    const user = userEvent.setup();
    await user.click(screen.getByRole('link', { name: photoById('p01').title }));
    await user.click(screen.getByRole('button', { name: 'Ảnh sau' }));
    expect(query().photoId).toBe('p02');
    await user.click(screen.getByRole('button', { name: 'browser-back' }));
    expect(query()).toEqual({ category: 'scene' });
    expect(dialog()).not.toHaveAttribute('open');
  });

  it('R3a: photoId không tồn tại thì không mở dialog, hiện thông báo và link xem toàn bộ', () => {
    renderAt('/?photoId=zz');
    expect(dialog()).not.toHaveAttribute('open');
    expect(screen.getByText('Không tìm thấy ảnh "zz".')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem toàn bộ ảnh' })).toHaveAttribute('href', '/');
  });

  it('R3b: photoId có thật nhưng thuộc danh mục khác thì vẫn mở, không có chuyển ảnh', () => {
    renderAt('/?category=scene&photoId=p06');
    expect(dialog()).toHaveAttribute('open');
    expect(screen.getByRole('dialog', { name: photoById('p06').title })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ảnh trước' })).not.toBeInTheDocument();
  });

  it('link lọc danh mục không chứa photoId', () => {
    renderAt('/?category=scene&photoId=p02');
    const nav = screen.getByRole('navigation', { name: 'Lọc theo danh mục' });
    for (const link of within(nav).getAllByRole('link')) expect(link.getAttribute('href')).not.toContain('photoId');
  });

  it('ảnh trong lưới: 4 ảnh đầu eager, ảnh đầu fetchpriority high, còn lại lazy, đủ width/height', () => {
    renderAt('/');
    const imgs = [...screen.getByRole('list').querySelectorAll('img')];
    expect(imgs).toHaveLength(12);
    expect(imgs.map((i) => i.getAttribute('loading'))).toEqual([...Array(4).fill('eager'), ...Array(8).fill('lazy')]);
    expect(imgs[0]).toHaveAttribute('fetchpriority', 'high');
    expect(imgs.every((i) => i.getAttribute('width') === '600' && i.getAttribute('height') === '400' && i.getAttribute('alt') === '')).toBe(true);
  });
});
