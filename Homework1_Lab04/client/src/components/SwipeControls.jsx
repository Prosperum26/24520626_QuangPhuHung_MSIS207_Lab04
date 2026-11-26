import { DIRECTION_LABEL } from '../domain/swipeConfig.js';
import styles from './SwipeControls.module.css';

/** Thứ tự nút trên màn hình, khớp vị trí phím mũi tên. */
const SWIPE_BUTTONS = [
  { direction: 'left', icon: '←', key: 'ArrowLeft' },
  { direction: 'up', icon: '↑', key: 'ArrowUp' },
  { direction: 'right', icon: '→', key: 'ArrowRight' },
];

/**
 * Nút bấm tương đương mọi thao tác kéo và phím tắt (WCAG 2.1.1, 2.5.7).
 * @param {{ onSwipe: (d: 'left'|'right'|'up') => void, onUndo: () => void, canSwipe: boolean, canUndo: boolean }} props
 */
export function SwipeControls({ onSwipe, onUndo, canSwipe, canUndo }) {
  return (
    <div className={styles.controls}>
      {SWIPE_BUTTONS.map(({ direction, icon, key }) => (
        <button
          key={direction}
          type="button"
          className={styles.button}
          data-direction={direction}
          aria-keyshortcuts={key}
          disabled={!canSwipe}
          onClick={() => onSwipe(direction)}
        >
          <span aria-hidden="true">{icon} </span>
          {DIRECTION_LABEL[direction]}
        </button>
      ))}
      <button
        type="button"
        className={`${styles.button} ${styles.undo}`}
        aria-keyshortcuts="Backspace"
        disabled={!canUndo}
        onClick={onUndo}
      >
        <span aria-hidden="true">⌫ </span>
        Hoàn tác
      </button>
    </div>
  );
}
