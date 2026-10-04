import { NavLink } from 'react-router-dom';
import './NavBar.css';

const NAV_LINKS = [
  { to: '/load',    label: 'Load' },
  { to: '/map',     label: 'Map Columns' },
  { to: '/rules',   label: 'Rules' },
  { to: '/results', label: 'Results' },
];

export function NavBar() {
  return (
    <nav className="navbar">
      <span className="navbar-brand">Recruitment Tool</span>
      <ul className="navbar-links">
        {NAV_LINKS.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link--active' : 'nav-link'
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
