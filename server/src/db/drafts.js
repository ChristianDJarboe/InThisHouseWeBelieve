import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../../data');
fs.mkdirSync(dataDir, { recursive: true });
const draftsPath = path.join(dataDir, 'checkout-drafts.json');

function readAll() {
  if (!fs.existsSync(draftsPath)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(draftsPath, 'utf8') || '{}');
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

function writeAll(drafts) {
  fs.writeFileSync(draftsPath, JSON.stringify(drafts, null, 2));
}

/** Save a checkout draft; returns short id safe for Stripe metadata. */
export function saveDraft(customization) {
  const id = randomUUID().replace(/-/g, '').slice(0, 24);
  const drafts = readAll();
  drafts[id] = {
    customization,
    createdAt: new Date().toISOString(),
  };
  // prune drafts older than 7 days
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  for (const [k, v] of Object.entries(drafts)) {
    const t = Date.parse(v?.createdAt || 0);
    if (Number.isFinite(t) && t < cutoff) delete drafts[k];
  }
  writeAll(drafts);
  return id;
}

export function getDraft(id) {
  if (!id) return null;
  const drafts = readAll();
  return drafts[id]?.customization || null;
}

export function deleteDraft(id) {
  if (!id) return;
  const drafts = readAll();
  if (drafts[id]) {
    delete drafts[id];
    writeAll(drafts);
  }
}
