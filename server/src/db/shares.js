import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../../data');
fs.mkdirSync(dataDir, { recursive: true });
const sharesPath = path.join(dataDir, 'shares.json');

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function readAll() {
  if (!fs.existsSync(sharesPath)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(sharesPath, 'utf8') || '{}');
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

function writeAll(shares) {
  fs.writeFileSync(sharesPath, JSON.stringify(shares, null, 2));
}

function prune(shares) {
  const cutoff = Date.now() - MAX_AGE_MS;
  for (const [k, v] of Object.entries(shares)) {
    const t = Date.parse(v?.createdAt || 0);
    if (Number.isFinite(t) && t < cutoff) delete shares[k];
  }
  return shares;
}

/** Save a shareable design; returns short id. */
export function saveShare(design) {
  const id = randomUUID().replace(/-/g, '').slice(0, 12);
  const shares = prune(readAll());
  shares[id] = {
    design,
    createdAt: new Date().toISOString(),
  };
  writeAll(shares);
  return id;
}

export function getShare(id) {
  if (!id) return null;
  const shares = readAll();
  const row = shares[id];
  if (!row) return null;
  const t = Date.parse(row.createdAt || 0);
  if (Number.isFinite(t) && Date.now() - t > MAX_AGE_MS) {
    delete shares[id];
    writeAll(shares);
    return null;
  }
  return row.design || null;
}
