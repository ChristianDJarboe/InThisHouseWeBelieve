import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTWORK_DIR = path.resolve(__dirname, '../../../uploads/artwork');
fs.mkdirSync(ARTWORK_DIR, { recursive: true });

const CANVAS_FONTS = {
  serif: 'Georgia',
  sans: 'Arial',
  impact: 'Impact',
  condensed: 'Arial Narrow',
  slab: 'Georgia',
  mono: 'Courier New',
  script: 'Segoe Script',
  comic: 'Comic Sans MS',
};

function canvasFontFamily(fontId) {
  return CANVAS_FONTS[fontId] || CANVAS_FONTS.sans;
}

function canvasWeight(weightId) {
  if (weightId === 'light') return '300';
  if (weightId === 'regular') return '400';
  if (weightId === 'black') return '900';
  return 'bold';
}

function canvasSize(orientation) {
  if (orientation === 'vertical') return { WIDTH: 2400, HEIGHT: 3600 };
  return { WIDTH: 3600, HEIGHT: 2400 };
}

function measureWithTracking(ctx, text, fontSize, trackingEm) {
  if (!trackingEm) return ctx.measureText(text).width;
  const chars = [...text];
  let w = 0;
  for (let i = 0; i < chars.length; i++) {
    w += ctx.measureText(chars[i]).width;
    if (i < chars.length - 1) w += trackingEm * fontSize;
  }
  return w;
}

function fillTextWithTracking(ctx, text, cx, cy, fontSize, trackingEm) {
  if (!trackingEm) {
    ctx.fillText(text, cx, cy);
    return;
  }
  const total = measureWithTracking(ctx, text, fontSize, trackingEm);
  let x = cx - total / 2;
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const cw = ctx.measureText(ch).width;
    ctx.fillText(ch, x + cw / 2, cy);
    x += cw + trackingEm * fontSize;
  }
}

/**
 * Generate a PNG sign artwork from customization payload.
 * fitWidth lines fill the same left→right text box (short copy gets bigger).
 */
