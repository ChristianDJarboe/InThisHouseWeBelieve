import { Router } from 'express';
import Stripe from 'stripe';
import { findSize, getDefaultSize } from '../config/sizes.js';
import { saveDraft } from '../db/drafts.js';

const router = Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key);
}

router.post('/', async (req, res) => {
  try {
    const { customization, variantId: requestedVariantId } = req.body || {};
    if (!customization || !Array.isArray(customization.lines)) {
      return res.status(400).json({ error: 'customization.lines is required' });
    }
    if (customization.lines.length < 1 || customization.lines.length > 10) {
      return res.status(400).json({ error: 'Number of lines must be between 1 and 10' });
    }
    for (const line of customization.lines) {
      if (typeof line.text !== 'string') {
        return res.status(400).json({ error: 'Each line must have a text string' });
      }
      if (line.text.length > 120) {
        return res.status(400).json({ error: 'Each line text must be 120 characters or fewer' });
      }
    }

    const size =
      findSize(requestedVariantId || customization.variantId) || getDefaultSize();
    if (!size) {
      return res.status(500).json({ error: 'No product sizes configured' });
    }

    // Trust server catalog only — never client-supplied price
    customization.variantId = size.variantId;
    customization.sizeLabel = size.label;
    customization.orientation = size.orientation;

    // Stripe metadata values max out at 500 chars — store full design locally
    const draftId = saveDraft(customization);

    const stripe = getStripe();
    const productName = process.env.PRODUCT_NAME || 'In This House We Believe Plastic Yard Sign';
    const publicUrl = (process.env.PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: size.priceCents,
            product_data: {
              name: `${productName} — ${size.label}`,
              description: 'Custom corrugated plastic yard sign',
            },
          },
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      phone_number_collection: { enabled: true },
      customer_creation: 'always',
      // Stripe Dashboard → Settings → Customer emails → Successful payments also needed for receipts
      metadata: {
        draftId,
        variantId: size.variantId,
        priceCents: String(size.priceCents),
      },
      success_url: `${publicUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${publicUrl}/cancel`,
    });

    res.json({
      url: session.url,
      sessionId: session.id,
      variantId: size.variantId,
      priceCents: size.priceCents,
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
});

export default router;

