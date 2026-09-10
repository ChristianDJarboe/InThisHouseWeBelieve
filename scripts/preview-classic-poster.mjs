import { generateArtwork } from '../server/src/services/artwork.js';
import { TEMPLATES } from '../client/src/defaults.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const classic = TEMPLATES.find((t) => t.id === 'classic');
const customization = {
  lines: classic.lines,
  backgroundColor: classic.backgroundColor,
  border: classic.border,
  orientation: 'horizontal',
};
const out = await generateArtwork(customization, 'preview-classic-poster');
console.log(JSON.stringify({ out, bytes: fs.statSync(out).size }));
