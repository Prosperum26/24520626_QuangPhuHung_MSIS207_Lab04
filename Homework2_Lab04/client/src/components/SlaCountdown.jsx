import { formatRemaining } from '../domain/clock.js';
import styles from './SlaCountdown.module.css';

/**
 * Hiển thị kết quả useAppealSlaTimer. role="timer" mặc định không đọc to từng giây;
 * khi hết hạn thì đổi sang role="status" để trình đọc màn hình báo một lần.
 * @param {{ remainingMs: number, expired: boolean, synced: boolean }} props
 */
export function SlaCountdown({ remainingMs, expired, synced }) {
  if (expired) {
    return (
      <p role="status" className={`${styles.box} ${styles.expired}`}>
        Đã hết hạn kháng cáo
      </p>
    );
  }
  return (
    <div className={styles.box}>
      <span className={styles.label}>Hạn nộp đơn còn</span>
      <p role="timer" aria-label="Thời gian còn lại để kháng cáo" className={styles.time}>
        {formatRemaining(remainingMs)}
      </p>
      {!synced && <span className={styles.note}>(chưa đồng bộ giờ server)</span>}
    </div>
  );
}
