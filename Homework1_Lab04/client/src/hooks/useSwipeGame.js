import { useCallback, useEffect, useReducer, useRef } from 'react';
import { ApiError, createGame, deleteLastSwipe, fetchCurrentGame, fetchProfiles, postSwipe } from '../api/swipeApi.js';
import { deriveDeck, scoreOf } from '../domain/deck.js';

/**
 * State duy nhất của ván. history = các Swipe theo thứ tự quẹt, đồng thời là ngăn xếp hoàn tác.
 * stale = màn hình có thể lệch DB (ghi lỗi và đồng bộ lại cũng lỗi): khoá thao tác tới khi retry.
 */
const INITIAL = {
  status: 'loading',
  error: null,
  stale: false,
  profiles: [],
  gameId: null,
  history: [],
  lastEvent: null,
  loadKey: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOADED':
      return { ...state, status: 'ready', error: null, stale: false, profiles: action.profiles, gameId: action.gameId, history: action.history };
    case 'LOAD_FAILED':
      return { ...state, status: 'error', error: action.error };
    case 'RETRY_LOAD':
      return { ...state, status: 'loading', error: null, loadKey: state.loadKey + 1 };
    case 'SWIPED':
      if (state.history.some((s) => s.profileId === action.swipe.profileId)) return state;
      return {
        ...state,
        history: [...state.history, action.swipe],
        lastEvent: { type: 'swipe', profileId: action.swipe.profileId, direction: action.swipe.direction },
      };
    case 'UNDONE':
      return { ...state, history: state.history.slice(0, -1), lastEvent: { type: 'undo' } };
    case 'NEW_GAME_START':
      return { ...state, status: 'loading' };
    case 'NEW_GAME_READY':
      return { ...state, status: 'ready', gameId: action.gameId, history: [], lastEvent: { type: 'new' } };
    case 'MUTATION_OK':
      return state.error === null ? state : { ...state, error: null };
    case 'MUTATION_FAILED':
      return { ...state, status: 'ready', error: action.error };
    case 'SYNCED':
      return {
        ...state,
        stale: false,
        profiles: action.profiles,
        gameId: action.gameId,
        history: action.history,
        error: action.clearError ? null : state.error,
      };
    case 'SYNC_FAILED':
      return { ...state, stale: true, error: action.error };
    default:
      return state;
  }
}

/** Câu báo lỗi cho người dùng. */
function describeError(err) {
  if (err instanceof ApiError) return `Server báo lỗi: ${err.message}`;
  return 'Không kết nối được server. Kiểm tra server rồi bấm Thử lại.';
}

/**
 * Ván quẹt: tải, quẹt, hoàn tác LIFO, ván mới. Cập nhật màn hình ngay (lạc quan) rồi ghi lên
 * server qua một hàng đợi tuần tự, nên DELETE luôn đến sau POST tương ứng. Ghi lỗi thì bỏ
 * các request đang chờ và đồng bộ lại từ server.
 */
export function useSwipeGame() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const { status, error, stale, profiles, gameId, history, lastEvent, loadKey } = state;

  // Dẫn xuất trong render, không lưu vào state.
  const deck = deriveDeck(profiles, history);
  const current = deck[0];
  const score = scoreOf(history);
  const canAct = status === 'ready' && !stale;

  // Tải lần đầu và mỗi lần retry sau khi tải lỗi.
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([fetchProfiles({ signal }), fetchCurrentGame({ signal })])
      .then(([loadedProfiles, { game, swipes }]) => {
        if (!signal.aborted) dispatch({ type: 'LOADED', profiles: loadedProfiles, gameId: game.id, history: swipes });
      })
      .catch((err) => {
        if (signal.aborted || err.name === 'AbortError') return;
        dispatch({ type: 'LOAD_FAILED', error: `Không tải được dữ liệu. ${describeError(err)}` });
      });
    return () => controller.abort();
  }, [loadKey]);

  const queueRef = useRef(Promise.resolve());
  const epochRef = useRef(0); // tăng khi một request ghi lỗi: các task xếp sau sẽ bị bỏ
  const localIdRef = useRef(0);

  // Tải lại cả hồ sơ: chạy seed khi app đang mở sẽ đổi id hồ sơ.
  const resync = useCallback(async (clearError) => {
    try {
      const [syncedProfiles, { game, swipes }] = await Promise.all([fetchProfiles(), fetchCurrentGame()]);
      dispatch({ type: 'SYNCED', profiles: syncedProfiles, gameId: game.id, history: swipes, clearError });
    } catch (err) {
      dispatch({ type: 'SYNC_FAILED', error: describeError(err) });
    }
  }, []);

  const enqueue = useCallback(
    (task) => {
      const epoch = epochRef.current;
      queueRef.current = queueRef.current.then(async () => {
        if (epoch !== epochRef.current) return;
        try {
          await task();
          dispatch({ type: 'MUTATION_OK' });
        } catch (err) {
          epochRef.current += 1;
          dispatch({ type: 'MUTATION_FAILED', error: describeError(err) });
          await resync(false);
        }
      });
    },
    [resync],
  );

  function swipe(direction) {
    if (!canAct || !current) return;
    localIdRef.current += 1;
    const entry = { id: `local-${localIdRef.current}`, profileId: current.id, direction };
    dispatch({ type: 'SWIPED', swipe: entry });
    enqueue(() => postSwipe(gameId, { profileId: entry.profileId, direction }));
  }

  function undo() {
    if (!canAct || history.length === 0) return;
    dispatch({ type: 'UNDONE' });
    enqueue(() => deleteLastSwipe(gameId));
  }

  function newGame() {
    if (!canAct) return;
    dispatch({ type: 'NEW_GAME_START' });
    enqueue(async () => {
      const { game } = await createGame();
      dispatch({ type: 'NEW_GAME_READY', gameId: game.id });
    });
  }

  function retry() {
    if (status === 'error') dispatch({ type: 'RETRY_LOAD' });
    else if (stale) resync(true);
  }

  return { status, error, stale, profiles, history, deck, current, score, lastEvent, swipe, undo, newGame, retry };
}
