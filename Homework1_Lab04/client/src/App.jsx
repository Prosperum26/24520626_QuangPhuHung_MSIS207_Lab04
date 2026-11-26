import { GameSummary } from './components/GameSummary.jsx';
import { SwipeCard } from './components/SwipeCard.jsx';
import { SwipeControls } from './components/SwipeControls.jsx';
import { tally } from './domain/deck.js';
import { DIRECTION_LABEL } from './domain/swipeConfig.js';
import { useSwipeGame } from './hooks/useSwipeGame.js';
import { useSwipeKeyboard } from './hooks/useSwipeKeyboard.js';
import styles from './App.module.css';

/** Câu cho vùng status, dẫn xuất từ thao tác cuối (không lưu riêng). */
function describeEvent({ status, lastEvent, profiles, score }) {
  if (status === 'loading') return 'Đang tải...';
  if (!lastEvent) return '';
  if (lastEvent.type === 'new') return 'Ván mới bắt đầu.';
  if (lastEvent.type === 'undo') return `Đã hoàn tác. Điểm ${score}.`;
  const name = profiles.find((p) => p.id === lastEvent.profileId)?.name ?? '';
  return `Đã ${DIRECTION_LABEL[lastEvent.direction].toLocaleLowerCase('vi')} ${name}. Điểm ${score}.`;
}

export function App() {
  const game = useSwipeGame();
  const { status, error, stale, profiles, history, deck, current, score } = game;
  const canAct = status === 'ready' && !stale;

  useSwipeKeyboard({ onSwipe: game.swipe, onUndo: game.undo, enabled: canAct });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Hẹn Hò Nhưng Không Yêu</h1>
        <button type="button" className={styles.newGame} disabled={!canAct} onClick={game.newGame}>
          Ván mới
        </button>
      </header>

      {error && (
        <div role="alert" className={styles.alert}>
          <p>{error}</p>
          {(status === 'error' || stale) && (
            <button type="button" className={styles.retry} onClick={game.retry}>
              Thử lại
            </button>
          )}
        </div>
      )}

      {status !== 'error' && (
        <>
          <dl className={styles.stats}>
            <div>
              <dt>Điểm</dt>
              <dd>{score}</dd>
            </div>
            <div>
              <dt>Còn lại</dt>
              <dd>{`${deck.length}/${profiles.length}`}</dd>
            </div>
          </dl>

          <section className={styles.stage} aria-label="Bộ thẻ">
            {status === 'loading' && <div className={styles.skeleton} aria-hidden="true" />}
            {status === 'ready' && current && <SwipeCard key={current.id} profile={current} onSwipe={game.swipe} />}
            {status === 'ready' && !current && (
              <GameSummary score={score} tally={tally(history)} onNewGame={game.newGame} />
            )}
          </section>

          <SwipeControls
            onSwipe={game.swipe}
            onUndo={game.undo}
            canSwipe={canAct && Boolean(current)}
            canUndo={canAct && history.length > 0}
          />
          <p className={styles.hint}>Phím tắt: ← bỏ qua, ↑ siêu thích, → thích, Backspace hoàn tác.</p>
        </>
      )}

      {/* Vùng live duy nhất: <output> có sẵn role="status". */}
      <output className={styles.status}>{describeEvent({ status, lastEvent: game.lastEvent, profiles, score })}</output>
    </main>
  );
}
