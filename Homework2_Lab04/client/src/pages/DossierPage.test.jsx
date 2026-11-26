import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { installFakeAppealServer } from '../test/fakeAppealServer.js';
import { App } from '../App.jsx';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

describe('DossierPage', () => {
  it('/dossier/himass: heading, ma trận dẫn xuất, nguồn', async () => {
    installFakeAppealServer();
    renderAt('/dossier/himass');
    expect(await screen.findByRole('heading', { level: 2, name: 'Himass' })).toBeInTheDocument();
    const table = screen.getByRole('table', { name: /Ma trận bất cân xứng/ });
    expect(within(table).getByText('Bất cân xứng')).toBeInTheDocument();
    expect(within(table).getByText('Giao hữu')).toBeInTheDocument();
    const source = screen.getByRole('link', { name: /Nguồn Himass/ });
    expect(source).toHaveAttribute('href', 'https://example.com/himass');
    expect(source).toHaveAttribute('target', '_blank');
    expect(source).toHaveAttribute('rel', 'noreferrer');
  });

  it('hiện đồng hồ SLA đếm theo hạn của server', async () => {
    installFakeAppealServer({ deadlineInMs: 2 * 3_600_000 });
    renderAt('/dossier/tanvuu');
    const timer = await screen.findByRole('timer', { name: 'Thời gian còn lại để kháng cáo' });
    expect(timer.textContent).toMatch(/^0[12]:\d\d:\d\d$/);
  });

  it('hạn đã qua thì báo hết hạn', async () => {
    installFakeAppealServer({ deadlineInMs: -1 });
    renderAt('/dossier/tanvuu');
    expect(await screen.findByText('Đã hết hạn kháng cáo')).toBeInTheDocument();
  });

  it('/dossier/HIMASS cũng mở được', async () => {
    installFakeAppealServer();
    renderAt('/dossier/HIMASS');
    expect(await screen.findByRole('heading', { level: 2, name: 'Himass' })).toBeInTheDocument();
  });

  it('/dossier/xyz: báo không tìm thấy trong vùng nội dung', async () => {
    installFakeAppealServer();
    renderAt('/dossier/xyz');
    expect(await screen.findByRole('heading', { name: 'Không tìm thấy hồ sơ' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('trang chủ có link tới hai hồ sơ', async () => {
    installFakeAppealServer();
    renderAt('/');
    expect(await screen.findByRole('link', { name: 'Himass' })).toHaveAttribute('href', '/dossier/himass');
    expect(screen.getByRole('link', { name: 'TanVuu' })).toHaveAttribute('href', '/dossier/tanvuu');
  });
});
