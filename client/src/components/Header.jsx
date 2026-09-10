import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header">
      <div className="inner">
        <Link to="/" className="brand">
          In This House <span>We Believe</span>
        </Link>
        <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Custom signs</span>
      </div>
    </header>
  );
}
