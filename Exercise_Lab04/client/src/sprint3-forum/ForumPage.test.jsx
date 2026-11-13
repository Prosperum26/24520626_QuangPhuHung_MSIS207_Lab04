import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installFakeForum, msg } from '../test/fakeForumServer.js';
import ForumPage from './ForumPage.jsx';

const INITIAL = {
  nasa: [msg('n1', 'Katherine', 'Quỹ đạo đã tính lại'), msg('n2', 'Neil', 'Cửa sổ phóng đẹp')],
  'esports-tribunal': [msg('e1', 'Himass', 'Hồ sơ đã nộp')],
  notNasa: [],
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ForumPage: bố cục và tải', () => {
  it('có h2, ba nút kênh (nasa đang chọn) và vùng role="status" có sẵn từ đầu', async () => {
    installFakeForum(INITIAL);
    render(<ForumPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'Forum' })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: /kênh/i });
    const buttons = within(nav).getAllByRole('button');
    expect(buttons.map((b) => b.textContent)).toEqual(['nasa', 'esports-tribunal', 'notNasa']);
    expect(buttons.every((b) => b.getAttribute('type') === 'button')).toBe(true);
    expect(within(nav).getByRole('button', { name: 'nasa' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(nav).getByRole('button', { name: 'notNasa' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('status')).toBeInTheDocument();
    await screen.findByText('Quỹ đạo đã tính lại');
  });

  it('khi đang tải: skeleton aria-busy trong vùng status; xong thì hiện <dl> tin nhắn', async () => {
    const forum = installFakeForum(INITIAL);
    forum.state.hold = true;
    render(<ForumPage />);
    const status = screen.getByRole('status');
    expect(within(status).getByText(/đang tải tin nhắn/i).closest('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByRole('term')).not.toBeInTheDocument();

    await act(async () => forum.release());
    expect(await screen.findByText('Cửa sổ phóng đẹp')).toBeInTheDocument();
    expect(within(status).queryByText(/đang tải tin nhắn/i)).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBe(status);
  });

  it('tin nhắn là <dl>: dt có tác giả và <time dateTime>, dd là nội dung', async () => {
    installFakeForum(INITIAL);
    const { container } = render(<ForumPage />);
    await screen.findByText('Quỹ đạo đã tính lại');
    expect(container.querySelector('dl')).not.toBeNull();
    const terms = screen.getAllByRole('term');
    expect(terms[0]).toHaveTextContent('Katherine');
    expect(terms[0].querySelector('time')).toHaveAttribute('datetime', '2026-11-01T08:00:00.000Z');
    expect(screen.getAllByRole('definition').map((d) => d.textContent)).toEqual([
      'Quỹ đạo đã tính lại',
      'Cửa sổ phóng đẹp',
    ]);
  });

  it('nội dung có dạng HTML hiển thị như chữ, không tạo phần tử', async () => {
    installFakeForum({ nasa: [msg('x', 'Mallory', '<img src=x onerror=alert(1)>')], 'esports-tribunal': [], notNasa: [] });
    const { container } = render(<ForumPage />);
    await screen.findByText('<img src=x onerror=alert(1)>');
    expect(container.querySelector('img')).toBeNull();
  });

  it('kênh không có tin: hiện thông báo trống, không có <dl>', async () => {
    installFakeForum(INITIAL);
    const user = userEvent.setup();
    const { container } = render(<ForumPage />);
    await screen.findByText('Quỹ đạo đã tính lại');
    await user.click(screen.getByRole('button', { name: 'notNasa' }));
    expect(await screen.findByText(/chưa có tin nhắn/i)).toBeInTheDocument();
    expect(container.querySelector('dl')).toBeNull();
  });
});

describe('ForumPage: đổi kênh', () => {
  it('bấm kênh khác: aria-pressed đổi và hiện tin của kênh đó', async () => {
    installFakeForum(INITIAL);
    const user = userEvent.setup();
    render(<ForumPage />);
    await screen.findByText('Quỹ đạo đã tính lại');
    await user.click(screen.getByRole('button', { name: 'esports-tribunal' }));
    expect(screen.getByRole('button', { name: 'esports-tribunal' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'nasa' })).toHaveAttribute('aria-pressed', 'false');
    expect(await screen.findByText('Hồ sơ đã nộp')).toBeInTheDocument();
    expect(screen.queryByText('Quỹ đạo đã tính lại')).not.toBeInTheDocument();
  });

  it('đổi kênh liên tục khi request còn treo: request cũ bị huỷ, chỉ hiện kênh cuối', async () => {
    const forum = installFakeForum(INITIAL);
    forum.state.hold = true;
    const user = userEvent.setup();
    render(<ForumPage />);
    await user.click(screen.getByRole('button', { name: 'esports-tribunal' }));
    await user.click(screen.getByRole('button', { name: 'notNasa' }));
    const signals = forum.fetchMock.mock.calls.map(([, init]) => init.signal);
    expect(signals).toHaveLength(3);
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(true);
    expect(signals[2].aborted).toBe(false);

    await act(async () => forum.release());
    expect(await screen.findByText(/chưa có tin nhắn/i)).toBeInTheDocument();
    expect(screen.queryByText('Hồ sơ đã nộp')).not.toBeInTheDocument();
  });
});

describe('ForumPage: lỗi và thử lại', () => {
  it('server lỗi: role="alert" có nút Thử lại; sửa xong bấm thử lại thì hiện tin', async () => {
    const forum = installFakeForum(INITIAL);
    forum.state.fail = 500;
    const user = userEvent.setup();
    render(<ForumPage />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/không tải được/i);
    expect(alert).toHaveTextContent(/500/);

    forum.state.fail = null;
    await user.click(within(alert).getByRole('button', { name: /thử lại/i }));
    expect(await screen.findByText('Quỹ đạo đã tính lại')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('mất mạng cũng hiện lỗi, và không in lỗi chưa bắt ra console', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const forum = installFakeForum(INITIAL);
    forum.state.fail = 'network';
    render(<ForumPage />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(error).not.toHaveBeenCalled();
  });
});

describe('ForumPage: gửi tin', () => {
  it('gửi tin hợp lệ thì tin mới xuất hiện trong danh sách (POST rồi tải lại), tin cũ giữ nguyên', async () => {
    const forum = installFakeForum(INITIAL);
    const user = userEvent.setup();
    render(<ForumPage />);
    await screen.findByText('Quỹ đạo đã tính lại');

    await user.type(screen.getByLabelText('Tên'), 'Ada');
    await user.type(screen.getByLabelText('Nội dung'), 'Xin chào kênh nasa');
    await user.click(screen.getByRole('button', { name: /gửi tin nhắn/i }));

    expect(await screen.findByText('Xin chào kênh nasa')).toBeInTheDocument();
    expect(screen.getByText('Quỹ đạo đã tính lại')).toBeInTheDocument();
    const postCall = forum.fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(postCall[0]).toMatch(/\/api\/channels\/nasa\/messages$/);
    expect(JSON.parse(postCall[1].body)).toEqual({ author: 'Ada', text: 'Xin chào kênh nasa' });
    expect(screen.getByLabelText('Nội dung')).toHaveValue('');
  });

  it('gửi vào kênh đang chọn (không phải kênh mặc định)', async () => {
    const forum = installFakeForum(INITIAL);
    const user = userEvent.setup();
    render(<ForumPage />);
    await user.click(screen.getByRole('button', { name: 'esports-tribunal' }));
    await screen.findByText('Hồ sơ đã nộp');
    await user.type(screen.getByLabelText('Tên'), 'TanVuu');
    await user.type(screen.getByLabelText('Nội dung'), 'Đã đối chiếu log');
    await user.click(screen.getByRole('button', { name: /gửi tin nhắn/i }));
    expect(await screen.findByText('Đã đối chiếu log')).toBeInTheDocument();
    expect(forum.data['esports-tribunal']).toHaveLength(2);
    expect(forum.data.nasa).toHaveLength(2);
  });

  it('server từ chối khi gửi: hiện lỗi ngay trong form và giữ nội dung đã gõ', async () => {
    const forum = installFakeForum(INITIAL);
    const user = userEvent.setup();
    render(<ForumPage />);
    await screen.findByText('Quỹ đạo đã tính lại');
    forum.state.fail = 400;
    await user.type(screen.getByLabelText('Tên'), 'Ada');
    await user.type(screen.getByLabelText('Nội dung'), 'Hello');
    await user.click(screen.getByRole('button', { name: /gửi tin nhắn/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/không gửi được/i);
    expect(screen.getByLabelText('Nội dung')).toHaveValue('Hello');
    expect(screen.getByText('Quỹ đạo đã tính lại')).toBeInTheDocument();
  });
});
