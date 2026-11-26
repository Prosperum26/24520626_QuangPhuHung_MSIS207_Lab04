import { vi } from 'vitest';

const json = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

export const profile = (id, name, gender = 'female', age = 21) => ({ id, name, age, gender, bio: `Bio ${name}` });

/**
 * Server Swipe Deck giả trong bộ nhớ, thay cho `fetch` toàn cục (test only).
 * Theo shared/swipe-api-contract.md: ván dở = game cuối mảng; trùng → 409; hết lượt → 404.
 * - state.fail: null | 'network' | số mã HTTP: mọi request thất bại như vậy.
 * - state.hold: true thì request treo tới khi gọi release(); abort thì reject AbortError như fetch thật.
 * @param {{ profiles: object[], swipes?: { profileId: string, direction: string }[] }} initial
 *   swipes: lượt quẹt sẵn có của một ván dở được tạo sẵn.
 */
export function installFakeSwipeServer({ profiles, swipes = [] }) {
  let nextId = 1;
  const newId = (prefix) => `${prefix}${nextId++}`;
  const db = { profiles: structuredClone(profiles), games: [], swipes: [] };
  const state = { fail: null, hold: false };
  const pending = [];

  const createGame = () => {
    const game = { id: newId('g'), createdAt: '2026-11-26T08:00:00.000Z' };
    db.games.push(game);
    return game;
  };
  const gameState = (game) => ({ game, swipes: db.swipes.filter((s) => s.gameId === game.id) });

  if (swipes.length > 0) {
    const game = createGame();
    for (const s of swipes) db.swipes.push({ id: newId('s'), gameId: game.id, ...s, createdAt: '2026-11-26T08:00:01.000Z' });
  }

  function respond(url, init) {
    if (state.fail === 'network') throw new TypeError('Failed to fetch');
    if (typeof state.fail === 'number') return json({ error: 'fail' }, state.fail);

    const method = init.method ?? 'GET';
    const parts = new URL(url).pathname.split('/').filter(Boolean); // ['api', ...]
    const route = `${method} /${parts.slice(1).join('/')}`;

    if (route === 'GET /profiles') return json(structuredClone(db.profiles));
    if (route === 'GET /games/current') return json(gameState(db.games.at(-1) ?? createGame()));
    if (route === 'POST /games') return json(gameState(createGame()), 201);

    const [, resource, gameId, sub, last] = parts;
    if (resource === 'games' && sub === 'swipes') {
      const game = db.games.find((g) => g.id === gameId);
      if (!game) return json({ error: 'Game not found' }, 404);
      if (method === 'POST' && last === undefined) {
        const { profileId, direction } = JSON.parse(init.body);
        if (db.swipes.some((s) => s.gameId === gameId && s.profileId === profileId)) {
          return json({ error: 'Profile already swiped in this game' }, 409);
        }
        const created = { id: newId('s'), gameId, profileId, direction, createdAt: '2026-11-26T08:00:02.000Z' };
        db.swipes.push(created);
        return json(created, 201);
      }
      if (method === 'DELETE' && last === 'last') {
        const index = db.swipes.findLastIndex((s) => s.gameId === gameId);
        if (index === -1) return json({ error: 'No swipe to undo' }, 404);
        return json(db.swipes.splice(index, 1)[0]);
      }
    }
    return json({ error: 'Not found' }, 404);
  }

  const run = (url, init) => {
    try {
      return Promise.resolve(respond(url, init));
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const fetchMock = vi.fn((url, init = {}) => {
    if (!state.hold) return run(url, init);
    return new Promise((resolve, reject) => {
      pending.push(() => run(url, init).then(resolve, reject));
      init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    });
  });
  vi.stubGlobal('fetch', fetchMock);

  /** "METHOD /path" của các request đã gửi, theo thứ tự. */
  const calls = () => fetchMock.mock.calls.map(([url, init = {}]) => `${init.method ?? 'GET'} ${new URL(url).pathname}`);

  return {
    fetchMock,
    db,
    state,
    calls,
    /** Cho các request đang treo chạy (theo thứ tự đã gọi). */
    release: () => pending.splice(0).forEach((go) => go()),
  };
}
