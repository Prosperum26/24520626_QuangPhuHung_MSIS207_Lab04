import styles from './PersonDetailSkeleton.module.css';

const ROWS = ['name', 'age', 'iq'];

/**
 * Khung chờ cho PersonDetail: cùng bố cục và chiều cao (tiêu đề + 3 hàng) để CLS = 0.
 * Chữ ẩn cho trình đọc màn hình; thanh giả ẩn khỏi cây truy cập.
 */
export default function PersonDetailSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true">
      <span className={styles.srOnly}>Đang tải chi tiết…</span>
      <span className={styles.title} aria-hidden="true" />
      <div className={styles.rows} aria-hidden="true">
        {ROWS.map((row) => (
          <span key={row} className={styles.row}>
            <span className={styles.term} />
            <span className={styles.definition} />
          </span>
        ))}
      </div>
    </div>
  );
}
