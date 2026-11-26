import { SANCTION_LABEL } from '../domain/matrix.js';
import styles from './DisproportionalityMatrix.module.css';

const VERDICT_LABEL = { disproportionate: 'Bất cân xứng', proportionate: 'Tương xứng' };
const signed = (n) => (n > 0 ? `+${n}` : String(n));

/**
 * Bảng hiển thị kết quả computeMatrix (tính ở DossierPage bằng useMemo).
 * @param {{ matrix: NonNullable<ReturnType<typeof import('../domain/matrix.js').computeMatrix>>, sanctionKind: keyof typeof SANCTION_LABEL }} props
 */
export function DisproportionalityMatrix({ matrix, sanctionKind }) {
  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <caption className={styles.caption}>
          Ma trận bất cân xứng
          <span className={styles.note}>Mô hình chấm điểm cho bài tập, không phải đánh giá pháp lý. Mức hành vi gốc là 5.</span>
        </caption>
        <thead>
          <tr>
            <th scope="col">Tiêu chí</th>
            <th scope="col">Giá trị</th>
            <th scope="col">Điều chỉnh</th>
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
              <td>{signed(row.adjustment)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Mức hành vi (1 đến 5)</th>
            <td colSpan={2}>{matrix.offenseSeverity}</td>
          </tr>
          <tr>
            <th scope="row">Mức án</th>
            <td colSpan={2}>
              {SANCTION_LABEL[sanctionKind]} ({matrix.sanctionSeverity})
            </td>
          </tr>
          <tr>
            <th scope="row">Tỉ lệ án / hành vi</th>
            <td>{matrix.ratio}</td>
            <td>
              <strong className={styles[matrix.verdict]}>{VERDICT_LABEL[matrix.verdict]}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
