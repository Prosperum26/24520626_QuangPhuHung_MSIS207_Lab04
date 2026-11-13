import styles from './ShowData.module.css';

/**
 * Bộ kiểm tra dữ liệu dạng <dl> thay cho JSON.stringify. JSX tự escape nên chuỗi
 * có dạng HTML chỉ hiện như chữ.
 * @param {{ data: Record<string, unknown> }} props
 */
export function ShowData({ data }) {
  return (
    <dl className={styles.inspector}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className={styles.row}>
          <dt>{key}</dt>
          <dd>{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
