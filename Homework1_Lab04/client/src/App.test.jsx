import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installFakeSwipeServer, profile } from './test/fakeSwipeServer.js';
import { App } from './App.jsx';

afterEach(() => vi.unstubAllGlobals());

const PROFILES = [profile('p1', 'Linh'), profile('p2', 'Minh', 'male'), profile('p3', 'Trang')];

/** Tên truy cập của thẻ hiện tại (lấy từ heading qua aria-labelledby). */
const cardName = () => screen.getByRole('article').querySelector('h2').textContent;
const stat = (term) => screen.getByText(term, { selector: 'dt' }).nextElementSibling.textContent;

async function setup(options = {}) {
  const server = installFakeSwipeServer({ profiles: PROFILES, ...options });
  const user = userEvent.setup();
  const view = render(<App />);
  await screen.findByRole('article');
  return { server, user, ...view };
}

describe('App', () => {
  it('có đúng một h1 "Hẹn Hò Nhưng Không Yêu"', async () => {
    await setup();
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Hẹn Hò Nhưng Không Yêu');
  });

  it('đang tải thì báo trong vùng status', () => {
    const server = installFakeSwipeServer({ profiles: PROFILES });
    server.state.hold = true;
    render(<App />);
    expect(screen.getByRole('status')).toHaveTextContent('Đang tải');
  });

  it('bấm Thích: sang hồ sơ kế, điểm 10, status báo kết quả', async () => {
    const { user } = await setup();
    expect(cardName()).toBe('Linh, 21');
    expect(stat('Còn lại')).toBe('3/3');
    await user.click(screen.getByRole('button', { name: 'Thích' }));
    expect(cardName()).toBe('Minh, 21');
    expect(stat('Điểm')).toBe('10');
    expect(stat('Còn lại')).toBe('2/3');
    expect(screen.getByRole('status')).toHaveTextContent('Đã thích Linh. Điểm 10.');
  });

  it('phím ← rồi Backspace: bỏ qua rồi hoàn tác về đúng thẻ', async () => {
    const { user } = await setup();
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowLeft}');
    expect(cardName()).toBe('Trang, 21');
    expect(stat('Điểm')).toBe('5');
    await user.keyboard('{Backspace}');
    expect(cardName()).toBe('Minh, 21');
    expect(stat('Điểm')).toBe('10');
    expect(screen.getByRole('status')).toHaveTextContent('Đã hoàn tác. Điểm 10.');
  });

  it('quẹt hết thì hiện tổng kết; Chơi ván mới về hồ sơ đầu, điểm 0', async () => {
    const { user, server } = await setup();
    await user.keyboard('{ArrowRight}{ArrowUp}{ArrowLeft}');
    expect(screen.getByRole('heading', { name: 'Hết hồ sơ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thích' })).toBeDisabled();
    await waitFor(() => expect(server.db.swipes).toHaveLength(3));

    await user.click(screen.getByRole('button', { name: 'Chơi ván mới' }));
    await screen.findByRole('article');
    expect(cardName()).toBe('Linh, 21');
    expect(stat('Điểm')).toBe('0');
    expect(screen.getByRole('status')).toHaveTextContent('Ván mới bắt đầu.');
  });

  it('mở lại app (F5) thì quẹt tiếp đúng chỗ và đúng điểm', async () => {
    const { user, server, unmount } = await setup();
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(server.db.swipes).toHaveLength(1));
    unmount();

    render(<App />);
    await screen.findByRole('article');
    expect(cardName()).toBe('Minh, 21');
    expect(stat('Điểm')).toBe('20');
    expect(screen.getByRole('button', { name: 'Hoàn tác' })).toBeEnabled();
  });

  it('R5: server lỗi thì hiện alert, giữ thẻ; Thử lại khi server sống thì chơi tiếp', async () => {
    const { user, server } = await setup();
    server.state.fail = 'network';
    await user.click(screen.getByRole('button', { name: 'Thích' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Không kết nối được server');
    expect(screen.getByRole('article')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Thích' })).toBeDisabled());

    server.state.fail = null;
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(cardName()).toBe('Linh, 21');
    await user.click(screen.getByRole('button', { name: 'Thích' }));
    await waitFor(() => expect(server.db.swipes).toHaveLength(1));
  });

  it('tải lần đầu lỗi thì hiện alert + Thử lại; bấm thì tải lại được', async () => {
    const server = installFakeSwipeServer({ profiles: PROFILES });
    server.state.fail = 500;
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Không tải được dữ liệu');
    server.state.fail = null;
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('article')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
