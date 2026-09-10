import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PENDING = [
  'paid',
  'generating_artwork',
  'artwork_ready',
  'uploading_to_printify',
  'creating_printify_order',
];

function friendlyStatus(status) {
  const map = {
    paid: 'Payment received',
    generating_artwork: 'Preparing your sign',
    artwork_ready: 'Preparing your sign',
    uploading_to_printify: 'Sending to production',
    creating_printify_order: 'Sending to production',
    fulfilled: 'In production',
    printify_submit_pending: 'In production',
    awaiting_printify_config: 'Order received',
    fulfillment_error: 'Needs attention — we will follow up',
  };
  return map[status] || String(status || '').replace(/_/g, ' ');
}

export default function Success() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError('Missing checkout session id.');
      return;
    }
    let cancelled = false;
    let tries = 0;

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(sessionId)}`);
        if (res.status === 404 && tries < 8) {
          tries += 1;
          setTimeout(poll, 1500);
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load order');
        if (!cancelled) {
          setOrder(data);
          setLoading(false);
          if (PENDING.includes(data.status)) {
            setTimeout(poll, 2500);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Never surface internal provider errors to the customer
  const publicNote =
    order?.errorMessage && !/printify/i.test(order.errorMessage)
      ? order.errorMessage
      : null;

  return (
    <div className="panel status-card">
      <h1>Thank you!</h1>
      <p>Your payment was received. We are preparing your one-of-one custom yard sign for printing and shipping.</p>
      {loading && <p>Looking up your order...</p>}
      {error && <div className="error-banner">{error}</div>}
      {order && (
        <>
          <div className={`status-pill ${order.status}`}>{friendlyStatus(order.status)}</div>
          <p>
            Order ID: <code>{order.id}</code>
          </p>
          {order.customerEmail && <p>Confirmation email: {order.customerEmail}</p>}
          {publicNote && <p className="hint">Note: {publicNote}</p>}
        </>
      )}
      <p style={{ marginTop: '1.5rem' }}>
        <Link to="/">Design another sign</Link>
      </p>
    </div>
  );
}

