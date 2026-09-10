import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../../data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'orders.json');

function readAll() {
  if (!fs.existsSync(dbPath)) return [];
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    const data = JSON.parse(raw || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeAll(orders) {
  fs.writeFileSync(dbPath, JSON.stringify(orders, null, 2));
}

function nowIso() {
  return new Date().toISOString();
}

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
  const orders = readAll();
  if (orders.some((o) => o.stripeSessionId === stripeSessionId)) {
    return getOrderByStripeSession(stripeSessionId);
  }
  const order = {
    id,
    stripeSessionId,
    status,
    customization: customization || {},
    amountCents,
    currency,
    customerEmail: customerEmail || null,
    shipping: shipping || null,
    artworkPath: null,
    printifyOrderId: null,
    printifyStatus: null,
    errorMessage: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  orders.push(order);
  writeAll(orders);
  return getOrderById(id);
}

export function getOrderById(id) {
  return readAll().find((o) => o.id === id) || null;
}

export function getOrderByStripeSession(sessionId) {
  return readAll().find((o) => o.stripeSessionId === sessionId) || null;
}

export function updateOrder(id, fields) {
  const orders = readAll();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  const allowed = [
    'status',
    'artworkPath',
    'printifyOrderId',
    'printifyStatus',
    'errorMessage',
    'shipping',
    'customerEmail',
  ];
  // Accept snake_case from older call sites
  const map = {
    artwork_path: 'artworkPath',
    printify_order_id: 'printifyOrderId',
    printify_status: 'printifyStatus',
    error_message: 'errorMessage',
    shipping_json: 'shipping',
    customer_email: 'customerEmail',
  };
  const next = { ...orders[idx] };
  for (const [key, value] of Object.entries(fields || {})) {
    const dest = map[key] || key;
    if (allowed.includes(dest) || allowed.includes(key)) {
      const finalKey = allowed.includes(dest) ? dest : key;
      if (finalKey === 'shipping' && typeof value === 'string') {
        try {
          next.shipping = JSON.parse(value);
        } catch {
          next.shipping = value;
        }
      } else {
        next[finalKey] = value;
      }
    }
  }
  next.updatedAt = nowIso();
  orders[idx] = next;
  writeAll(orders);
  return getOrderById(id);
}
