import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { getFont } from '../fonts.js';
import { getWeight, DEFAULT_BORDER, DEFAULT_LETTER_SPACING } from '../defaults.js';

function fontSizeForLine(line, lineCount, orientation, isTitle) {
  const count = Math.max(lineCount, 1);
  const faceHeight = orientation === 'vertical' ? 320 : 210;
  const faceWidth = orientation === 'vertical' ? 210 : 360;
  const heightBudget = faceHeight / count;
  const text = line?.text || '';
  const len = Math.max(text.trim().length, 1);
  const scale = Number(line?.fontScale) > 0 ? Number(line.fontScale) : 1;
  const tracking = Number.isFinite(Number(line?.letterSpacing))
    ? Number(line.letterSpacing)
    : DEFAULT_LETTER_SPACING;
  const glyphEm = 0.58 + tracking * 0.5;

  let size = Math.min(isTitle ? 28 : 24, heightBudget * 0.72);
  if (len > faceWidth / (size * glyphEm)) size = faceWidth / (len * glyphEm);
  if (count >= 7) size *= 0.92;
  if (count >= 9) size *= 0.9;
  size *= scale;
  const minSize = count >= 8 ? 5.5 : 6.5;
  return Math.max(minSize, Math.min(heightBudget * 0.85, size));
}

