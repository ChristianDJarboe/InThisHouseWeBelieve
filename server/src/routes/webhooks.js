import { Router } from 'express';
import Stripe from 'stripe';
import { fulfillCheckoutSession } from '../services/fulfillment.js';

const router = Router();

router.post('/stripe', async (req, res) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey) {
    return res.status(500).send('Stripe not configured');
  }

  const stripe = new Stripe(stripeKey);
  let event;

  try {
    if (webhookSecret) {
      const sig = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else if (process.env.NODE_ENV === 'development') {
      // Allow unsigned events only in development for easier local testing
      event = typeof req.body === 'string' || Buffer.isBuffer(req.body)
        ? JSON.parse(req.body.toString())
        : req.body;
      console.warn('STRIPE_WEBHOOK_SECRET missing — accepting unsigned webhook (dev only)');
    } else {
      return res.status(500).send('STRIPE_WEBHOOK_SECRET required');
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      // Retrieve full session for shipping details
      const full = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['customer_details'],
      });
      await fulfillCheckoutSession(full);
    } catch (err) {
      console.error('Fulfillment failed:', err);
      // Still 200 so Stripe does not retry forever for app bugs; order stores error
    }
  }

  res.json({ received: true });
});

export default router;
