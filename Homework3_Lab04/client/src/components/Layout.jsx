import { NavLink, Outlet } from 'react-router';
import styles from './Layout.module.css';

const navClass = ({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link);

/** Khung chung: skip link, header, điều hướng, một <main>. */
export function Layout() {
  return (
    <>
      <a className={styles.skip} href="#main">
        Bỏ qua tới nội dung
      </a>
      <header className={styles.header}>
        <h1 className={styles.title}>Photo &amp; Evidence Gallery</h1>
        <p className={styles.note}>Mọi ảnh là ảnh minh họa tự sinh cho bài tập MSIS207, không phải bằng chứng thật.</p>
        <nav aria-label="Chính">
          <NavLink to="/" end className={navClass}>
            Thư viện ảnh
          </NavLink>
          <NavLink to="/about" className={navClass}>
            Giới thiệu
          </NavLink>
        </nav>
      </header>
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}
