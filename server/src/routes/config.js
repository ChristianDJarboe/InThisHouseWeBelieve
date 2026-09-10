import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    priceCents: Number(process.env.PRODUCT_PRICE_CENTS || 4999),
    productName: process.env.PRODUCT_NAME || 'In This House We Believe Sign',
    maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 5),
  });
});

export default router;
