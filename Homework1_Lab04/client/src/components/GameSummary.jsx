import { useId } from 'react';
import { DIRECTION_LABEL } from '../domain/swipeConfig.js';
import styles from './GameSummary.module.css';

/**
 * Bảng tổng kết khi hết thẻ. Vẫn hoàn tác được (nút ở SwipeControls).
 * @param {{ score: number, tally: { left: number, right: number, up: number }, onNewGame: () => void }} props
 */
export function GameSummary({ score, tally, onNewGame }) {
  const titleId = useId();
  return (
    <section className={styles.summary} aria-labelledby={titleId}>
      <h2 id={titleId}>Hết hồ sơ</h2>
      <dl className={styles.stats}>
        <dt>Điểm</dt>
        <dd>{score}</dd>
        {['right', 'up', 'left'].map((direction) => (
          <div key={direction} className={styles.row}>
            <dt>{DIRECTION_LABEL[direction]}</dt>
            <dd>{tally[direction]}</dd>
          </div>
        ))}
      </dl>
      <button type="button" className={styles.button} onClick={onNewGame}>
        Chơi ván mới
      </button>
    </section>
  );
}
