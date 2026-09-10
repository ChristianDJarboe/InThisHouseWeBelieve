import { generateArtwork } from '../server/src/services/artwork.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const ROYGBIV = [
  { hex: '#E40303', text: '#ffffff' },
  { hex: '#FF8C00', text: '#ffffff' },
  { hex: '#FFED00', text: '#1a1a1a' },
  { hex: '#008026', text: '#ffffff' },
  { hex: '#24408E', text: '#ffffff' },
  { hex: '#732982', text: '#ffffff' },
  { hex: '#9B4F96', text: '#ffffff' },
];

const texts = [
  'In this house we believe:',
  'Love is love',
  'Black lives matter',
  'Science is real',
  "Women's rights are human rights",
  'No human is illegal',
  'Kindness is everything',
  'Dogs get the couch',
  'We leave things better',
  'Coffee before conversation',
];

const lines = texts.map((text, i) => {
  const s = ROYGBIV[i % ROYGBIV.length];
  return { text, color: s.text, backgroundColor: s.hex, font: 'serif' };
});

const customization = {
  lines,
  backgroundColor: '#ffffff',
  orientation: 'horizontal',
  variantId: '92131',
  sizeLabel: '18" x 12" Horizontal',
};

const out = await generateArtwork(customization, 'preview-ten-lines');
const final = path.join(root, 'uploads', 'artwork', 'preview-ten-lines.png');
if (out !== final) fs.copyFileSync(out, final);
console.log(JSON.stringify({ outPath: final, lines: lines.length, bytes: fs.statSync(final).size }));
