import { Router } from 'express';
import { getOrderById, getOrderByStripeSession } from '../db/orders.js';

const router = Router();

router.get('/:id', (req, res) => {
  const { id } = req.params;
  let order = getOrderById(id);
  if (!order && id.startsWith('cs_')) {
    order = getOrderByStripeSession(id);
  }
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  // Public-safe fields only
  res.json({
    id: order.id,
    status: order.status,
    printifyStatus: order.printifyStatus,
    amountCents: order.amountCents,
    currency: order.currency,
    customerEmail: order.customerEmail,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    errorMessage: order.status === 'fulfillment_error' ? order.errorMessage : undefined,
  });
});

export default router;
