import { StrictMode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useForumMessages } from './useForumMessages.js';

const msg = (id, text = id) => ({ id, author: 'a', text, timestamp: '2026-11-01T00:00:00.000Z' });
const json = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

/** fetch giả có thể điều khiển: mỗi lời gọi trả một promise do test tự resolve/reject. */
function controllableFetch({ rejectOnAbort = true } = {}) {
  const calls = [];
  const fetchMock = vi.fn((url, init = {}) => {
    const call = { url, init, signal: init.signal };
    call.promise = new Promise((resolve, reject) => {
      call.resolve = resolve;
      call.reject = reject;
      if (rejectOnAbort && init.signal) {
        init.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      }
    });
    calls.push(call);
    return call.promise;
  });
  vi.stubGlobal('fetch', fetchMock);
  return { calls, fetchMock };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useForumMessages: tải', () => {
  it('bắt đầu ở loading, gọi đúng URL kênh kèm signal, rồi success', async () => {
    const { calls } = controllableFetch();
    const { result } = renderHook(() => useForumMessages('nasa'));
    expect(result.current.status).toBe('loading');
    expect(result.current.messages).toEqual([]);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toMatch(/\/api\/channels\/nasa\/messages$/);
    expect(calls[0].signal).toBeInstanceOf(AbortSignal);

    await act(async () => calls[0].resolve(json([msg('1'), msg('2')])));
    expect(result.current.status).toBe('success');
    expect(result.current.messages.map((m) => m.id)).toEqual(['1', '2']);
    expect(result.current.error).toBeNull();
  });

  it('mã HTTP không ok (500) là lỗi, không đọc JSON như dữ liệu', async () => {
    const { calls } = controllableFetch();
    const { result } = renderHook(() => useForumMessages('nasa'));
    await act(async () => calls[0].resolve(json({ error: 'boom' }, 500)));
    expect(result.current.status).toBe('error');
    expect(result.current.error.message).toMatch(/500/);
    expect(result.current.messages).toEqual([]);
  });

  it('lỗi mạng (fetch reject) là lỗi', async () => {
    const { calls } = controllableFetch();
    const { result } = renderHook(() => useForumMessages('nasa'));
    await act(async () => calls[0].reject(new TypeError('Failed to fetch')));
    expect(result.current.status).toBe('error');
    expect(result.current.error.message).toMatch(/failed to fetch/i);
  });

  it('tên kênh được mã hoá trong URL', () => {
    const { calls } = controllableFetch();
    renderHook(() => useForumMessages('a b/c'));
    expect(calls[0].url).toMatch(/\/api\/channels\/a%20b%2Fc\/messages$/);
  });
});