export async function generateArtwork(customization, orderId) {
  const { WIDTH, HEIGHT } = canvasSize(customization?.orientation);
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  const lines = Array.isArray(customization?.lines) ? customization.lines : [];
  const bgColor = customization?.backgroundColor || '#000000';
  const bgImagePath = customization?.backgroundImagePath;
  const border = customization?.border || { enabled: true, color: '#ffffff', width: 3 };

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (bgImagePath && fs.existsSync(bgImagePath)) {
    try {
      const img = await loadImage(bgImagePath);
      const scale = Math.max(WIDTH / img.width, HEIGHT / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.globalAlpha = 0.35;
      ctx.drawImage(img, (WIDTH - w) / 2, (HEIGHT - h) / 2, w, h);
      ctx.globalAlpha = 1;
    } catch (err) {
      console.warn('Background image load failed:', err.message);
    }
  }

  const inset = border?.enabled ? Math.round(Math.min(WIDTH, HEIGHT) * 0.028) : 0;
  const bw = border?.enabled
    ? Math.max(8, Math.round((Number(border.width) || 3) * (WIDTH / 400)))
    : 0;

  const lineCount = Math.max(lines.length, 1);
  const allStriped = lines.length > 0 && lines.every(
    (l) => l?.backgroundColor && l.backgroundColor !== 'transparent'
  );

  // Text box sits just inside the border (stripes can full-bleed behind it)
  const padX = inset + bw + Math.round(WIDTH * 0.035);
  const padY = allStriped
    ? inset + bw
    : inset + bw + Math.round(HEIGHT * 0.028);
  const usableW = WIDTH - padX * 2;
  const usableH = HEIGHT - padY * 2;

  // Full-bleed color bands first so no face background shows between lines
  if (allStriped) {
    lines.forEach((line, i) => {
      const y0 = Math.round((HEIGHT * i) / lineCount);
      const y1 = Math.round((HEIGHT * (i + 1)) / lineCount);
      ctx.fillStyle = line.backgroundColor;
      ctx.fillRect(0, y0, WIDTH, Math.max(1, y1 - y0));
    });
  }

  if (border?.enabled) {
    ctx.strokeStyle = border.color || '#ffffff';
    ctx.lineWidth = bw;
    ctx.strokeRect(inset, inset, WIDTH - inset * 2, HEIGHT - inset * 2);
  }

  lines.forEach((line, i) => {
    const rawText = (line?.text || '').trim() || ' ';
    const fitWidth = !!line?.fitWidth;
    const text = fitWidth ? rawText.toUpperCase() : rawText;
    const color = line?.color || '#ffffff';
    const lineBg = line?.backgroundColor;
    const y0 = padY + Math.round((usableH * i) / lineCount);
    const y1 = padY + Math.round((usableH * (i + 1)) / lineCount);
    const bandH = y1 - y0;
    const centerY = y0 + bandH / 2;

    if (!allStriped && lineBg && lineBg !== 'transparent') {
      ctx.fillStyle = lineBg;
      ctx.fillRect(0, y0, WIDTH, bandH);
    }


        const family = canvasFontFamily(line?.font || 'sans');
    const weight = canvasWeight(line?.weight);
    const tracking = Number.isFinite(Number(line?.letterSpacing))
      ? Number(line.letterSpacing)
      : -0.04;
    const fontScale = Number(line?.fontScale) > 0 ? Number(line.fontScale) : 1;

    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (fitWidth) {
      const targetW = usableW; // every line shares the same L→R edges
      // fontScale biases size inside the band; never taller than ~90% of band (prod-safe)
      const maxSize = Math.min(bandH * 0.9, bandH * 0.72 * Math.min(fontScale, 1.45));
      const minSize = 18;
      let lo = minSize;
      let hi = maxSize;
      for (let n = 0; n < 24; n++) {
        const mid = (lo + hi) / 2;
        ctx.font = `${weight} ${mid}px "${family}", Arial, sans-serif`;
        const measured = measureWithTracking(ctx, text, mid, tracking);
        if (measured <= targetW) lo = mid;
        else hi = mid;
      }
      let fontSize = lo;
      // Grow to fill if still short (then scaleX)
      ctx.font = `${weight} ${fontSize}px "${family}", Arial, sans-serif`;
      let measured = measureWithTracking(ctx, text, fontSize, tracking);
      while (fontSize < maxSize && measured < targetW * 0.995) {
        fontSize = Math.min(maxSize, fontSize * 1.03);
        ctx.font = `${weight} ${fontSize}px "${family}", Arial, sans-serif`;
        measured = measureWithTracking(ctx, text, fontSize, tracking);
        if (measured >= targetW) break;
      }
      ctx.font = `${weight} ${fontSize}px "${family}", Arial, sans-serif`;
      measured = measureWithTracking(ctx, text, fontSize, tracking);
      // Stretch horizontally so every line shares the same L→R edges
      const sx = measured > 0 ? targetW / measured : 1;

      ctx.save();
      ctx.translate(WIDTH / 2, centerY);
      ctx.scale(sx, 1);
      ctx.font = `${weight} ${fontSize}px "${family}", Arial, sans-serif`;
      fillTextWithTracking(ctx, text, 0, 0, fontSize, tracking);
      ctx.restore();
    } else {
      let fontSize = Math.min(160, Math.floor(bandH * 0.55 * fontScale));
      ctx.font = `${weight} ${fontSize}px "${family}", Arial, sans-serif`;
      while (fontSize > 18 && measureWithTracking(ctx, text, fontSize, tracking) > usableW) {
        fontSize -= 4;
        ctx.font = `${weight} ${fontSize}px "${family}", Arial, sans-serif`;
      }
      fillTextWithTracking(ctx, text, WIDTH / 2, centerY, fontSize, tracking);
    }
  });

  const outPath = path.join(ARTWORK_DIR, `${orderId}.png`);
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  return outPath;
}
