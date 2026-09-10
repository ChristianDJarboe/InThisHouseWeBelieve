# In This House We Believe

Customizable **"In this house we believe"** signs — React + Node.js, **Stripe Checkout**, and **Printify** print-on-demand fulfillment.

The shop owner only needs to edit `.env` with API secrets and product IDs. Designed to self-host later on a PC (or any Node host) behind Caddy/nginx.

## Stack

| Layer | Tech |
|-------|------|
| Client | React 18 + Vite (`client/`) |
| Server | Node.js + Express (`server/`) |
| DB | SQLite via `better-sqlite3` (`data/orders.db`) |
| Payments | Stripe Checkout + webhooks |
| Fulfillment | Printify API (upload artwork → product → order → submit) |
| Artwork | Server-side PNG via `@napi-rs/canvas` |

## Quick start

```bash
# From repo root
npm install
cp .env.example .env
# Edit .env with Stripe + Printify values (see below)

npm run dev
# API:  http://localhost:3000
# Vite: http://localhost:5173  (proxies /api and /uploads)
```

Open http://localhost:5173 — customize a sign and checkout (Stripe test mode).

### Production build / start

```bash
npm run build          # builds client → client/dist
NODE_ENV=production npm start   # Express serves API + static client on PORT
```

Set `PUBLIC_URL` to your public HTTPS origin (used for Checkout return URLs).

## Environment variables

Copy `.env.example` → `.env`. All variables are documented there. Summary:

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default `3000`) |
| `NODE_ENV` | `development` / `production` |
| `PUBLIC_URL` | Public app URL (success/cancel + webhook base) |
| `CLIENT_URL` | Vite origin in dev (CORS) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Published to client via `GET /api/config` |
| `STRIPE_WEBHOOK_SECRET` | From Dashboard or `stripe listen` |
| `PRODUCT_PRICE_CENTS` | Unit price in cents |
| `PRODUCT_NAME` | Checkout line item name |
| `PRINTIFY_API_TOKEN` | Printify API token |
| `PRINTIFY_SHOP_ID` | Shop ID |
| `PRINTIFY_BLUEPRINT_ID` | Catalog blueprint (product type) |
| `PRINTIFY_PRINT_PROVIDER_ID` | Print provider for that blueprint |
| `PRINTIFY_VARIANT_ID` | Size/material variant to sell |
| `MAX_UPLOAD_MB` | Optional upload limit (default 5) |

**Never commit `.env`.** It is gitignored.

## Stripe setup

1. Create a [Stripe](https://dashboard.stripe.com) account → Developers → API keys (use **test** keys first).
2. Put `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in `.env`.
3. Local webhooks:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   Copy the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`.

4. Production: add an endpoint in Stripe Dashboard pointing to  
   `https://YOUR_DOMAIN/api/webhooks/stripe`  
   for event `checkout.session.completed`, and set the signing secret in `.env`.

## Printify setup (how to get IDs)

1. Create a [Printify](https://printify.com) shop and generate an **API token**  
   (Account → Connections → API / https://printify.com/app/account/api).
2. **Shop ID** — `GET https://api.printify.com/v1/shops.json` with  
   `Authorization: Bearer YOUR_TOKEN`, or copy from the Printify URL/UI.
3. Pick a blank product (canvas, metal print, poster, etc.):
   - **Blueprint ID** — catalog product type  
     `GET /v1/catalog/blueprints.json`
   - **Print provider ID** —  
     `GET /v1/catalog/blueprints/{blueprint_id}/print_providers.json`
   - **Variant ID** —  
     `GET /v1/catalog/blueprints/{blueprint_id}/print_providers/{provider_id}/variants.json`  
     Choose the size/SKU you want to sell.

Put those four values in `.env`. On each successful Stripe payment the server:

1. Creates an idempotent local order (keyed by Stripe session id)
2. Renders a high-res PNG of the customization
3. Uploads the image to Printify
4. Creates a shop product with that artwork
5. Creates a Printify order with the Checkout shipping address
6. Submits the order for production (`/send.json`)

If Printify credentials are incomplete, artwork is still saved and the order status becomes `awaiting_printify_config`.

## API

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/api/config` | Publishable key, price (no secrets) |
| `POST` | `/api/upload` | Multipart field `image` → `/uploads/…` |
| `POST` | `/api/checkout` | Body `{ customization }` → Stripe session URL |
| `POST` | `/api/webhooks/stripe` | **Raw body**; `checkout.session.completed` |
| `GET` | `/api/orders/:id` | Order status (UUID or `cs_…` session id) |
| `GET` | `/api/health` | Liveness |

Customization shape:

```json
{
  "lines": [
    { "text": "In this house we believe:", "color": "#1a1a1a", "backgroundColor": "transparent" }
  ],
  "backgroundColor": "#f5f0e6",
  "backgroundImageUrl": "/uploads/optional.png"
}
```

Lines: **3–12**. Each line text ≤ 120 chars.

## Reverse proxy (self-host)

Point your domain at the Node process (default port 3000). Forward raw body for the Stripe webhook path.

### Caddy example

```caddyfile
shop.example.com {
  reverse_proxy 127.0.0.1:3000
}
```

### nginx example

```nginx
server {
  listen 443 ssl;
  server_name shop.example.com;
  # ssl_certificate …;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Then set:

```env
PUBLIC_URL=https://shop.example.com
CLIENT_URL=https://shop.example.com
NODE_ENV=production
```

Run under systemd, PM2, or Docker as you prefer. Keep `data/` and `uploads/` on persistent disk.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Concurrently Express (`--watch`) + Vite |
| `npm run build` | Production client build |
| `npm start` | Start Express (serves `client/dist` if present) |

## Project layout

```
├── client/               # React + Vite UI + live sign mockup
├── server/               # Express API, Stripe, Printify, artwork
├── data/                 # SQLite DB (gitignored contents)
├── uploads/              # User images + generated artwork
├── .env.example
├── package.json          # workspaces + concurrently
└── README.md
```

## License

Private / all rights reserved unless otherwise noted by the repository owner.
