import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { App } from './App.jsx';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

describe('App', () => {
  it('mỗi route có đúng một h1 và một main', async () => {
    for (const path of ['/', '/about', '/khong-co']) {
      const view = renderAt(path);
      await screen.findByRole('main');
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Photo & Evidence Gallery');
      expect(screen.getAllByRole('main')).toHaveLength(1);
      view.unmount();
    }
  });

  it('có skip link tới nội dung và ghi chú ảnh minh họa', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: 'Bỏ qua tới nội dung' })).toHaveAttribute('href', '#main');
    expect(screen.getByText('Mọi ảnh là ảnh minh họa tự sinh cho bài tập MSIS207, không phải bằng chứng thật.')).toBeInTheDocument();
  });

  it('/about hiện trang giới thiệu sau khi tải lazy', async () => {
    renderAt('/about');
    expect(await screen.findByRole('heading', { name: 'Giới thiệu' })).toBeInTheDocument();
  });

  it('đường dẫn lạ hiện 404 có link về thư viện ảnh', () => {
    renderAt('/khong-co');
    expect(screen.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về thư viện ảnh' })).toHaveAttribute('href', '/');
  });
});
