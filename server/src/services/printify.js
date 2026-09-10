/**
 * Printify API client — real HTTP calls to https://api.printify.com/v1
 * Docs: https://developers.printify.com/
 */

const PRINTIFY_BASE = 'https://api.printify.com/v1';

function config() {
  const token = process.env.PRINTIFY_API_TOKEN;
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const blueprintId = process.env.PRINTIFY_BLUEPRINT_ID;
  const printProviderId = process.env.PRINTIFY_PRINT_PROVIDER_ID;
  const variantId = process.env.PRINTIFY_VARIANT_ID;
  if (!token || !shopId) {
    throw new Error('PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID are required');
  }
  return { token, shopId, blueprintId, printProviderId, variantId };
}

async function printifyFetch(path, options = {}) {
  const { token } = config();
  const res = await fetch(`${PRINTIFY_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    const msg = body?.message || body?.error || text || res.statusText;
    const err = new Error(`Printify ${options.method || 'GET'} ${path}: ${res.status} ${msg}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

/**
 * Upload PNG artwork to Printify as an image.
 * Printify accepts base64 via /uploads/images.json
 */
export async function uploadImage(pngBuffer, fileName) {
  const payload = {
    file_name: fileName,
    contents: Buffer.from(pngBuffer).toString('base64'),
  };
  return printifyFetch('/uploads/images.json', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Create a one-off product with the uploaded artwork, then create + submit an order.
 * Uses blueprint/provider/variant from env.
 */
export async function createAndSubmitOrder({
  imageId,
  shipping,
  externalId,
  label,
  variantId: variantIdOverride,
  priceCents: priceCentsOverride,
}) {
  const { shopId, blueprintId, printProviderId, variantId: envVariantId } = config();
  const variantId = variantIdOverride || envVariantId;

  if (!blueprintId || !printProviderId || !variantId) {
    throw new Error(
      'PRINTIFY_BLUEPRINT_ID, PRINTIFY_PRINT_PROVIDER_ID, and a variant id (order or PRINTIFY_VARIANT_ID) are required'
    );
  }

  const priceCents = Number(
    priceCentsOverride || process.env.PRODUCT_PRICE_CENTS || 2999
  );

  // Create a temporary product with custom artwork on the print area
  const productPayload = {
    title: label || 'Custom In This House We Believe Yard Sign',
    description: 'Custom corrugated plastic yard sign',
    blueprint_id: Number(blueprintId),
    print_provider_id: Number(printProviderId),
    variants: [
      {
        id: Number(variantId),
        price: priceCents,
        is_enabled: true,
      },
    ],
    print_areas: [
      {
        variant_ids: [Number(variantId)],
        placeholders: [
          {
            position: 'front',
            images: [
              {
                id: imageId,
                x: 0.5,
                y: 0.5,
                scale: 1,
                angle: 0,
              },
            ],
          },
        ],
      },
    ],
  };

  const product = await printifyFetch(`/shops/${shopId}/products.json`, {
    method: 'POST',
    body: JSON.stringify(productPayload),
  });

  const address = mapShippingAddress(shipping);

  const orderPayload = {
    external_id: String(externalId).slice(0, 32),
    label: label || externalId,
    line_items: [
      {
        product_id: product.id,
        variant_id: Number(variantId),
        quantity: 1,
      },
    ],
    shipping_method: 1,
    is_printify_express: false,
    is_economy_shipping: false,
    send_shipping_notification: true,
    address_to: address,
  };

  const order = await printifyFetch(`/shops/${shopId}/orders.json`, {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  });

  // Submit for production
  let submitted = order;
  try {
    submitted = await printifyFetch(`/shops/${shopId}/orders/${order.id}/send_to_production.json`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  } catch (err) {
    // Some shops auto-submit or send returns empty; keep order id and rethrow if critical
    console.warn('Printify submit warning:', err.message);
    // If order exists, still return it with status note
    return {
      productId: product.id,
      orderId: order.id,
      status: order.status || 'created',
      submitError: err.message,
      raw: { product, order },
    };
  }

  return {
    productId: product.id,
    orderId: order.id || submitted?.id,
    status: submitted?.status || order.status || 'submitted',
    raw: { product, order, submitted },
  };
}

function mapShippingAddress(shipping) {
  // Stripe Checkout shipping_details / collected_information shape
  const addr = shipping?.address || shipping || {};
  const name = shipping?.name || [addr.first_name, addr.last_name].filter(Boolean).join(' ') || 'Customer';

  return {
    first_name: splitName(name).first,
    last_name: splitName(name).last,
    email: shipping?.email || addr.email || 'customer@example.com',
    phone: shipping?.phone || addr.phone || '',
    country: addr.country || 'US',
    region: addr.state || addr.region || '',
    address1: addr.line1 || addr.address1 || '',
    address2: addr.line2 || addr.address2 || '',
    city: addr.city || '',
    zip: addr.postal_code || addr.zip || '',
  };
}

function splitName(full) {
  const parts = String(full || 'Customer').trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '-' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

export function isPrintifyConfigured() {
  return Boolean(
    process.env.PRINTIFY_API_TOKEN &&
      process.env.PRINTIFY_SHOP_ID &&
      process.env.PRINTIFY_BLUEPRINT_ID &&
      process.env.PRINTIFY_PRINT_PROVIDER_ID &&
      process.env.PRINTIFY_VARIANT_ID
  );
}

