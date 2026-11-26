import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { installFakeAppealServer } from '../test/fakeAppealServer.js';
import { useDossier } from './useDossier.js';

describe('useDossier', () => {
  it('tải được hồ sơ', async () => {
    installFakeAppealServer();
    const { result } = renderHook(() => useDossier('himass'));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.dossier.name).toBe('Himass');
  });

  it('id lạ thì not-found', async () => {
    installFakeAppealServer();
    const { result } = renderHook(() => useDossier('xyz'));
    await waitFor(() => expect(result.current.status).toBe('not-found'));
    expect(result.current.dossier).toBeNull();
  });

  it('server lỗi thì error; retry tải lại', async () => {
    const server = installFakeAppealServer();
    server.state.fail = 'network';
    const { result } = renderHook(() => useDossier('himass'));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatch(/Không kết nối được server/);
    server.state.fail = null;
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });

  it('R3: đổi hồ sơ khi request cũ còn treo thì abort request cũ, không hiện hồ sơ cũ', async () => {
    const server = installFakeAppealServer();
    server.state.hold = true;
    const seen = [];
    const { result, rerender } = renderHook(
      ({ id }) => {
        const value = useDossier(id);
        seen.push([id, value.dossier?.id ?? null]);
        return value;
      },
      { initialProps: { id: 'himass' } },
    );
    rerender({ id: 'tanvuu' });
    expect(server.requests[0].signal.aborted).toBe(true);
    server.release();
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.dossier.id).toBe('tanvuu');
    expect(seen.every(([id, shown]) => shown === null || shown === id)).toBe(true);
  });

  it('setAppeal gắn đơn vào hồ sơ đang xem', async () => {
    installFakeAppealServer();
    const { result } = renderHook(() => useDossier('himass'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    act(() => result.current.setAppeal({ id: 'a1', submittedAt: 1 }));
    expect(result.current.dossier.appeal).toEqual({ id: 'a1', submittedAt: 1 });
  });
});
