import { Link, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="app-shell">
      <div className="app-backdrop app-backdrop-left" />
      <div className="app-backdrop app-backdrop-right" />
      <header className="topbar">
        <div>
          <p className="eyebrow">SWAPI Explorer</p>
          <h1>Star Wars planets</h1>
        </div>
        <Link className="topbar-link" to="/planets">
          Planets list
        </Link>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
