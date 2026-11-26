import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { installFakeAppealServer } from '../test/fakeAppealServer.js';
import { App } from '../App.jsx';
import { AppealForm } from './AppealForm.jsx';
import { useAppealForm } from './AppealFormContext.js';

const STATEMENT = 'Giải trình: '.padEnd(120, 'x');
const posts = (server) => server.calls().filter((c) => c.startsWith('POST'));

function setup(props = {}, serverOptions = {}) {
  const server = installFakeAppealServer(serverOptions);
  const user = userEvent.setup();
  const onSubmitted = vi.fn();
  render(<AppealForm playerId="himass" disabled={false} onSubmitted={onSubmitted} {...props} />);
  return { server, user, onSubmitted };
}

async function fillValid(user) {
  await user.type(screen.getByLabelText('Email liên hệ'), 'a@b.vn');
  await user.click(screen.getByRole('checkbox', { name: /giải giao hữu/ }));
  await user.type(screen.getByLabelText('Bản giải trình'), STATEMENT);
  await user.click(screen.getByRole('checkbox', { name: /Tôi xác nhận/ }));
}

const submitButton = () => screen.getByRole('button', { name: 'Nộp đơn kháng cáo' });

describe('AppealForm', () => {
  it('useAppealForm ngoài Provider thì ném lỗi dễ hiểu', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAppealForm())).toThrow('useAppealForm must be used inside AppealFormProvider');
    vi.restoreAllMocks();
  });

  it('validate real-time: lỗi hiện sau khi rời ô, mất ngay khi sửa đúng', async () => {
    const { user } = setup();
    const email = screen.getByLabelText('Email liên hệ');
    await user.type(email, 'a@b');
    expect(screen.queryByText('Email chưa đúng định dạng')).not.toBeInTheDocument();
    await user.tab();
    expect(screen.getByText('Email chưa đúng định dạng')).toBeInTheDocument();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Email chưa đúng định dạng');
    await user.type(email, '.vn');
    expect(screen.queryByText('Email chưa đúng định dạng')).not.toBeInTheDocument();
    expect(email).toHaveAttribute('aria-invalid', 'false');
  });

  it('ô chưa chạm thì không hiện lỗi; bộ đếm ký tự cập nhật khi gõ', async () => {
    const { user } = setup();
    expect(screen.queryByText('Bản giải trình là bắt buộc')).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Bản giải trình'), 'abc');
    expect(screen.getByText('3/2000 ký tự')).toBeInTheDocument();
  });

  it('bấm Nộp khi trống: hiện mọi lỗi, focus ô lỗi đầu, không gửi request', async () => {
    const { user, server } = setup();
    await user.click(submitButton());
    expect(screen.getByText('Email là bắt buộc')).toBeInTheDocument();
    expect(screen.getByText('Chọn ít nhất một căn cứ')).toBeInTheDocument();
    expect(screen.getByText('Bản giải trình là bắt buộc')).toBeInTheDocument();
    expect(screen.getByText('Cần xác nhận thông tin là đúng sự thật')).toBeInTheDocument();
    expect(screen.getByLabelText('Email liên hệ')).toHaveFocus();
    expect(posts(server)).toEqual([]);
  });

  it('lỗi đầu là nhóm căn cứ thì focus checkbox đầu tiên', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText('Email liên hệ'), 'a@b.vn');
    await user.click(submitButton());
    expect(screen.getByRole('checkbox', { name: /giải giao hữu/ })).toHaveFocus();
  });

  it('R5: điền đúng, bấm Nộp hai lần liền thì chỉ một POST', async () => {
    const { user, server, onSubmitted } = setup();
    await fillValid(user);
    server.state.hold = true;
    await user.click(submitButton());
    expect(submitButton()).toBeDisabled();
    await user.click(submitButton());
    server.release();
    await waitFor(() => expect(onSubmitted).toHaveBeenCalledTimes(1));
    expect(posts(server)).toEqual(['POST /api/dossiers/himass/appeals']);
    expect(onSubmitted.mock.calls[0][0]).toMatchObject({ email: 'a@b.vn', grounds: ['friendly-match'], playerId: 'himass' });
  });

  it('R4: disabled (hết hạn) thì không nộp được', () => {
    setup({ disabled: true });
    expect(submitButton()).toBeDisabled();
    expect(screen.getByLabelText('Email liên hệ')).toBeDisabled();
  });

  it('R4: server báo hết hạn (409) thì hiện alert', async () => {
    const { user, onSubmitted } = setup({}, { deadlineInMs: -1 });
    await fillValid(user);
    await user.click(submitButton());
    expect(await screen.findByRole('alert')).toHaveTextContent('Appeal window closed');
    expect(onSubmitted).not.toHaveBeenCalled();
  });

  it('server trả lỗi field (400) thì hiện dưới đúng ô, sửa ô thì lỗi đó mất', async () => {
    const { user, server } = setup();
    await fillValid(user);
    server.db.dossiers[0].appealDeadline = Date.now() + 3_600_000;
    // Ép server từ chối email dù client thấy hợp lệ.
    const realFetch = globalThis.fetch;
    vi.stubGlobal('fetch', vi.fn(async (url, init) => {
      if (init?.method === 'POST') {
        return new Response(JSON.stringify({ error: 'Validation failed', fields: { email: 'Email bị server từ chối' } }), { status: 400 });
      }
      return realFetch(url, init);
    }));
    await user.click(submitButton());
    expect(await screen.findByText('Email bị server từ chối')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Email liên hệ'), 'x');
    expect(screen.queryByText('Email bị server từ chối')).not.toBeInTheDocument();
  });

  it('mất mạng khi nộp thì báo lỗi và cho nộp lại', async () => {
    const { user, server, onSubmitted } = setup();
    await fillValid(user);
    server.state.fail = 'network';
    await user.click(submitButton());
    expect(await screen.findByRole('alert')).toHaveTextContent('Không kết nối được server');
    server.state.fail = null;
    await user.click(submitButton());
    await waitFor(() => expect(onSubmitted).toHaveBeenCalledTimes(1));
  });
});

