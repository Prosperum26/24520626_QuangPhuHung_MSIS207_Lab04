import { NavLink, Outlet } from 'react-router';

const SECTIONS = [
  { to: '/people', label: 'People' },
  { to: '/form', label: 'Form' },
  { to: '/forum', label: 'Forum' },
];

const linkClass = ({ isActive }) => (isActive ? 'active-link' : 'link');

export function AppLayout() {
  return (
    <>
      <header>
        <h1>Lab 04: Multi-Route SPA</h1>
        <nav aria-label="Chính">
          <ul>
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
      <main>
        <Outlet />
      </main>
    </>
  );
}
