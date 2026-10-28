# SHADEO: Recommended Shopify apps

Start with the **free** column. Upgrade only when sales justify it. App names and pricing change, so check the Shopify App Store listing before installing.

| Need | Recommended | Free option | Notes |
|---|---|---|---|
| **Product reviews** (stars on cards, photo reviews) | Loox (paid, photo-first) | **Judge.me** (free plan) | Judge.me writes star ratings into Shopify's rating metafield, so Dawn shows stars on product cards automatically. Turn on review-request emails 7 days after delivery. |
| **Virtual try-on** | Search the App Store for "virtual try-on glasses" and compare providers that support face-tracking AR for eyewear | Skip at launch. The "Ask a stylist on WhatsApp" card covers it | Try-on apps need 3D/2D frame files per product, so budget time for that. Add it once you have 20+ frames. |
| **Lens / prescription selector** | Dedicated prescription-lens apps (search "prescription lens") | **Built in**: `shadeo-lens-selector.liquid` | The custom snippet already handles lens choice, price and prescription entry for free. |
| **Face-shape quiz** | RevenueHunt Product Recommendation Quiz | RevenueHunt free plan, or a simple Shopify page with the Face Shape Guide | 5 questions: face shape, use (sun/screen/fashion), style, color, budget. |
| **Upsell / bundles** | Frequently Bought Together (Code Black Belt) | **Shopify Bundles** + **Search & Discovery** (complementary products), both free and by Shopify | The cart-drawer upsell is built in (`shadeo-cart-upsell.liquid`). "Buy 2, get 15%" is a native automatic discount. |
| **Email & SMS marketing** | Klaviyo (free up to 250 contacts, then paid) | **Shopify Email** (free monthly allowance) | Set up 3 automations: Welcome series, Abandoned checkout, Post-purchase review request. Local SMS (BD gateways) is cheaper than international SMS apps. |
| **Pop-up / signup form** | Privy or Klaviyo forms | **Shopify Forms** (free) | Welcome pop-up with `WELCOME10`. Show after 8 seconds or 50% scroll, once per visitor. |
| **WhatsApp chat** | Any WhatsApp chat app with agent routing | **Built in**: `shadeo-whatsapp-button.liquid` | Product pages pre-fill the product name in the message. |
| **Loyalty & referral** | Smile.io (paid tiers) | **Smile.io** or **Joy Loyalty** (free plans) | Points: 1 point per Tk 10 spent; 100 points = Tk 100 off. Referral: "Give 10%, Get 10%". |
| **Filters & search** | none needed | **Search & Discovery** (free, by Shopify) | Sets up the collection filters, synonyms (e.g. "shades" → sunglasses) and complementary products. |
| **Meta (Facebook + Instagram) Pixel & Shop** | none needed | **Facebook & Instagram** by Meta (free) | Connects the Pixel + Conversions API and syncs your catalog to Instagram Shopping. |
| **TikTok Pixel & Shop** | none needed | **TikTok** (free) | Pixel + catalog sync for TikTok ads. |
| **Google Analytics & Shopping** | none needed | **Google & YouTube** (free) | GA4 + Merchant Center product feed. |
| **Courier integration** | Local courier apps or their APIs (Steadfast, Pathao, RedX, Paperfly) | Manual: export orders as CSV and bulk-upload to the courier panel | Choose the courier with the best COD settlement time and return rate in your area. |
| **Order confirmation for COD** | Local OTP / call-confirmation apps | Call or WhatsApp every COD order before shipping | Confirming orders cuts fake orders and return costs a lot. |

## Install order (week 1)
1. Search & Discovery
2. Judge.me
3. Facebook & Instagram, TikTok, Google & YouTube (pixels)
4. Shopify Email + Shopify Forms
5. Shopify Bundles
6. Joy / Smile loyalty (after the first 50 orders)
7. Quiz and virtual try-on (after you have 20+ products)

> Keep the total under 8–10 apps. Every app adds JavaScript and slows mobile loading, which hurts sales.