describe('DossierPage + form', () => {
  const renderAt = (path) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );

  it('R5: nộp xong thì hiện biên nhận; mở lại trang vẫn thấy biên nhận', async () => {
    const server = installFakeAppealServer();
    const user = userEvent.setup();
    const view = renderAt('/dossier/himass');
    await screen.findByRole('heading', { level: 2, name: 'Himass' });
    await fillValid(user);
    await user.click(submitButton());
    expect(await screen.findByRole('heading', { name: 'Đã nộp đơn' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nộp đơn kháng cáo' })).not.toBeInTheDocument();
    expect(server.db.dossiers[0].appeal).not.toBeNull();

    view.unmount();
    renderAt('/dossier/himass');
    expect(await screen.findByRole('heading', { name: 'Đã nộp đơn' })).toBeInTheDocument();
    expect(screen.getByText('a@b.vn')).toBeInTheDocument();
  });

  it('review #1: POST về muộn sau khi đã sang hồ sơ khác thì không gắn đơn vào hồ sơ mới', async () => {
    const server = installFakeAppealServer();
    const user = userEvent.setup();
    // Chuyển thẳng hồ sơ → hồ sơ (như Back/Forward hay sửa URL): DossierPage không bị unmount.
    let navigate;
    function GrabNavigate() {
      navigate = useNavigate();
      return null;
    }
    render(
      <MemoryRouter initialEntries={['/dossier/himass']}>
        <GrabNavigate />
        <App />
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { level: 2, name: 'Himass' });
    await fillValid(user);
    server.state.holdPost = true;
    await user.click(submitButton());
    act(() => navigate('/dossier/tanvuu'));
    await screen.findByRole('heading', { level: 2, name: 'TanVuu' });
    server.releasePosts();
    await waitFor(() => expect(server.db.dossiers[0].appeal).not.toBeNull());
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByRole('heading', { name: 'Đã nộp đơn' })).not.toBeInTheDocument();
    expect(submitButton()).toBeEnabled();
  });

  it('review #2: tab khác đã nộp (409 already) thì tải lại hồ sơ và hiện biên nhận', async () => {
    const server = installFakeAppealServer();
    const user = userEvent.setup();
    renderAt('/dossier/himass');
    await screen.findByRole('heading', { level: 2, name: 'Himass' });
    await fillValid(user);
    server.db.dossiers[0].appeal = { id: 'a-other', playerId: 'himass', submittedAt: Date.now(), email: 'tab@khac.vn', grounds: ['disproportionate'], statement: 'x', evidenceUrl: '', confirm: true };
    await user.click(submitButton());
    expect(await screen.findByRole('heading', { name: 'Đã nộp đơn' })).toBeInTheDocument();
    expect(screen.getByText('tab@khac.vn')).toBeInTheDocument();
  });

  it('hồ sơ đã hết hạn thì form bị khoá', async () => {
    installFakeAppealServer({ deadlineInMs: -1 });
    renderAt('/dossier/tanvuu');
    await screen.findByText('Đã hết hạn kháng cáo');
    expect(submitButton()).toBeDisabled();
  });
});
