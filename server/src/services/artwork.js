import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTWORK_DIR = path.resolve(__dirname, '../../../uploads/artwork');
fs.mkdirSync(ARTWORK_DIR, { recursive: true });

const WIDTH = 2400;
const HEIGHT = 3000;
const MARGIN = 120;

/**
 * Generate a PNG sign artwork from customization payload.
 * @param {object} customization
 * @param {string} orderId
 * @returns {Promise<string>} absolute path to PNG
 */
export async function generateArtwork(customization, orderId) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  const lines = Array.isArray(customization?.lines) ? customization.lines : [];
  const bgColor = customization?.backgroundColor || '#f5f0e6';
  const bgImagePath = customization?.backgroundImagePath;

  // Background fill
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Optional background image
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

  // Decorative border
  ctx.strokeStyle = '#2c1810';
  ctx.lineWidth = 24;
  ctx.strokeRect(40, 40, WIDTH - 80, HEIGHT - 80);
  ctx.lineWidth = 8;
  ctx.strokeRect(70, 70, WIDTH - 140, HEIGHT - 140);

  const usableHeight = HEIGHT - MARGIN * 2;
  const lineCount = Math.max(lines.length, 1);
  const lineHeight = usableHeight / lineCount;

  // Font size scales with line count
  const baseSize = Math.min(140, Math.floor(lineHeight * 0.55));

  lines.forEach((line, i) => {
    const text = (line?.text || '').trim() || ' ';
    const color = line?.color || '#1a1a1a';
    const lineBg = line?.backgroundColor;
    const y = MARGIN + lineHeight * i;
    const centerY = y + lineHeight / 2;

    if (lineBg && lineBg !== 'transparent') {
      ctx.fillStyle = lineBg;
      ctx.fillRect(MARGIN - 20, y + 8, WIDTH - MARGIN * 2 + 40, lineHeight - 16);
    }

    // Slightly larger first line (title style)
    const fontSize = i === 0 ? Math.round(baseSize * 1.15) : baseSize;
    const weight = i === 0 ? 'bold' : 'normal';
    ctx.font = `${weight} ${fontSize}px "Georgia", "Times New Roman", serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Word wrap if needed
    const maxWidth = WIDTH - MARGIN * 2;
    const words = text.split(/\s+/);
    let current = '';
    const wrapped = [];
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        wrapped.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) wrapped.push(current);

    const wrapLineH = fontSize * 1.15;
    const blockH = wrapped.length * wrapLineH;
    let ty = centerY - blockH / 2 + wrapLineH / 2;
    for (const wline of wrapped) {
      ctx.fillText(wline, WIDTH / 2, ty, maxWidth);
      ty += wrapLineH;
    }
  });

  const outPath = path.join(ARTWORK_DIR, `${orderId}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);
  return outPath;
}
