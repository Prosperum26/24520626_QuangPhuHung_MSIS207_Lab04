import { NavLink, Outlet } from 'react-router';
import styles from './AppLayout.module.css';

const SECTIONS = [
  { to: '/people', label: 'People' },
  { to: '/form', label: 'Form' },
  { to: '/forum', label: 'Forum' },
];

const linkClass = ({ isActive }) => (isActive ? styles.active : styles.link);

export function AppLayout() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Lab 04: Multi-Route SPA</h1>
        <nav aria-label="Chính">
          <ul className={styles.tabs}>
            {SECTIONS.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} className={linkClass}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
