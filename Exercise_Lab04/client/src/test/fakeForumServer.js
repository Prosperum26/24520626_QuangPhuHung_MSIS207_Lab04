import { vi } from 'vitest';

const json = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

export const msg = (id, author, text, timestamp = '2026-11-01T08:00:00.000Z') => ({ id, author, text, timestamp });

/**
 * Server forum giả chạy trong bộ nhớ, thay cho `fetch` toàn cục (test only).
 * - state.fail: null | 'network' | số mã HTTP: mọi request đều thất bại như vậy.
 * - state.hold: true thì request treo cho tới khi gọi release(); bị abort thì reject AbortError như fetch thật.
 * @param {Record<string, ReturnType<typeof msg>[]>} initial
 */
export function installFakeForum(initial) {
  const data = structuredClone(initial);
  const state = { fail: null, hold: false };
  const pending = [];
  let nextId = 1;

  function respond(url, init) {
    const channel = decodeURIComponent(new URL(url).pathname.split('/')[3]);
    if (state.fail === 'network') throw new TypeError('Failed to fetch');
    if (typeof state.fail === 'number') return json({ error: 'fail' }, state.fail);
    if (!data[channel]) return json({ error: 'Unknown channel' }, 404);
    if (init.method === 'POST') {
      const created = { id: `new-${nextId++}`, ...JSON.parse(init.body), timestamp: '2026-11-13T09:00:00.000Z' };
      data[channel].push(created);
      return json(created, 201);
    }
    return json([...data[channel]]);
  }

  const fetchMock = vi.fn((url, init = {}) => {
    if (!state.hold) {
      try {
        return Promise.resolve(respond(url, init));
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return new Promise((resolve, reject) => {
      pending.push(() => {
        try {
          resolve(respond(url, init));
        } catch (error) {
          reject(error);
        }
      });
      init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    });
  });
  vi.stubGlobal('fetch', fetchMock);

  return {
    fetchMock,
    data,
    state,
    /** Cho các request đang treo chạy (theo thứ tự đã gọi). */
    release: () => pending.splice(0).forEach((run) => run()),
  };
}
