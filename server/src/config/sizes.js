/**
 * Product sizes for Plastic Yard Sign.
 * Shop sells one size only: 24" x 18" horizontal.
 * Price is all-in for US (print + typical shipping baked in).
 */

const DEFAULT_SIZES = [
  { variantId: '92132', label: '24" x 18" Horizontal', priceCents: 4000, orientation: 'horizontal' },
];

export function getProductSizes() {
  const raw = process.env.PRODUCT_SIZES_JSON;
  if (raw && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map(normalizeSize).filter(Boolean);
      }
    } catch (err) {
      console.warn('PRODUCT_SIZES_JSON parse error, using defaults:', err.message);
    }
  }
  return DEFAULT_SIZES.map((s) => ({ ...s }));
}

function normalizeSize(s) {
  if (!s || s.variantId == null) return null;
  const priceCents = Number(s.priceCents);
  if (!Number.isFinite(priceCents) || priceCents < 50) return null;
  const orientation =
    s.orientation === 'vertical' || /vertical/i.test(String(s.label || ''))
      ? 'vertical'
      : 'horizontal';
  return {
    variantId: String(s.variantId),
    label: String(s.label || `Size ${s.variantId}`),
    priceCents: Math.round(priceCents),
    orientation,
  };
}

export function findSize(variantId) {
  const id = String(variantId || '');
  const sizes = getProductSizes();
  return sizes.find((s) => s.variantId === id) || sizes[0] || null;
}

export function getDefaultSize() {
  return getProductSizes()[0] || null;
}