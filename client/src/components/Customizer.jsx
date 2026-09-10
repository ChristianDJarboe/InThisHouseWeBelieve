import { useState, useEffect, useCallback } from 'react';
import SignPreview from './SignPreview';
import { DEFAULT_LINES, DEFAULT_BG, makeBlankLine } from '../defaults';

function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    (cents || 0) / 100
  );
}

export default function Customizer() {
  const [lines, setLines] = useState(() => DEFAULT_LINES.map((l) => ({ ...l })));
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BG);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [config, setConfig] = useState({ priceCents: 4999, productName: '', maxUploadMb: 5 });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => {});
  }, []);

  const setLineCount = useCallback((n) => {
    const count = Math.min(12, Math.max(3, Number(n) || 3));
    setLines((prev) => {
      if (count === prev.length) return prev;
      if (count > prev.length) {
        const extras = Array.from({ length: count - prev.length }, makeBlankLine);
        return [...prev, ...extras];
      }
      return prev.slice(0, count);
    });
  }, []);

  const updateLine = (index, patch) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setBackgroundImageUrl(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const checkout = async () => {
    setError('');
    setBusy(true);
    try {
      const customization = {
        lines: lines.map((l) => ({
          text: l.text,
          color: l.color,
          backgroundColor: l.backgroundColor,
        })),
        backgroundColor,
        backgroundImageUrl: backgroundImageUrl || undefined,
      };
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customization }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (!data.url) throw new Error('No checkout URL returned');
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="customizer-layout">
      <section className="panel">
        <h2>Live preview</h2>
        <SignPreview
          lines={lines}
          backgroundColor={backgroundColor}
          backgroundImageUrl={backgroundImageUrl}
        />
        <p className="price-tag">{formatPrice(config.priceCents)}</p>
        <p className="hint" style={{ textAlign: 'center' }}>
          {config.productName || 'Custom sign'} · Ships via Printify
        </p>
      </section>

      <section className="panel">
        <h2>Customize your sign</h2>
        {error && <div className="error-banner">{error}</div>}

        <div className="field">
          <label htmlFor="lineCount">Number of lines (3–12)</label>
          <input
            id="lineCount"
            type="number"
            min={3}
            max={12}
            value={lines.length}
            onChange={(e) => setLineCount(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="bgColor">Sign background color</label>
          <div className="row">
            <input
              id="bgColor"
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              aria-label="Background color hex"
              style={{ maxWidth: 120 }}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="bgImage">Optional background image</label>
          <input
            id="bgImage"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={onUpload}
            disabled={uploading}
          />
          <p className="hint">
            Max {config.maxUploadMb || 5} MB · JPEG/PNG/WebP/GIF
            {backgroundImageUrl ? (
              <>
                {' · '}
                <button type="button" className="btn btn-ghost" onClick={() => setBackgroundImageUrl('')}>
                  Remove image
                </button>
              </>
            ) : null}
          </p>
        </div>

        <div className="field">
          <label>Lines</label>
          {lines.map((line, i) => (
            <div className="line-editor" key={i}>
              <div className="line-num">Line {i + 1}{i === 0 ? ' (title)' : ''}</div>
              <input
                type="text"
                maxLength={120}
                value={line.text}
                placeholder="Enter text…"
                onChange={(e) => updateLine(i, { text: e.target.value })}
                style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem 0.65rem', borderRadius: 8, border: '1px solid #d4c4b0' }}
              />
              <div className="row">
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Text
                  <input
                    type="color"
                    value={line.color || '#1a1a1a'}
                    onChange={(e) => updateLine(i, { color: e.target.value })}
                    style={{ marginLeft: 6, verticalAlign: 'middle' }}
                  />
                </label>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Line BG
                  <input
                    type="color"
                    value={
                      !line.backgroundColor || line.backgroundColor === 'transparent'
                        ? '#ffffff'
                        : line.backgroundColor
                    }
                    onChange={(e) => updateLine(i, { backgroundColor: e.target.value })}
                    style={{ marginLeft: 6, verticalAlign: 'middle' }}
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => updateLine(i, { backgroundColor: 'transparent' })}
                >
                  Clear line BG
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-primary" onClick={checkout} disabled={busy || uploading}>
          {busy ? 'Redirecting to checkout…' : `Buy now — ${formatPrice(config.priceCents)}`}
        </button>
        <p className="hint" style={{ textAlign: 'center', marginTop: '0.75rem' }}>
          Secure checkout powered by Stripe. Shipping address collected at payment.
        </p>
      </section>
    </div>
  );
}
