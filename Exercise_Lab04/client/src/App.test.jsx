import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { installFakeForum, msg } from './test/fakeForumServer.js';
import { App } from './App.jsx';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('App routes', () => {
  it('có đúng một h1 ở mọi route', () => {
    renderAt('/form');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('/ chuyển hướng sang /people', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: 'People' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Albert Einstein' })).toBeInTheDocument();
  });

  it('/form hiện form "Thêm người"; /forum hiện trang Forum', async () => {
    installFakeForum({ nasa: [msg('n1', 'Neil', 'xin chao')], 'esports-tribunal': [], notNasa: [] });
    const { unmount } = renderAt('/form');
    expect(screen.getByRole('heading', { level: 2, name: /thêm người/i })).toBeInTheDocument();
    unmount();
    renderAt('/forum');
    expect(screen.getByRole('heading', { level: 2, name: /forum/i })).toBeInTheDocument();
    expect(await screen.findByText('xin chao')).toBeInTheDocument();
  });

  it('/people/sp-2 hiện chi tiết trong khung, danh sách vẫn còn', async () => {
    renderAt('/people/sp-2');
    // PersonDetail được tải lười (React.lazy) nên phải chờ.
    expect(await screen.findByRole('heading', { level: 2, name: 'Albert Einstein' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Albert Einstein' })).toHaveAttribute('aria-current', 'page');
  });

  it('/people/sp-999 hiện 404 trong vùng nội dung, danh sách vẫn còn', async () => {
    renderAt('/people/sp-999');
    expect(await screen.findByRole('alert')).toHaveTextContent(/404/);
    expect(screen.getByRole('link', { name: 'Albert Einstein' })).toBeInTheDocument();
  });

  it('đường dẫn lạ hiện NotFound toàn trang', () => {
    renderAt('/xyz');
    expect(screen.getByRole('alert')).toHaveTextContent(/404/);
  });
});
