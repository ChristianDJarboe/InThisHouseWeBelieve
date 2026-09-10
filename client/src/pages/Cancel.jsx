import { Link } from 'react-router-dom';

export default function Cancel() {
  return (
    <div className="panel status-card">
      <h1>Checkout canceled</h1>
      <p>No charge was made. Your design is still on the home page when you are ready.</p>
      <p style={{ marginTop: '1.5rem' }}>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
          Back to customizer
        </Link>
      </p>
    </div>
  );
}
