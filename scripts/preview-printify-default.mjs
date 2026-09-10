import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(root, ".env") });

const artworkUrl = pathToFileURL(path.join(root, "server", "src", "services", "artwork.js")).href;
const { generateArtwork } = await import(artworkUrl);

const customization = {
  orientation: "horizontal",
  backgroundColor: "#ffffff",
  variantId: process.env.PRINTIFY_VARIANT_ID || "92131",
  sizeLabel: '18" x 12" Horizontal',
  lines: [
    { text: "In this house we believe:", color: "#ffffff", backgroundColor: "#E40303", font: "serif" },
    { text: "Love is love", color: "#ffffff", backgroundColor: "#FF8C00", font: "serif" },
    { text: "Black lives matter", color: "#1a1a1a", backgroundColor: "#FFED00", font: "serif" },
    { text: "Science is real", color: "#ffffff", backgroundColor: "#008026", font: "serif" },
    { text: "Women's rights are human rights", color: "#ffffff", backgroundColor: "#24408E", font: "serif" },
    { text: "No human is illegal", color: "#ffffff", backgroundColor: "#732982", font: "serif" },
    { text: "Kindness is everything", color: "#ffffff", backgroundColor: "#9B4F96", font: "serif" },
  ],
};

const outPath = await generateArtwork(customization, "preview-default");
const shopId = process.env.PRINTIFY_SHOP_ID;
const blueprintId = Number(process.env.PRINTIFY_BLUEPRINT_ID);
const printProviderId = Number(process.env.PRINTIFY_PRINT_PROVIDER_ID);
const variantId = Number(customization.variantId);
const priceCents = 4999;

const payload = {
  note: "Dry-run of what fulfillment sends after Stripe payment for Classic template + default 18x12 size. No Printify API calls were made.",
  artwork: {
    localPath: outPath,
    bytes: fs.statSync(outPath).size,
    widthHint: "3600x2400 horizontal PNG",
  },
  printifyEnv: {
    shopId,
    blueprintId,
    printProviderId,
    variantId,
    product: "Plastic Yard Sign (blueprint 1205 / Taylor 228)",
    size: customization.sizeLabel,
  },
  step1_uploadImage: {
    method: "POST",
    url: "https://api.printify.com/v1/uploads/images.json",
    body: {
      file_name: "preview-default.png",
      contents: "<base64 of the generated PNG>",
    },
  },
  step2_createProduct: {
    method: "POST",
    url: `https://api.printify.com/v1/shops/${shopId}/products.json`,
    body: {
      title: "ITHWB-<shortOrderId>",
      description: "Custom corrugated plastic yard sign",
      blueprint_id: blueprintId,
      print_provider_id: printProviderId,
      variants: [{ id: variantId, price: priceCents, is_enabled: true }],
      print_areas: [
        {
          variant_ids: [variantId],
          placeholders: [
            {
              position: "front",
              images: [{ id: "<id from step1>", x: 0.5, y: 0.5, scale: 1, angle: 0 }],
            },
          ],
        },
      ],
    },
  },
  step3_createOrder: {
    method: "POST",
    url: `https://api.printify.com/v1/shops/${shopId}/orders.json`,
    body: {
      external_id: "<uuid without dashes, max 32 chars>",
      label: "ITHWB-<short>",
      line_items: [
        { product_id: "<id from step2>", variant_id: variantId, quantity: 1 },
      ],
      shipping_method: 1,
      is_printify_express: false,
      is_economy_shipping: false,
      send_shipping_notification: true,
      address_to: {
        first_name: "<from Stripe checkout>",
        last_name: "<from Stripe checkout>",
        email: "<from Stripe checkout>",
        phone: "<from Stripe checkout>",
        country: "US",
        region: "<state>",
        address1: "<street>",
        address2: "",
        city: "<city>",
        zip: "<zip>",
      },
    },
  },
  step4_submitProduction: {
    method: "POST",
    url: `https://api.printify.com/v1/shops/${shopId}/orders/<orderId>/send.json`,
    body: {},
  },
  designPayloadStoredLocally: customization,
};

const payloadPath = path.join(root, "uploads", "artwork", "printify-default-payload.json");
fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2));
console.log(JSON.stringify({ outPath, payloadPath, bytes: payload.artwork.bytes }, null, 2));
