import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { installFakeAppealServer } from './test/fakeAppealServer.js';
import { App } from './App.jsx';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

describe('App', () => {
  it('có đúng một h1 và ghi chú mô phỏng', async () => {
    installFakeAppealServer();
    renderAt('/');
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Esports Fair-Play Appeal Tribunal');
    expect(screen.getByText('Mô phỏng phục vụ bài tập MSIS207, không phải cổng chính thức của KRAFTON.')).toBeInTheDocument();
    await screen.findByRole('link', { name: /Himass/ });
  });

  it('đường dẫn lạ thì hiện trang 404 có link về trang chủ', () => {
    renderAt('/khong-co');
    expect(screen.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về danh sách hồ sơ' })).toHaveAttribute('href', '/');
  });
});
