import { Router } from 'express';
import { getProductSizes, getDefaultSize } from '../config/sizes.js';

const router = Router();

router.get('/', (_req, res) => {
  const sizes = getProductSizes();
  const defaultSize = getDefaultSize();
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    productName: process.env.PRODUCT_NAME || 'In This House We Believe Plastic Yard Sign',
    maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 5),
    sizes,
    defaultVariantId: defaultSize?.variantId || null,
    // convenience for older clients
    priceCents: defaultSize?.priceCents || Number(process.env.PRODUCT_PRICE_CENTS || 2999),
  });
});

export default router;
