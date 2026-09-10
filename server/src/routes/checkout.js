import { Router } from 'express';
import Stripe from 'stripe';

const router = Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key);
}

const MAX_CUSTOMIZATION_CHARS = 4500;

router.post('/', async (req, res) => {
  try {
    const { customization } = req.body || {};
    if (!customization || !Array.isArray(customization.lines)) {
      return res.status(400).json({ error: 'customization.lines is required' });
    }
    if (customization.lines.length < 3 || customization.lines.length > 12) {
      return res.status(400).json({ error: 'Number of lines must be between 3 and 12' });
    }
    for (const line of customization.lines) {
      if (typeof line.text !== 'string') {
        return res.status(400).json({ error: 'Each line must have a text string' });
      }
      if (line.text.length > 120) {
        return res.status(400).json({ error: 'Each line text must be 120 characters or fewer' });
      }
    }

    const meta = JSON.stringify(customization);
    if (meta.length > MAX_CUSTOMIZATION_CHARS) {
      return res.status(400).json({
        error: 'Customization payload too large for Stripe metadata. Shorten text or remove background image reference.',
      });
    }

    const stripe = getStripe();
    const priceCents = Number(process.env.PRODUCT_PRICE_CENTS || 4999);
    const productName = process.env.PRODUCT_NAME || 'In This House We Believe Sign';
    const publicUrl = (process.env.PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: priceCents,
            product_data: {
              name: productName,
              description: 'Custom personalized wall sign',
            },
          },
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      phone_number_collection: { enabled: true },
      metadata: {
        customization: meta,
      },
      success_url: `${publicUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${publicUrl}/cancel`,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
});

export default router;
