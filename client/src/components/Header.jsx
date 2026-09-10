import { Link, NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header">
      <div className="inner">
        <Link to="/" className="brand">
          In This House <span>We Believe</span>
        </Link>
        <nav className="site-nav" aria-label="Main">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Design
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            In this website we believe
          </NavLink>
        </nav>
        <span className="tagline">Plastic yard signs</span>
      </div>
    </header>
  );
}