import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SignPreview from './SignPreview';
import {
  DEFAULT_LINES,
  DEFAULT_BG,
  DEFAULT_BORDER,
  DEFAULT_WEIGHT,
  DEFAULT_LETTER_SPACING,
  DEFAULT_FONT_SCALE,
  WEIGHT_OPTIONS,
  makeBlankLine,
  reflowPosterLines,
  TEMPLATES,
  MAX_LINES,
  MIN_LINES,
} from '../defaults';
import { FONT_OPTIONS, DEFAULT_FONT } from '../fonts.js';

function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    (cents || 0) / 100
  );
}

function cloneLines(lines) {
  return lines.map((l) => ({ ...l }));
}

export default function Customizer() {
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0].id);
  const [lines, setLines] = useState(() => reflowPosterLines(cloneLines(DEFAULT_LINES)));
  const [backgroundColor, setBackgroundColor] = useState(
    TEMPLATES[0].backgroundColor || DEFAULT_BG
  );
  const [border, setBorder] = useState(() => ({
    ...DEFAULT_BORDER,
    ...(TEMPLATES[0].border || {}),
  }));
  const [config, setConfig] = useState({
    productName: '',
    maxUploadMb: 5,
    sizes: [],
    defaultVariantId: null,
  });
  const [variantId, setVariantId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [shareLoaded, setShareLoaded] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)');
    const apply = () => setPreviewCollapsed(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);


  useEffect(() => {
    const id = searchParams.get('s');
    if (!id || shareLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/share/${encodeURIComponent(id)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Share not found');
        if (cancelled) return;
        const d = data.design;
        if (!d?.lines?.length) throw new Error('Empty share');
        setLines(reflowPosterLines(cloneLines(d.lines)));
        setBackgroundColor(d.backgroundColor || DEFAULT_BG);
        setBorder({ ...DEFAULT_BORDER, ...(d.border || {}) });
        setActiveTemplate(d.templateId || 'custom');
        setShareMsg('Loaded shared design');
        setShareLoaded(true);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load shared design');
          setShareLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, shareLoaded]);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        setConfig(data);
        const initial = data.defaultVariantId || data.sizes?.[0]?.variantId || null;
        setVariantId((prev) => prev || initial);
      })
      .catch(() => {});
  }, []);

  const selectedSize = useMemo(() => {
    const sizes = config.sizes || [];
    return sizes.find((s) => s.variantId === variantId) || sizes[0] || null;
  }, [config.sizes, variantId]);

  const priceCents = selectedSize?.priceCents || config.priceCents || 0;
  const orientation = selectedSize?.orientation || 'horizontal';

  const applyTemplate = (template) => {
    setActiveTemplate(template.id);
    setLines(reflowPosterLines(cloneLines(template.lines)));
    setBackgroundColor(template.backgroundColor || DEFAULT_BG);
    setBorder({ ...DEFAULT_BORDER, ...(template.border || {}) });
    setError('');
  };

  const updateLine = (index, patch) => {
    setActiveTemplate('custom');
    setLines((prev) => {
      const next = prev.map((l, i) => (i === index ? { ...l, ...patch } : l));
      // Auto size/weight like Classic when copy changes
      if (Object.prototype.hasOwnProperty.call(patch, 'text')) {
        return reflowPosterLines(next);
      }
      return next;
    });
  };

  const updateBorder = (patch) => {
    setActiveTemplate('custom');
    setBorder((prev) => ({ ...prev, ...patch }));
  };

  const addLine = () => {
    setLines((prev) => {
      if (prev.length >= MAX_LINES) return prev;
      setActiveTemplate('custom');
      return reflowPosterLines([...prev, makeBlankLine(prev.length)]);
    });
  };

  const removeLine = (index) => {
    setLines((prev) => {
      if (prev.length <= MIN_LINES) return prev;
      setActiveTemplate('custom');
      return reflowPosterLines(prev.filter((_, i) => i !== index));
    });
  };


  const buildDesignPayload = useCallback(() => ({
    lines: lines.map((l) => ({
      text: l.text,
      color: l.color,
      backgroundColor: l.backgroundColor,
      font: l.font || DEFAULT_FONT,
      weight: l.weight || DEFAULT_WEIGHT,
      letterSpacing: Number.isFinite(Number(l.letterSpacing))
        ? Number(l.letterSpacing)
        : DEFAULT_LETTER_SPACING,
      fontScale: Number(l.fontScale) > 0 ? Number(l.fontScale) : DEFAULT_FONT_SCALE,
      fitWidth: l.fitWidth !== false,
    })),
    backgroundColor,
    border,
    templateId: activeTemplate,
  }), [lines, backgroundColor, border, activeTemplate]);

  const shareDesign = async () => {
    setError('');
    setShareMsg('');
    setShareBusy(true);
    try {
      if (lines.length < MIN_LINES) throw new Error(`Add at least ${MIN_LINES} line`);
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design: buildDesignPayload() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Share failed');
      const link = data.url?.startsWith('http')
        ? data.url
        : `${window.location.origin}${data.path || `/?s=${data.id}`}`;
      setSearchParams({ s: data.id }, { replace: true });
      let copied = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(link);
          copied = true;
        } catch {
          /* fall through */
        }
      }
      if (!copied && navigator.share) {
        try {
          await navigator.share({ title: 'My yard sign', url: link, text: 'Check out this yard sign I made' });
          setShareMsg('Shared');
          return;
        } catch (shareErr) {
          if (shareErr?.name === 'AbortError') {
            setShareMsg('Share cancelled');
            return;
          }
        }
      }
      if (copied) {
        setShareMsg('Link copied — send it to anyone');
      } else {
        window.prompt('Copy this link:', link);
        setShareMsg('Link ready');
      }
    } catch (err) {
      setError(err.message || 'Share failed');
    } finally {
      setShareBusy(false);
    }
  };

  const checkout = async () => {
    setError('');
    setBusy(true);
    try {
      if (!selectedSize) throw new Error('Product size not configured');
      if (lines.length < MIN_LINES || lines.length > MAX_LINES) {
        throw new Error(`Use between ${MIN_LINES} and ${MAX_LINES} lines`);
      }
      const customization = {
        lines: lines.map((l) => ({
          text: l.text,
          color: l.color,
          backgroundColor: l.backgroundColor,
          font: l.font || DEFAULT_FONT,
          weight: l.weight || DEFAULT_WEIGHT,
          letterSpacing: Number.isFinite(Number(l.letterSpacing))
            ? Number(l.letterSpacing)
            : DEFAULT_LETTER_SPACING,
          fontScale: Number(l.fontScale) > 0 ? Number(l.fontScale) : DEFAULT_FONT_SCALE,
          fitWidth: l.fitWidth !== false,
        })),
        backgroundColor,
        border,
        variantId: selectedSize.variantId,
        sizeLabel: selectedSize.label,
        orientation: selectedSize.orientation,
        templateId: activeTemplate,
      };
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customization, variantId: selectedSize.variantId }),
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
      <section className={`panel preview-panel${previewCollapsed ? ' collapsed' : ''}`}>
        <div className="preview-toolbar">
          <h2>Live yard-sign preview</h2>
          <button
            type="button"
            className="btn btn-ghost preview-collapse-btn"
            onClick={() => setPreviewCollapsed((v) => !v)}
            aria-expanded={!previewCollapsed}
          >
            {previewCollapsed ? 'Show preview' : 'Hide preview'}
          </button>
        </div>
        <SignPreview
          lines={lines}
          backgroundColor={backgroundColor}
          orientation={orientation}
          border={border}
          onChangeLine={updateLine}
        />
        <p className="price-tag">{formatPrice(priceCents)}</p>
        <p className="hint" style={{ textAlign: 'center' }}>
          {'24" x 18" · shipping included'}
          <br />
          One-of-one custom print
        </p>
      </section>

      <section className="panel controls-panel">
        <h2>Customize your yard sign</h2>
        {error && <div className="error-banner">{error}</div>}

        <div className="field">
          <label>Starter templates</label>
          <div className="template-grid">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                className={`template-card tone-${template.tone}${
                  activeTemplate === template.id ? ' selected' : ''
                }`}
                onClick={() => applyTemplate(template)}
              >
                <span className="template-name">{template.name}</span>
                <span className="template-blurb">{template.blurb}</span>
              </button>
            ))}
          </div>
          <p className="hint">
            Pick a starting point, then edit anything. Spicy templates are satire — your lawn, your
            call.
          </p>
        </div>

        <div className="field">
          <label htmlFor="bgColor">Sign background</label>
          <div className="row">
            <input
              id="bgColor"
              type="color"
              value={backgroundColor}
              onChange={(e) => {
                setActiveTemplate('custom');
                setBackgroundColor(e.target.value);
              }}
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => {
                setActiveTemplate('custom');
                setBackgroundColor(e.target.value);
              }}
              aria-label="Background color hex"
              style={{ maxWidth: 120 }}
            />
          </div>
        </div>

        <div className="field">
          <label>Inset border</label>
          <div className="row" style={{ flexWrap: 'wrap', gap: '0.65rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={!!border.enabled}
                onChange={(e) => updateBorder({ enabled: e.target.checked })}
                style={{ marginRight: 6 }}
              />
              Show border
            </label>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Color
              <input
                type="color"
                value={border.color || '#ffffff'}
                disabled={!border.enabled}
                onChange={(e) => updateBorder({ color: e.target.value })}
                style={{ marginLeft: 6, verticalAlign: 'middle' }}
              />
            </label>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Thickness
              <input
                type="range"
                min="1"
                max="8"
                value={border.width || 3}
                disabled={!border.enabled}
                onChange={(e) => updateBorder({ width: Number(e.target.value) })}
                style={{ marginLeft: 6, verticalAlign: 'middle' }}
              />
            </label>
          </div>
          <p className="hint">White inset border on black is the classic poster look.</p>
        </div>

        <div className="field">
          <div className="lines-header">
            <label style={{ marginBottom: 0 }}>
              Lines ({lines.length}/{MAX_LINES})
            </label>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={addLine}
              disabled={lines.length >= MAX_LINES}
            >
              + Add line
            </button>
          </div>

          {lines.map((line, i) => (
            <div className="line-editor" key={i}>
              <div className="line-editor-top">
                <div className="line-num">
                  Line {i + 1}
                  {i === 0 ? ' (title)' : ''}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost danger-ghost"
                  onClick={() => removeLine(i)}
                  disabled={lines.length <= MIN_LINES}
                  aria-label={`Delete line ${i + 1}`}
                >
                  Delete
                </button>
              </div>
              <input
                type="text"
                maxLength={120}
                value={line.text}
                placeholder="Enter text..."
                onChange={(e) => updateLine(i, { text: e.target.value })}
                style={{
                  width: '100%',
                  marginBottom: '0.5rem',
                  padding: '0.5rem 0.65rem',
                  borderRadius: 8,
                  border: '1px solid #d4c4b0',
                }}
              />
              <div className="row" style={{ flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Text
                  <input
                    type="color"
                    value={line.color || '#ffffff'}
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
                        ? '#000000'
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
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Font
                  <select
                    value={line.font || 'sans'}
                    onChange={(e) => updateLine(i, { font: e.target.value })}
                    style={{ marginLeft: 6, maxWidth: 140 }}
                    aria-label={`Font for line ${i + 1}`}
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.id} value={f.id} style={{ fontFamily: f.css }}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Weight
                  <select
                    value={line.weight || DEFAULT_WEIGHT}
                    onChange={(e) => updateLine(i, { weight: e.target.value })}
                    style={{ marginLeft: 6 }}
                    aria-label={`Weight for line ${i + 1}`}
                  >
                    {WEIGHT_OPTIONS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="row" style={{ flexWrap: 'wrap', marginTop: '0.45rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={line.fitWidth !== false}
                    onChange={(e) => updateLine(i, { fitWidth: e.target.checked })}
                    style={{ marginRight: 6 }}
                  />
                  Fit width (poster)
                </label>
                <span className="hint" style={{ margin: 0 }}>
                  Size &amp; spacing adjust automatically from your text
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="checkout-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={checkout}
            disabled={busy || shareBusy || !selectedSize}
          >
            {busy ? 'Redirecting to checkout...' : `Buy 24" x 18" — ${formatPrice(priceCents)}`}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={shareDesign}
            disabled={busy || shareBusy}
          >
            {shareBusy ? 'Creating link...' : 'Share design'}
          </button>
          {shareMsg ? (
            <p className="hint" style={{ textAlign: 'center', margin: 0, color: 'var(--accent, #2d6a4f)' }}>
              {shareMsg}
            </p>
          ) : null}
          <p className="hint" style={{ textAlign: 'center', margin: 0 }}>
            Custom corrugated plastic yard sign — printed just for you. Secure checkout via Stripe.
            Share copies a free link (no checkout).
          </p>
        </div>
      </section>
    </div>
  );
}
