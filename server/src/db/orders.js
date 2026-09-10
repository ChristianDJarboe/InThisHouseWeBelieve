import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../../data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'orders.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    stripe_session_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    customization TEXT,
    amount_cents INTEGER,
    currency TEXT DEFAULT 'usd',
    customer_email TEXT,
    shipping_json TEXT,
    artwork_path TEXT,
    printify_order_id TEXT,
    printify_status TEXT,
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export function createOrder({
  id,
  stripeSessionId,
  status = 'paid',
  customization,
  amountCents,
  currency = 'usd',
  customerEmail,
  shipping,
}) {
  const stmt = db.prepare(`
    INSERT INTO orders (
      id, stripe_session_id, status, customization, amount_cents,
      currency, customer_email, shipping_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    stripeSessionId,
    status,
    typeof customization === 'string' ? customization : JSON.stringify(customization || {}),
    amountCents,
    currency,
    customerEmail || null,
    shipping ? JSON.stringify(shipping) : null
  );
  return getOrderById(id);
}

export function getOrderById(id) {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  return row ? mapOrder(row) : null;
}

export function getOrderByStripeSession(sessionId) {
  const row = db.prepare('SELECT * FROM orders WHERE stripe_session_id = ?').get(sessionId);
  return row ? mapOrder(row) : null;
}

export function updateOrder(id, fields) {
  const allowed = [
    'status',
    'artwork_path',
    'printify_order_id',
    'printify_status',
    'error_message',
    'shipping_json',
    'customer_email',
  ];
  const sets = [];
  const values = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (!sets.length) return getOrderById(id);
  sets.push(`updated_at = datetime('now')`);
  values.push(id);
  db.prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  return getOrderById(id);
}

function mapOrder(row) {
  return {
    id: row.id,
    stripeSessionId: row.stripe_session_id,
    status: row.status,
    customization: safeJson(row.customization),
    amountCents: row.amount_cents,
    currency: row.currency,
    customerEmail: row.customer_email,
    shipping: safeJson(row.shipping_json),
    artworkPath: row.artwork_path,
    printifyOrderId: row.printify_order_id,
    printifyStatus: row.printify_status,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function safeJson(val) {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

export default db;
