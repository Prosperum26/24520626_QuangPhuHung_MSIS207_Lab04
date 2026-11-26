import { StrictMode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installFakeSwipeServer, profile } from '../test/fakeSwipeServer.js';
import { useSwipeGame } from './useSwipeGame.js';

afterEach(() => vi.unstubAllGlobals());

const PROFILES = [profile('p1', 'Linh'), profile('p2', 'Minh', 'male'), profile('p3', 'Trang')];
const writes = (server) => server.calls().filter((call) => !call.startsWith('GET'));

async function setup(options = {}, renderOptions) {
  const server = installFakeSwipeServer({ profiles: PROFILES, ...options });
  const hook = renderHook(() => useSwipeGame(), renderOptions);
  await waitFor(() => expect(hook.result.current.status).toBe('ready'));
  return { server, ...hook };
}

// Mỗi thao tác một act riêng: giống người dùng thật, giữa hai lần bấm luôn có một lần render.
const swipe = (result, direction) => act(() => result.current.swipe(direction));
const undo = (result) => act(() => result.current.undo());

describe('useSwipeGame: tải', () => {
  it('ván mới: đủ thẻ, điểm 0, thẻ hiện tại là hồ sơ đầu', async () => {
    const { result } = await setup();
    expect(result.current.deck).toHaveLength(3);
    expect(result.current.current.id).toBe('p1');
    expect(result.current.score).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('quẹt tiếp ván dở: dựng lại history, điểm và thẻ còn lại từ server', async () => {
    const { result } = await setup({ swipes: [{ profileId: 'p1', direction: 'right' }] });
    expect(result.current.history).toHaveLength(1);
    expect(result.current.score).toBe(10);
    expect(result.current.deck.map((p) => p.id)).toEqual(['p2', 'p3']);
    expect(result.current.current.id).toBe('p2');
  });

  it('chạy được dưới StrictMode (effect chạy hai lần)', async () => {
    const { result } = await setup({}, { wrapper: StrictMode });
    expect(result.current.deck).toHaveLength(3);
  });

  it('tải lỗi thì status error; retry tải lại thành công', async () => {
    const server = installFakeSwipeServer({ profiles: PROFILES });
    server.state.fail = 500;
    const { result } = renderHook(() => useSwipeGame());
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatch(/Không tải được/);

    server.state.fail = null;
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.error).toBeNull();
  });

  it('unmount khi đang tải không gây lỗi', async () => {
    const server = installFakeSwipeServer({ profiles: PROFILES });
    server.state.hold = true;
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = renderHook(() => useSwipeGame());
    unmount();
    server.state.hold = false;
    server.release();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('useSwipeGame: quẹt và hoàn tác', () => {
  it('quẹt cập nhật ngay (lạc quan) và ghi lên server', async () => {
    const { result, server } = await setup();
    await swipe(result, 'right');
    expect(result.current.score).toBe(10);
    expect(result.current.current.id).toBe('p2');
    expect(result.current.lastEvent).toEqual({ type: 'swipe', profileId: 'p1', direction: 'right' });
    await waitFor(() => expect(server.db.swipes).toHaveLength(1));
    expect(server.db.swipes[0]).toMatchObject({ profileId: 'p1', direction: 'right' });
  });

  it('hoàn tác LIFO hai lần trả về trạng thái đầu, request theo đúng thứ tự', async () => {
    const { result, server } = await setup();
    await swipe(result, 'right');
    await swipe(result, 'left');
    await undo(result);
    expect(result.current.current.id).toBe('p2');
    expect(result.current.lastEvent).toEqual({ type: 'undo' });
    await undo(result);
    expect(result.current.history).toEqual([]);
    expect(result.current.score).toBe(0);
    await waitFor(() => expect(writes(server)).toHaveLength(4));
    expect(writes(server)).toEqual([
      'POST /api/games/g1/swipes',
      'POST /api/games/g1/swipes',
      'DELETE /api/games/g1/swipes/last',
      'DELETE /api/games/g1/swipes/last',
    ]);
    expect(server.db.swipes).toEqual([]);
  });

  it('R1: hoàn tác khi POST còn treo thì DELETE chỉ gửi sau khi POST xong', async () => {
    const { result, server } = await setup();
    server.state.hold = true;
    await swipe(result, 'right');
    await undo(result);
    await waitFor(() => expect(writes(server)).toHaveLength(1));
    expect(writes(server)).toEqual(['POST /api/games/g1/swipes']);

    server.state.hold = false;
    server.release();
    await waitFor(() => expect(writes(server)).toHaveLength(2));
    expect(writes(server)[1]).toBe('DELETE /api/games/g1/swipes/last');
    await waitFor(() => expect(server.db.swipes).toEqual([]));
    expect(result.current.history).toEqual([]);
  });

  it('R2: hết thẻ thì quẹt thêm không gửi request, điểm không đổi', async () => {
    const { result, server } = await setup();
    await swipe(result, 'right');
    await swipe(result, 'left');
    await swipe(result, 'up');
    await waitFor(() => expect(writes(server)).toHaveLength(3));
    expect(result.current.current).toBeUndefined();
    for (let i = 0; i < 5; i += 1) await swipe(result, 'right');
    expect(result.current.score).toBe(25);
    expect(writes(server)).toHaveLength(3);
  });

  it('không có gì để hoàn tác thì undo không gửi request', async () => {
    const { result, server } = await setup();
    await undo(result);
    expect(writes(server)).toEqual([]);
  });
});

describe('useSwipeGame: lỗi và đồng bộ lại', () => {
  it('server từ chối (409) thì báo lỗi và đồng bộ lại theo server', async () => {
    const { result, server } = await setup();
    // Tab khác đã quẹt p1 trong ván này.
    server.db.swipes.push({ id: 'x', gameId: 'g1', profileId: 'p1', direction: 'left', createdAt: '' });
    await swipe(result, 'right');
    await waitFor(() => expect(result.current.error).toMatch(/Profile already swiped/));
    await waitFor(() => expect(result.current.history).toMatchObject([{ id: 'x', direction: 'left' }]));
    expect(result.current.stale).toBe(false);
    expect(result.current.score).toBe(-5);
  });

  it('R5: mất mạng thì giữ màn hình, khoá thao tác; retry đồng bộ lại khi server sống', async () => {
    const { result, server } = await setup();
    server.state.fail = 'network';
    await swipe(result, 'up');
    await waitFor(() => expect(result.current.stale).toBe(true));
    expect(result.current.status).toBe('ready');
    expect(result.current.error).toMatch(/Không kết nối được/);

    // Đang lệch: quẹt bị chặn, không gửi thêm request ghi.
    const before = writes(server).length;
    await swipe(result, 'left');
    expect(writes(server)).toHaveLength(before);

    server.state.fail = null;
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.stale).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.history).toEqual(server.db.swipes);
    expect(result.current.current.id).toBe('p1');

    await swipe(result, 'left');
    await waitFor(() => expect(server.db.swipes).toHaveLength(1));
    expect(result.current.error).toBeNull();
  });

  it('seed lại khi app đang mở: đồng bộ lại cả hồ sơ, quẹt tiếp được với id mới', async () => {
    const { result, server } = await setup();
    // Mô phỏng npm run seed: hồ sơ có id mới, mọi ván và lượt quẹt bị xoá.
    server.db.profiles.splice(0, Infinity, profile('n1', 'An'), profile('n2', 'Bình', 'male'));
    server.db.games.length = 0;
    server.db.swipes.length = 0;

    await swipe(result, 'right'); // gửi game và profile cũ → 404
    await waitFor(() => expect(result.current.error).toMatch(/Game not found/));
    await waitFor(() => expect(result.current.current?.id).toBe('n1'));
    expect(result.current.deck.map((p) => p.id)).toEqual(['n1', 'n2']);

    await swipe(result, 'left');
    await waitFor(() => expect(server.db.swipes).toMatchObject([{ profileId: 'n1', direction: 'left' }]));
    expect(result.current.error).toBeNull();
  });

  it('lỗi ở một request thì bỏ các request ghi đang xếp hàng sau nó', async () => {
    const { result, server } = await setup();
    server.state.hold = true;
    await swipe(result, 'right');
    await swipe(result, 'left');
    server.state.fail = 500;
    server.state.hold = false;
    server.release();
    await waitFor(() => expect(result.current.error).not.toBeNull());
    await waitFor(() => expect(result.current.stale).toBe(true));
    expect(writes(server)).toEqual(['POST /api/games/g1/swipes']);
  });
});

describe('useSwipeGame: ván mới', () => {
  it('newGame tạo ván mới trên server, xoá history', async () => {
    const { result, server } = await setup({ swipes: [{ profileId: 'p1', direction: 'up' }] });
    act(() => result.current.newGame());
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.history).toEqual([]);
    expect(result.current.deck).toHaveLength(3);
    expect(result.current.lastEvent).toEqual({ type: 'new' });
    expect(server.db.games).toHaveLength(2);

    await swipe(result, 'right');
    const newGameId = server.db.games.at(-1).id;
    await waitFor(() => expect(server.db.swipes.filter((s) => s.gameId === newGameId)).toHaveLength(1));
  });
});
