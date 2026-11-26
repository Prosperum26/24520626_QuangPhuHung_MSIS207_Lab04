import { Link, Outlet } from 'react-router';
import styles from './Layout.module.css';

/** Khung chung: header có tên app và ghi chú mô phỏng, nội dung route ở <main>. */
export function Layout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <Link to="/">Esports Fair-Play Appeal Tribunal</Link>
        </h1>
        <p className={styles.disclaimer}>Mô phỏng phục vụ bài tập MSIS207, không phải cổng chính thức của KRAFTON.</p>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
