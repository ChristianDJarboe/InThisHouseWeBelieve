import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnv = path.resolve(__dirname, '../../.env');
dotenv.config({ path: rootEnv });
dotenv.config(); // fallback local

import configRouter from './routes/config.js';
import uploadRouter from './routes/upload.js';
import checkoutRouter from './routes/checkout.js';
import webhooksRouter from './routes/webhooks.js';
import ordersRouter from './routes/orders.js';
import shareRouter from './routes/share.js';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: [clientUrl, process.env.PUBLIC_URL].filter(Boolean),
    credentials: true,
  })
);

// Stripe webhook needs raw body — mount BEFORE json parser
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhooksRouter);

app.use(express.json({ limit: '1mb' }));

const uploadsDir = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.use('/api/config', configRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/share', shareRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

// Serve React build in production
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`InThisHouseWeBelieve server listening on port ${PORT}`);
  console.log(`  NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  console.log(`  PUBLIC_URL=${process.env.PUBLIC_URL || '(not set)'}`);
});
