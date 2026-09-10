import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import {
  createOrder,
  getOrderByStripeSession,
  updateOrder,
} from '../db/orders.js';
import { generateArtwork } from './artwork.js';
import { uploadImage, createAndSubmitOrder, isPrintifyConfigured } from './printify.js';
import { getDraft, deleteDraft } from '../db/drafts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads');

/**
 * Idempotent fulfillment after Stripe checkout.session.completed.
 */
export async function fulfillCheckoutSession(session) {
  const sessionId = session.id;
  const existing = getOrderByStripeSession(sessionId);
  if (existing) {
    if (existing.status === 'fulfilled' || existing.printifyOrderId) {
      return existing;
    }
    return continueFulfillment(existing, session);
  }

  let customization = {};
  const draftId = session.metadata?.draftId;
  if (draftId) {
    customization = getDraft(draftId) || {};
  } else if (session.metadata?.customization) {
    // legacy sessions that embedded JSON in metadata
    try {
      customization = JSON.parse(session.metadata.customization);
    } catch {
      customization = {};
    }
  }
  if (session.metadata?.variantId && !customization.variantId) {
    customization.variantId = session.metadata.variantId;
  }

  if (customization.backgroundImageUrl) {
    const match = String(customization.backgroundImageUrl).match(/\/uploads\/([^/?#]+)/);
    if (match) {
      const abs = path.join(UPLOADS_DIR, match[1]);
      if (fs.existsSync(abs)) customization.backgroundImagePath = abs;
    }
  }

  const shipping =
    session.shipping_details ||
    session.collected_information?.shipping_details ||
    null;

  const order = createOrder({
    id: uuidv4(),
    stripeSessionId: sessionId,
    status: 'paid',
    customization,
    amountCents: session.amount_total,
    currency: session.currency || 'usd',
    customerEmail: session.customer_details?.email || session.customer_email,
    shipping: {
      name: shipping?.name || session.customer_details?.name,
      email: session.customer_details?.email,
      phone: session.customer_details?.phone || shipping?.phone,
      address: shipping?.address || session.customer_details?.address,
    },
  });

  if (draftId) deleteDraft(draftId);

  return continueFulfillment(order, session);
}

async function continueFulfillment(order, session) {
  try {
    updateOrder(order.id, { status: 'generating_artwork' });

    const artworkPath = await generateArtwork(order.customization || {}, order.id);
    updateOrder(order.id, { artwork_path: artworkPath, status: 'artwork_ready' });

    if (!isPrintifyConfigured()) {
      updateOrder(order.id, {
        status: 'awaiting_printify_config',
        printify_status: 'skipped_missing_credentials',
        error_message:
          'Printify env vars not fully configured. Artwork saved; configure Printify and re-process.',
      });
      return getOrderByStripeSession(session.id);
    }

    updateOrder(order.id, { status: 'uploading_to_printify' });
    const pngBuffer = fs.readFileSync(artworkPath);
    const uploaded = await uploadImage(pngBuffer, `${order.id}.png`);
    const imageId = uploaded.id;

    updateOrder(order.id, { status: 'creating_printify_order' });
    const shipping = order.shipping || {};
    shipping.email = shipping.email || order.customerEmail;

    const customization = order.customization || {};
    const result = await createAndSubmitOrder({
      imageId,
      shipping,
      externalId: order.id.replace(/-/g, '').slice(0, 32),
      label: `ITHWB-${order.id.slice(0, 8)}`,
      variantId: customization.variantId || session?.metadata?.variantId,
      priceCents: session?.amount_total || customization.priceCents,
    });

    updateOrder(order.id, {
      status: result.submitError ? 'printify_submit_pending' : 'fulfilled',
      printify_order_id: String(result.orderId),
      printify_status: result.status || 'submitted',
      error_message: result.submitError || null,
    });

    return getOrderByStripeSession(session.id);
  } catch (err) {
    console.error('Fulfillment error:', err);
    updateOrder(order.id, {
      status: 'fulfillment_error',
      error_message: err.message,
    });
    return getOrderByStripeSession(session.id);
  }
}
