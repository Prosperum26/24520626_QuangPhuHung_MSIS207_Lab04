import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installFakeAppealServer } from '../test/fakeAppealServer.js';
import { useAppealSlaTimer } from './useAppealSlaTimer.js';

let visibility = 'visible';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
  vi.setSystemTime(Date.UTC(2026, 10, 26, 12, 0, 0));
  visibility = 'visible';
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });
});

afterEach(() => {
  vi.useRealTimers();
  delete document.visibilityState;
});

function setVisibility(value) {
  visibility = value;
  document.dispatchEvent(new Event('visibilitychange'));
}

const timeCalls = (server) => server.calls().filter((c) => c === 'GET /api/time').length;

// waitFor của RTL poll bằng setInterval (đang bị fake), nên tự poll bằng setTimeout thật.
async function until(check) {
  for (let i = 0; i < 100; i += 1) {
    try {
      check();
      return;
    } catch {
      await act(() => new Promise((resolve) => setTimeout(resolve, 5)));
    }
  }
  check();
}

describe('useAppealSlaTimer', () => {
  it('R1: đồng hồ máy chậm 10 phút thì vẫn đếm theo giờ server', async () => {
    const server = installFakeAppealServer({ serverOffsetMs: 600_000, deadlineInMs: 60_000 });
    const deadline = server.db.dossiers[0].appealDeadline;
    const { result } = renderHook(() => useAppealSlaTimer(deadline));
    // Chưa đồng bộ: tính theo giờ máy nên dư 10 phút.
    expect(result.current.synced).toBe(false);
    expect(result.current.remainingMs).toBeGreaterThan(600_000);

    await until(() => expect(result.current.synced).toBe(true));
    expect(Math.abs(result.current.remainingMs - 60_000)).toBeLessThanOrEqual(1_000);
  });

  it('review #3: đồng hồ máy nhanh hơn phần còn lại thì chưa sync không báo hết hạn', async () => {
    const server = installFakeAppealServer({ serverOffsetMs: -600_000, deadlineInMs: 60_000 });
    const deadline = server.db.dossiers[0].appealDeadline;
    const { result } = renderHook(() => useAppealSlaTimer(deadline));
    expect(result.current.synced).toBe(false);
    expect(result.current.expired).toBe(false);
    await until(() => expect(result.current.synced).toBe(true));
    expect(result.current.expired).toBe(false);
    expect(Math.abs(result.current.remainingMs - 60_000)).toBeLessThanOrEqual(1_000);
  });

  it('đếm xuống theo interval 200ms, tính lại từ mốc tuyệt đối', async () => {
    const server = installFakeAppealServer({ deadlineInMs: 10_000 });
    const deadline = server.db.dossiers[0].appealDeadline;
    const { result } = renderHook(() => useAppealSlaTimer(deadline));
    await until(() => expect(result.current.synced).toBe(true));
    act(() => vi.advanceTimersByTime(4_000));
    expect(Math.abs(result.current.remainingMs - 6_000)).toBeLessThanOrEqual(200);
  });

  it('R2: tab ẩn 30 giây (interval không chạy) thì khi hiện lại giảm đúng 30 giây và đồng bộ lại', async () => {
    const server = installFakeAppealServer({ deadlineInMs: 3_600_000 });
    const deadline = server.db.dossiers[0].appealDeadline;
    const { result } = renderHook(() => useAppealSlaTimer(deadline));
    await until(() => expect(result.current.synced).toBe(true));
    const before = result.current.remainingMs;
    const syncsBefore = timeCalls(server);

    act(() => setVisibility('hidden'));
    vi.setSystemTime(Date.now() + 30_000); // thời gian trôi nhưng không timer nào chạy
    act(() => setVisibility('visible'));

    expect(Math.abs(before - result.current.remainingMs - 30_000)).toBeLessThanOrEqual(200);
    await until(() => expect(timeCalls(server)).toBe(syncsBefore + 1));
  });

  it('qua hạn thì về 0 và expired', async () => {
    const server = installFakeAppealServer({ deadlineInMs: 1_000 });
    const deadline = server.db.dossiers[0].appealDeadline;
    const { result } = renderHook(() => useAppealSlaTimer(deadline));
    await until(() => expect(result.current.synced).toBe(true));
    expect(result.current.expired).toBe(false);
    act(() => vi.advanceTimersByTime(1_400));
    expect(result.current.remainingMs).toBe(0);
    expect(result.current.expired).toBe(true);
  });

  it('unmount thì dọn interval, listener và abort request đồng bộ đang treo', () => {
    const server = installFakeAppealServer();
    server.state.hold = true;
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useAppealSlaTimer(Date.now() + 60_000));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(server.requests[0].signal.aborted).toBe(true);
    removeSpy.mockRestore();
  });

  it('đồng bộ lỗi mạng thì vẫn đếm theo giờ máy, synced false, không throw', async () => {
    const server = installFakeAppealServer();
    server.state.fail = 'network';
    const deadline = Date.now() + 5_000;
    const { result } = renderHook(() => useAppealSlaTimer(deadline));
    await until(() => expect(server.calls()).toContain('GET /api/time'));
    act(() => vi.advanceTimersByTime(1_000));
    expect(result.current.synced).toBe(false);
    expect(Math.abs(result.current.remainingMs - 4_000)).toBeLessThanOrEqual(200);
  });
});
