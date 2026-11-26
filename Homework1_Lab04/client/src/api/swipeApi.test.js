import { afterEach, describe, expect, it, vi } from 'vitest';
import { installFakeSwipeServer, profile } from '../test/fakeSwipeServer.js';
import { ApiError, createGame, deleteLastSwipe, fetchCurrentGame, fetchProfiles, postSwipe } from './swipeApi.js';

afterEach(() => vi.unstubAllGlobals());

const BASE = 'http://localhost:3002';
const PROFILES = [profile('p1', 'Linh'), profile('p2', 'Minh', 'male')];

describe('swipeApi', () => {
  it('fetchProfiles gọi GET /api/profiles, chuyển signal cho fetch', async () => {
    const server = installFakeSwipeServer({ profiles: PROFILES });
    const controller = new AbortController();
    await expect(fetchProfiles({ signal: controller.signal })).resolves.toEqual(PROFILES);
    const [url, init] = server.fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/api/profiles`);
    expect(init.signal).toBe(controller.signal);
  });

  it('fetchCurrentGame trả GameState', async () => {
    installFakeSwipeServer({ profiles: PROFILES, swipes: [{ profileId: 'p1', direction: 'right' }] });
    const state = await fetchCurrentGame();
    expect(state.game.id).toBe('g1');
    expect(state.swipes).toMatchObject([{ profileId: 'p1', direction: 'right' }]);
  });

  it('createGame gọi POST /api/games', async () => {
    const server = installFakeSwipeServer({ profiles: PROFILES });
    const state = await createGame();
    expect(state.swipes).toEqual([]);
    expect(server.calls()).toEqual(['POST /api/games']);
  });

  it('postSwipe gửi POST JSON đúng body và header', async () => {
    const server = installFakeSwipeServer({ profiles: PROFILES });
    const { game } = await createGame();
    const swipe = await postSwipe(game.id, { profileId: 'p2', direction: 'up' });
    expect(swipe).toMatchObject({ gameId: game.id, profileId: 'p2', direction: 'up' });
    const [url, init] = server.fetchMock.mock.calls[1];
    expect(url).toBe(`${BASE}/api/games/${game.id}/swipes`);
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual({ profileId: 'p2', direction: 'up' });
  });

  it('deleteLastSwipe gọi DELETE .../swipes/last và trả lượt vừa xoá', async () => {
    const server = installFakeSwipeServer({ profiles: PROFILES, swipes: [{ profileId: 'p1', direction: 'left' }] });
    await expect(deleteLastSwipe('g1')).resolves.toMatchObject({ profileId: 'p1' });
    expect(server.calls()).toEqual(['DELETE /api/games/g1/swipes/last']);
  });

  it('res.ok false thì ném ApiError có status và message từ { error }', async () => {
    installFakeSwipeServer({ profiles: PROFILES });
    const error = await deleteLastSwipe('khong-co').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.message).toBe('Game not found');
  });

  it('lỗi mạng được ném lại nguyên vẹn', async () => {
    const server = installFakeSwipeServer({ profiles: PROFILES });
    server.state.fail = 'network';
    await expect(fetchProfiles()).rejects.toThrow(TypeError);
  });
});
