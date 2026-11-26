import { GROUNDS } from '../../../shared/appealRules.js';
import styles from './AppealReceipt.module.css';

const formatTime = (ms) => new Date(ms).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'medium' });

/**
 * Biên nhận đơn đã nộp (lấy từ dossier.appeal nên F5 vẫn thấy).
 * @param {{ appeal: import('../../../shared/appealRules.js').AppealInput & { id: string, submittedAt: number } }} props
 */
export function AppealReceipt({ appeal }) {
  return (
    <section aria-labelledby="receipt-title" className={styles.receipt}>
      <h4 id="receipt-title" className={styles.title}>
        Đã nộp đơn
      </h4>
      <p>
        Đã nộp đơn lúc <time dateTime={new Date(appeal.submittedAt).toISOString()}>{formatTime(appeal.submittedAt)}</time>.
      </p>
      <dl className={styles.facts}>
        <dt>Mã đơn</dt>
        <dd>{appeal.id}</dd>
        <dt>Email</dt>
        <dd>{appeal.email}</dd>
        <dt>Căn cứ</dt>
        <dd>
          <ul>
            {appeal.grounds.map((g) => (
              <li key={g}>{GROUNDS[g]}</li>
            ))}
          </ul>
        </dd>
      </dl>
    </section>
  );
}
