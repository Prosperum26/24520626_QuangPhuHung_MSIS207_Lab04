import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect } from 'vitest';
import { App } from './App.jsx';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

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

  it('/form và /forum có chỗ trống đến Sprint 2 và 3', () => {
    const { unmount } = renderAt('/form');
    expect(screen.getByRole('heading', { level: 2, name: /form/i })).toBeInTheDocument();
    unmount();
    renderAt('/forum');
    expect(screen.getByRole('heading', { level: 2, name: /forum/i })).toBeInTheDocument();
  });

  it('đường dẫn lạ hiện NotFound toàn trang', () => {
    renderAt('/xyz');
    expect(screen.getByRole('alert')).toHaveTextContent(/404/);
  });
});
