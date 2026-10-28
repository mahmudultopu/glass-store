# SHADEO website

A complete, working eyewear store website. It's plain HTML/CSS/JavaScript, with no build step and no server needed.

**Open it:** double-click `index.html` (or right-click → Open with → Chrome).

## Pages
| Page | File |
|---|---|
| Home | `index.html` |
| Shop (all collections, filters, sorting, search) | `shop.html?c=sunglasses` · `men` · `women` · `polarized` · `eyeglasses` · `blue-light` · `new` · `bestsellers` · `sale` · `accessories` · `all` |
| Product (colors, lens selector, prescription, size guide, delivery dates) | `product.html?p=gulshan-aviator-polarized` |
| Checkout (COD / bKash / Nagad, discount codes, delivery area) | `checkout.html` |
| Frame quiz | `quiz.html` |
| Track order | `track-order.html` |
| About · Prescription · Face shape guide · FAQ · Contact · Policies · Journal · 404 | `about.html`, `prescription.html`, `face-shapes.html`, `faq.html`, `contact.html`, `policies.html`, `blog.html`, `404.html` |

## Features
- Mega menu, mobile menu, live product search
- Slide-out cart with free-delivery progress bar, "Buy 2, get 15% off", and hard-case upsell
- Lens selector with prescription entry (or "send on WhatsApp")
- Delivery estimate that skips Fridays, low-stock badge, sticky mobile add-to-cart
- Welcome pop-up with the `WELCOME10` code, newsletter signup, floating WhatsApp button
- Real product and lifestyle photos (women, men, kids) in a clean, luxury design

## How orders work
There is no server. When a customer places an order, it's saved in their browser and the confirmation page opens a **pre-filled WhatsApp message** with the full order (items, lens, prescription, address, payment and TrxID). Your team confirms and ships from WhatsApp. That's a common, working setup for Bangladeshi COD stores.

When you move to Shopify, use the theme code in `../shopify-theme/` and Shopify's real checkout instead.

## Before going live: edit `assets/js/data.js`
- `whatsapp`: your number, digits only, e.g. `8801712345678`. **Orders can't reach you until you change this.**
- `phone`, `email`, `address`, social links
- `shipping`, `freeShippingOver`, discount `codes`
- Products: names, prices, `compare` (sale price), `stock`, colors and sizes
- Lens prices in `SHADEO_LENSES`

**Photos:** all images are in `assets/img/` (products, people, banners). They are free stock photos under the [Unsplash License](https://unsplash.com/license), which allows commercial use. Before you run ads, replace the product photos with photos of the frames you actually sell. Customers must receive what they see. To swap one, save your photo with the same file name, or change the `image` path for that product in `assets/js/data.js`.

## Publish it online (free)
Any static host works: Vercel, Netlify or Cloudflare Pages. Upload the `website` folder as-is.
