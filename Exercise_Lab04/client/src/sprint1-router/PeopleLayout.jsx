import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router';
import PersonDetailSkeleton from './PersonDetailSkeleton.jsx';
import styles from './PeopleLayout.module.css';

const linkClass = ({ isActive }) => (isActive ? styles.active : styles.link);

/**
 * Khung master-detail: danh sách bên trái, <Outlet/> bên phải.
 * Không dùng <main> ở đây vì AppLayout đã có một <main>.
 * @param {{ people: readonly import('./people.js').Person[] }} props
 */
export default function PeopleLayout({ people }) {
  return (
    <div className={styles.frame}>
      <nav aria-label="Danh sách người" className={styles.sidebar}>
        <ul className={styles.list}>
          {people.map((person) => (
            <li key={person.id}>
              <NavLink to={`/people/${person.id}`} className={linkClass}>
                {person.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <section aria-label="Chi tiết" className={styles.content}>
        {/* Vùng status có sẵn từ đầu (live region phải tồn tại trước khi nội dung đổi). */}
        <div role="status">
          <Suspense fallback={<PersonDetailSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
