import { NavLink, Outlet } from 'react-router';

const linkClass = ({ isActive }) => (isActive ? 'active-link' : 'link');

/**
 * Khung master-detail: danh sách bên trái, <Outlet/> bên phải.
 * Không dùng <main> ở đây vì AppLayout đã có một <main>.
 * @param {{ people: readonly import('./people.js').Person[] }} props
 */
export default function PeopleLayout({ people }) {
  return (
    <div>
      <nav aria-label="Danh sách người">
        <ul>
          {people.map((person) => (
            <li key={person.id}>
              <NavLink to={`/people/${person.id}`} className={linkClass}>
                {person.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <section aria-label="Chi tiết">
        <Outlet />
      </section>
    </div>
  );
}
