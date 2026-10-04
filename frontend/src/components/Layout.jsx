import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <NavBar />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