describe('useForumMessages: đổi kênh nhanh (race condition)', () => {
  it('đổi kênh: lập tức loading, không hiện tin của kênh cũ', async () => {
    const { calls } = controllableFetch();
    const { result, rerender } = renderHook(({ channel }) => useForumMessages(channel), {
      initialProps: { channel: 'nasa' },
    });
    await act(async () => calls[0].resolve(json([msg('n1')])));
    expect(result.current.messages).toHaveLength(1);

    rerender({ channel: 'notNasa' });
    expect(result.current.status).toBe('loading');
    expect(result.current.messages).toEqual([]);
    expect(calls[1].url).toMatch(/\/notNasa\//);
  });

  it('request cũ bị abort khi đổi kênh', () => {
    const { calls } = controllableFetch();
    const { rerender } = renderHook(({ channel }) => useForumMessages(channel), { initialProps: { channel: 'nasa' } });
    expect(calls[0].signal.aborted).toBe(false);
    rerender({ channel: 'notNasa' });
    expect(calls[0].signal.aborted).toBe(true);
    expect(calls[1].signal.aborted).toBe(false);
  });

  it('A trả về muộn sau B thì không ghi đè B (guard signal.aborted, dù fetch không tự reject)', async () => {
    const { calls } = controllableFetch({ rejectOnAbort: false });
    const { result, rerender } = renderHook(({ channel }) => useForumMessages(channel), {
      initialProps: { channel: 'nasa' },
    });
    rerender({ channel: 'notNasa' });
    await act(async () => calls[1].resolve(json([msg('B')])));
    expect(result.current.messages.map((m) => m.id)).toEqual(['B']);

    await act(async () => calls[0].resolve(json([msg('A')])));
    expect(result.current.messages.map((m) => m.id)).toEqual(['B']);
    expect(result.current.status).toBe('success');
  });

  it('AbortError của request cũ không bị coi là lỗi của kênh mới', async () => {
    const { calls } = controllableFetch();
    const { result, rerender } = renderHook(({ channel }) => useForumMessages(channel), {
      initialProps: { channel: 'nasa' },
    });
    rerender({ channel: 'notNasa' });
    // request đầu đã bị abort và reject AbortError; kênh mới vẫn đang loading, không error.
    await act(async () => {});
    expect(result.current.status).toBe('loading');
    expect(result.current.error).toBeNull();
    await act(async () => calls[1].resolve(json([msg('B')])));
    expect(result.current.status).toBe('success');
  });

  it('không cập nhật state và không log lỗi sau khi unmount', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { calls } = controllableFetch({ rejectOnAbort: false });
    const { unmount } = renderHook(() => useForumMessages('nasa'));
    unmount();
    expect(calls[0].signal.aborted).toBe(true);
    await act(async () => calls[0].resolve(json([msg('late')])));
    expect(error).not.toHaveBeenCalled();
  });

  it('chạy đúng trong StrictMode (effect chạy hai lần)', async () => {
    const { calls } = controllableFetch();
    const { result } = renderHook(() => useForumMessages('nasa'), { wrapper: StrictMode });
    // StrictMode gọi effect hai lần: lần đầu bị abort, lần hai là request thật.
    const live = calls.filter((c) => !c.signal.aborted);
    expect(live).toHaveLength(1);
    await act(async () => live[0].resolve(json([msg('1')])));
    expect(result.current.status).toBe('success');
    expect(result.current.error).toBeNull();
  });
});

describe('useForumMessages: retry và postMessage', () => {
  it('retry sau lỗi: về loading rồi success', async () => {
    const { calls } = controllableFetch();
    const { result } = renderHook(() => useForumMessages('nasa'));
    await act(async () => calls[0].resolve(json({}, 500)));
    expect(result.current.status).toBe('error');

    act(() => result.current.retry());
    expect(result.current.status).toBe('loading');
    expect(calls).toHaveLength(2);
    await act(async () => calls[1].resolve(json([msg('1')])));
    expect(result.current.status).toBe('success');
  });

  it('postMessage gửi POST JSON rồi tải lại danh sách, giữ tin cũ trong lúc tải lại', async () => {
    const { calls } = controllableFetch();
    const { result } = renderHook(() => useForumMessages('nasa'));
    await act(async () => calls[0].resolve(json([msg('1')])));

    let posting;
    act(() => {
      posting = result.current.postMessage({ author: 'Ada', text: 'Hello' });
    });
    expect(calls[1].init.method).toBe('POST');
    expect(calls[1].url).toMatch(/\/api\/channels\/nasa\/messages$/);
    expect(JSON.parse(calls[1].init.body)).toEqual({ author: 'Ada', text: 'Hello' });
    expect(calls[1].init.headers['Content-Type']).toBe('application/json');

    await act(async () => {
      calls[1].resolve(json(msg('2'), 201));
      await posting;
    });
    // đã kích hoạt tải lại; tin cũ vẫn hiện, không nhảy về loading
    expect(calls).toHaveLength(3);
    expect(calls[2].init.method).toBeUndefined();
    expect(result.current.status).toBe('success');
    expect(result.current.messages.map((m) => m.id)).toEqual(['1']);

    await act(async () => calls[2].resolve(json([msg('1'), msg('2')])));
    expect(result.current.messages.map((m) => m.id)).toEqual(['1', '2']);
  });

  it('postMessage bị server từ chối (400) thì ném lỗi với thông điệp của server và không tải lại', async () => {
    const { calls } = controllableFetch();
    const { result } = renderHook(() => useForumMessages('nasa'));
    await act(async () => calls[0].resolve(json([])));

    let outcome;
    await act(async () => {
      const posting = result.current.postMessage({ author: '', text: 'x' });
      calls[1].resolve(json({ error: 'author is required' }, 400));
      outcome = await posting.then(
        () => 'ok',
        (err) => err,
      );
    });
    expect(outcome).toBeInstanceOf(Error);
    expect(outcome.message).toBe('author is required');
    await waitFor(() => expect(calls).toHaveLength(2));
  });
});