function measureTextWidth(text, fontCss, fontWeight, fontSizePx, trackingEm) {
  const canvas = measureTextWidth._c || (measureTextWidth._c = document.createElement('canvas'));
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontWeight} ${fontSizePx}px ${fontCss}`;
  if (!trackingEm) return ctx.measureText(text).width;
  const chars = [...text];
  let w = 0;
  for (let i = 0; i < chars.length; i++) {
    w += ctx.measureText(chars[i]).width;
    if (i < chars.length - 1) w += trackingEm * fontSizePx;
  }
  return w;
}

/**
 * Sharp fit-to-width: size within the line band, open tracking, then mild scaleX to flush L-R.
 */
function FitWidthText({
  displayText,
  color,
  fontCss,
  fontWeight,
  baseTracking,
  heightBudget,
  fontScale = 1,
  editing,
  inputProps,
}) {
  const wrapRef = useRef(null);
  const [fontSize, setFontSize] = useState(Math.max(8, heightBudget * 0.7));
  const [tracking, setTracking] = useState(baseTracking);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      const target = wrap.clientWidth;
      if (target < 8) return;

      const sample = (displayText || ' ').trim() || ' ';
      const scale = Number(fontScale) > 0 ? Math.min(Number(fontScale), 1.8) : 1;
      // Same flush behavior as the earlier "perfect" preview: grow within width,
      // open tracking to hit the L/R edges. Print stays separately band-capped.
      const maxSize = Math.max(10, heightBudget * 0.98 * scale);
      const minSize = 6;
      let track = baseTracking;

      let lo = minSize;
      let hi = maxSize;
      for (let i = 0; i < 20; i++) {
        const mid = (lo + hi) / 2;
        const w = measureTextWidth(sample, fontCss, fontWeight, mid, track);
        if (w <= target) lo = mid;
        else hi = mid;
      }
      let size = lo;
      let measured = measureTextWidth(sample, fontCss, fontWeight, size, track);

      // Still short at max height — open tracking until flush (no scaleX)
      if (size >= maxSize * 0.98 && measured < target * 0.995) {
        let tLo = track;
        let tHi = 0.55;
        for (let i = 0; i < 18; i++) {
          const mid = (tLo + tHi) / 2;
          const w = measureTextWidth(sample, fontCss, fontWeight, size, mid);
          if (w < target) tLo = mid;
          else tHi = mid;
        }
        track = tLo;
        measured = measureTextWidth(sample, fontCss, fontWeight, size, track);
      }

      while (size > minSize && measureTextWidth(sample, fontCss, fontWeight, size, track) > target) {
        size *= 0.98;
      }

      setFontSize(size);
      setTracking(track);
    };

    measure();
    const raf = requestAnimationFrame(() => measure());
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => measure()).catch(() => {});
    }
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measure()) : null;
    if (ro) ro.observe(wrap);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    };
  }, [displayText, fontCss, fontWeight, baseTracking, heightBudget, fontScale]);

  const style = {
    color,
    fontFamily: fontCss,
    fontWeight,
    fontSize: `${fontSize}px`,
    letterSpacing: `${tracking}em`,
    width: '100%',
    textAlign: 'center',
    textRendering: 'geometricPrecision',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  };

  return (
    <div className="fit-width-wrap" ref={wrapRef}>
      {editing ? (
        <input className="sign-line-input" style={style} {...inputProps} />
      ) : (
        <span className="sign-line-text" style={style}>
          {displayText || '·'}
        </span>
      )}
    </div>
  );
}

function EditableLine({
  line,
  index,
  isTitle,
  size,
  heightBudget,
  editing,
  onStartEdit,
  onChangeText,
  onCommit,
  onCancel,
}) {
  const inputRef = useRef(null);
  const weight = getWeight(line.weight);
  const tracking = Number.isFinite(Number(line?.letterSpacing))
    ? Number(line.letterSpacing)
    : DEFAULT_LETTER_SPACING;
  const fontCss = getFont(line.font).css;
  const raw = line.text || '';
  const displayText = line.fitWidth ? raw.toUpperCase() : raw;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      const el = inputRef.current;
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, [editing]);

  const baseStyle = {
    color: line.color || '#ffffff',
    backgroundColor:
      line.backgroundColor && line.backgroundColor !== 'transparent'
        ? line.backgroundColor
        : undefined,
  };

  const inputProps = {
    ref: inputRef,
    value: line.text || '',
    onChange: (e) => onChangeText(index, e.target.value),
    onBlur: () => onCommit(index),
    onClick: (e) => e.stopPropagation(),
    onKeyDown: (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel(index);
      }
    },
    'aria-label': `Line ${index + 1} text`,
  };

  return (
    <div
      className={`sign-line${isTitle ? ' title-line' : ''}${editing ? ' editing' : ' editable'}${line.fitWidth ? ' fit-width' : ''}`}
      style={
        line.fitWidth
          ? baseStyle
          : {
              ...baseStyle,
              fontSize: `${size}px`,
              fontFamily: fontCss,
              fontWeight: weight.css,
              letterSpacing: `${tracking}em`,
            }
      }
      onClick={() => {
        if (!editing) onStartEdit(index);
      }}
      role={editing ? undefined : 'button'}
      tabIndex={editing ? undefined : 0}
      onKeyDown={(e) => {
        if (!editing && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onStartEdit(index);
        }
      }}
      title={editing ? undefined : 'Click to edit'}
      aria-label={editing ? undefined : `Edit line ${index + 1}`}
    >
      {line.fitWidth ? (
        <FitWidthText
          displayText={displayText || ' '}
          color={line.color || '#ffffff'}
          fontCss={fontCss}
          fontWeight={weight.css}
          baseTracking={tracking}
          heightBudget={heightBudget}
          fontScale={line.fontScale}
          editing={editing}
          inputProps={inputProps}
        />
      ) : editing ? (
        <input className="sign-line-input" {...inputProps} />
      ) : (
        <span className="sign-line-text">{raw || ' '}</span>
      )}
    </div>
  );
}

export default function SignPreview({
  lines,
  backgroundColor,
  backgroundImageUrl,
  orientation = 'horizontal',
  border,
  onChangeLine,
}) {
  const list = lines || [];
  const count = Math.max(list.length, 1);
  const [editingIndex, setEditingIndex] = useState(null);
  const draftBeforeEdit = useRef('');
  const b = { ...DEFAULT_BORDER, ...(border || {}) };
  const faceHeight = orientation === 'vertical' ? 320 : 210;
  const heightBudget = faceHeight / count;
  const allStriped =
    list.length > 0 &&
    list.every((l) => l?.backgroundColor && l.backgroundColor !== 'transparent');

  const faceStyle = {
    backgroundColor: backgroundColor || '#000000',
    backgroundImage: backgroundImageUrl
      ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${backgroundImageUrl})`
      : undefined,
    backgroundSize: backgroundImageUrl ? 'cover' : undefined,
    backgroundPosition: backgroundImageUrl ? 'center' : undefined,
    boxShadow: b.enabled
      ? `inset 0 0 0 ${Math.max(1, Number(b.width) || 3)}px ${b.color || '#ffffff'}`
      : undefined,
  };

  const startEdit = (index) => {
    if (typeof onChangeLine !== 'function') return;
    draftBeforeEdit.current = list[index]?.text || '';
    setEditingIndex(index);
  };

  const changeText = (index, text) => onChangeLine?.(index, { text });
  const commit = () => setEditingIndex(null);
  const cancel = (index) => {
    onChangeLine?.(index, { text: draftBeforeEdit.current });
    setEditingIndex(null);
  };

  return (
    <div className="mockup-stage">
      <div className={`yard-sign ${orientation}`} aria-label="Plastic yard sign preview">
        <div className={`sign-face plastic poster ${orientation}${allStriped ? ' striped' : ''}`} style={faceStyle}>
          <div className="plastic-flute" aria-hidden="true" />
          {list.map((line, i) => {
            const isTitle = i === 0;
            const size = fontSizeForLine(line, count, orientation, isTitle);
            return (
              <EditableLine
                key={i}
                line={line}
                index={i}
                isTitle={isTitle}
                size={size}
                heightBudget={heightBudget}
                editing={editingIndex === i}
                onStartEdit={startEdit}
                onChangeText={changeText}
                onCommit={commit}
                onCancel={cancel}
              />
            );
          })}
        </div>
        <div className="yard-stakes" aria-hidden="true">
          <span className="stake" />
          <span className="stake" />
        </div>
      </div>
      <p className="mockup-caption">
        {typeof onChangeLine === 'function'
          ? 'Click a line to edit · corrugated plastic · double-sided'
          : 'Corrugated plastic yard sign · double-sided print'}
      </p>
    </div>
  );
}
