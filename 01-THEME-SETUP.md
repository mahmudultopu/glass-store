# SHADEO: Shopify theme setup guide

Follow these steps in order. Total time is about 3–4 hours, plus however long you spend adding products.

---

## 1. Theme choice

| | Theme | Price | Why it fits SHADEO |
|---|---|---|---|
| **Start here** | **Dawn** (by Shopify) | Free | Fast, mobile-first and well supported. It's the most-used theme among sunglasses stores. All the custom code in `shopify-theme/` is written for Dawn. |
| **Upgrade later** | **Impulse** (Archetype Themes) | about $380, one-time | Built for promo-heavy fashion brands: mega menu with images, a built-in promo pop-up, quick view, color swatches on product cards, and strong collection filters. Worth it once you're doing steady sales. |

> Install Dawn: **Online Store → Themes → Theme library → Add theme → Dawn**.
> Before editing, click **⋯ → Duplicate** so you always have a clean backup.

---

## 2. Upload the SHADEO files

In **Online Store → Themes → (your Dawn copy) → ⋯ → Edit code**:

| Folder in Shopify | Click "Add a new…" and create | Paste contents of |
|---|---|---|
| `assets` | `shadeo.css` | `shopify-theme/assets/shadeo.css` |
| `assets` | `shadeo.js` | `shopify-theme/assets/shadeo.js` |
| `sections` | `shadeo-shape-carousel.liquid` | `shopify-theme/sections/…` (same name) |
| `sections` | `shadeo-icon-columns.liquid` | ″ |
| `sections` | `shadeo-shop-the-look.liquid` | ″ |
| `sections` | `shadeo-whatsapp-button.liquid` | ″ |
| `snippets` | `shadeo-icon.liquid` | `shopify-theme/snippets/…` (same name) |
| `snippets` | `shadeo-shape-icon.liquid` | ″ |
| `snippets` | `shadeo-lens-selector.liquid` | ″ |
| `snippets` | `shadeo-frame-specs.liquid` | ″ |
| `snippets` | `shadeo-delivery-stock.liquid` | ″ |
| `snippets` | `shadeo-sticky-atc.liquid` | ″ |
| `snippets` | `shadeo-free-shipping-bar.liquid` | ″ |
| `snippets` | `shadeo-cart-upsell.liquid` | ″ |
| `snippets` | `shadeo-card-badges.liquid` | ″ |

(When Shopify asks for a name, type it **without** the `.liquid` / `.css` / `.js` extension. Shopify adds it.)

## 3. Load the CSS and JS

Open `layout/theme.liquid`. Find the line `</head>` and paste these two lines **just above it**:

```liquid
{{ 'shadeo.css' | asset_url | stylesheet_tag }}
<script src="{{ 'shadeo.js' | asset_url }}" defer="defer"></script>
```

## 4. Theme settings (brand look)

**Customize → Theme settings (gear icon):**

**Colors → Schemes**
| Scheme | Background | Text | Solid button | Button label | Use for |
|---|---|---|---|---|---|
| Scheme 1 | `#FAF8F5` | `#111111` | `#111111` | `#FFFFFF` | Main pages |
| Scheme 2 | `#111111` | `#FAF8F5` | `#F5A623` | `#111111` | Announcement bar, trust strip, footer |
| Scheme 3 | `#F5A623` | `#111111` | `#111111` | `#FFFFFF` | Sale banners, newsletter |
| Scheme 4 | `#FFFFFF` | `#111111` | `#F5A623` | `#111111` | Product cards and product pages |

**Typography**
- Headings: **Archivo Black** if it's in the font list. If not, use **Montserrat Bold** (700). Set heading scale to 110–120%.
- Body: **Inter** (or **Assistant** if Inter isn't listed). Body scale 100%.

**Buttons:** corner radius 6px, border thickness 1px, shadow 0.

**Product cards:** Style "Standard", Image padding 0, Text alignment Left, Corner radius 6, and **turn ON "Show second image on hover"**.

**Badges:** position Top left, Sale badge color Scheme 3.

**Cart:** Type **Drawer**. "Show vendor" OFF. "Enable cart note" ON (customers can add delivery notes).

**Social media:** add your Facebook, Instagram and TikTok links.

**Favicon:** upload a 32×32 version of the SHADEO "S" mark.

## 5. Cart drawer: free-shipping bar + upsell

Open `snippets/cart-drawer.liquid`. Find this line (search for `drawer__header`):

```liquid
<div class="drawer__header">
```

Scroll down to the matching closing `</div>` of that header block (just after the close button). **Directly below it**, paste:

```liquid
{% render 'shadeo-free-shipping-bar' %}
```

Then search for `<div class="drawer__footer">` and paste this **directly above** it:

```liquid
{% render 'shadeo-cart-upsell' %}
```

Both sit inside `.drawer__inner`, so Dawn refreshes them automatically when the cart changes.

> If your free-shipping amount isn't Tk 3,000, change `threshold_bdt` at the top of `shadeo-free-shipping-bar.liquid`.
> To suggest a product other than the cleaning kit, change `upsell_handle` in `shadeo-cart-upsell.liquid`.

## 6. Product card badges

Open `snippets/card-product.liquid`. Search for `card__badge`. It appears **twice** (Dawn uses one for cards with images and one for cards without). Each looks like:

```liquid
<div class="card__badge {{ settings.badge_position }}">
  {%- if card_product.available == false -%}
```

In **both** places, paste this on the line **right after** the opening `<div class="card__badge …">`:

```liquid
{% render 'shadeo-card-badges', product: card_product %}
```

Now any product tagged `new`, `bestseller` or `polarized` shows a badge automatically.

---

## 7. Navigation menus

**Online Store → Navigation → Main menu.** Create nested items by dragging them under a parent:

```
Sunglasses                → /collections/sunglasses
  ├ Men                   → /collections/mens-sunglasses
  ├ Women                 → /collections/womens-sunglasses
  ├ Polarized             → /collections/polarized
  ├ New Arrivals          → /collections/new-arrivals
  └ Bestsellers           → /collections/bestsellers
Shop by Shape             → /collections/all
  ├ Aviator               → /collections/aviator
  ├ Round                 → /collections/round
  ├ Square                → /collections/square
  ├ Cat Eye               → /collections/cat-eye
  ├ Oversized             → /collections/oversized
  └ Shield                → /collections/shield
Prescription              → /collections/eyeglasses
  ├ Eyeglasses            → /collections/eyeglasses
  ├ Prescription Sunglasses → /collections/prescription-sunglasses
  └ How It Works          → /pages/prescription-how-it-works
Blue Light                → /collections/blue-light
Accessories               → /collections/accessories
Sale                      → /collections/sale
```

Then in **Customize → Header**: Menu = Main menu, Menu type on desktop = **Mega menu**, Sticky header = **On scroll up**, Logo position = Middle left.

**Footer menus** (create 3 menus):
- **Shop:** Sunglasses, Eyeglasses, Blue Light, Accessories, Sale, Gift Card
- **Help:** Shipping, Returns & Exchanges, Warranty, FAQ, Track Order, Contact Us
- **Company:** About SHADEO, Face Shape Guide, Blog, Careers, Privacy Policy, Terms

---

## 8. Homepage, section by section

**Customize → Home page.** Delete Dawn's default sections, then add these in order:

| # | Section to add | Settings |
|---|---|---|
| 1 | **Announcement bar** (header group) | Color scheme 2. Add 3 announcements (text in `content/05-EMAILS-POPUPS-ANNOUNCEMENTS.md`). Auto-rotate ON, every 5 sec. |
| 2 | **Header** | See step 7. |
| 3 | **Image banner** | Hero image (2400×1200). Height: Large. Content position: Middle left. Heading + text + 2 buttons ("Shop Men", "Shop Women"). Desktop overlay opacity 20%. |
| 4 | **SHADEO shape carousel** | Pick each block → link it to its shape collection. Upload photos later, or keep the built-in line drawings. |
| 5 | **Featured collection**: "Bestsellers" | Collection: Bestsellers. Products: 8. Columns: 4. **Enable quick add: Standard**. Carousel on mobile: ON. "View all" button: ON. |
| 6 | **Image banner**: campaign | Seasonal image (e.g. "Monsoon Edit"). Height: Medium. Color scheme 3 for the text box. |
| 7 | **Featured collection**: "New Arrivals" | Same settings as #5. |
| 8 | **SHADEO icon columns** → preset **"SHADEO find your frame"** | Link "Start the quiz" to your quiz page, "Virtual try-on" to your try-on page/app, and "Chat on WhatsApp" to `https://wa.me/8801XXXXXXXXX`. |
| 9 | **Reviews** | Add the Judge.me "Reviews Carousel" app block (see `content/02-APPS.md`). If you have no app yet, use **Multicolumn** with 3 written testimonials. |
| 10 | **SHADEO shop the look** | 4–8 lifestyle photos, each tagged with its product. Add your Instagram link. |
| 11 | **SHADEO icon columns** → preset **"SHADEO trust strip"** | Already filled in. |
| 12 | **SHADEO icon columns** → preset **"SHADEO why us"** | Already filled in. |
| 13 | **Email signup** | Color scheme 3. Copy is in `content/05-EMAILS-POPUPS-ANNOUNCEMENTS.md`. |
| 14 | **Footer** (footer group) | Color scheme 2. Add 3 Menu blocks + a Brand information block. Show payment icons ON. |
| 15 | **SHADEO WhatsApp button** (footer group) | Click "Add section" in the **Footer** group. Enter your number as `8801XXXXXXXXX`. Shows on every page. |

All homepage copy is in `content/03-WEBSITE-COPY.md`.

---

## 9. Product page template

**Customize → top dropdown → Products → Default product.** In the **Product information** section, arrange the blocks like this (add "Custom liquid" blocks where shown):

1. Text (vendor or "SHADEO"): optional, small caps
2. Title
3. Price
4. App block: **Judge.me star rating** (after installing Judge.me)
5. Variant picker: style **Pills**, or **Swatch** if you set up color swatches (see `content/04-COLLECTIONS-TAGS-METAFIELDS.md`)
6. **Custom liquid**, paste:
   ```liquid
   {% render 'shadeo-lens-selector', product: product, section_id: section.id %}
   ```
7. Quantity selector
8. Buy buttons. **Turn OFF "Show dynamic checkout buttons"**, because the "Buy it now" button skips the lens selector and the lens price would be lost.
9. **Custom liquid**, paste:
   ```liquid
   {% render 'shadeo-delivery-stock', product: product, section_id: section.id %}
   ```
10. **Custom liquid**, paste:
    ```liquid
    {% render 'shadeo-frame-specs', product: product, section_id: section.id %}
    ```
11. **Collapsible row**: "Description" → content: Product description
12. **Collapsible row**: "Specifications" → content from metafields or page
13. **Collapsible row**: "Shipping & Returns" → content from page "Shipping Policy"
14. **Collapsible row**: "Care Instructions" → see `content/03-WEBSITE-COPY.md`
15. **Custom liquid**, paste:
    ```liquid
    {% render 'shadeo-sticky-atc', product: product, section_id: section.id %}
    ```

Section settings: Media size **Large**, Gallery layout **Thumbnail carousel**, Enable image zoom **Open lightbox**, Enable sticky content on desktop **ON**.

Below the main section, add:
- **Product recommendations** → heading "Complete the look". Set it to **Complementary products** and pick cases and cleaning kits in the free **Search & Discovery** app.
- **Apps → Judge.me Review Widget**
- **Related products** → heading "You may also like", 4 products

> **If the Custom liquid box rejects the `render` code:** open `sections/main-product.liquid` in the code editor, find `{%- when 'custom_liquid' -%}`, and paste the same `render` line directly into the file under that block instead.

---

## 10. The "lens-upgrade" product (needed for lens prices)

The lens selector reads its options from one hidden product:

1. **Products → Add product** → Title: `Lens Upgrade`. URL handle (in the SEO section): `lens-upgrade`.
2. Add option **"Lens"** with these variants:

| Variant | SKU | Price (BDT) | Inventory |
|---|---|---|---|
| Blue-Light Filter (no prescription) | `LENS-BL` | 800 | Don't track |
| Single Vision – Clear | `LENS-RX-SV` | 1,200 | Don't track |
| Single Vision + Blue-Light | `LENS-RX-SVBL` | 1,800 | Don't track |
| Single Vision – Sun Tint | `LENS-RX-SUN` | 2,200 | Don't track |

   Variants with **RX** in the SKU make the shopper share a prescription.
3. Set **Sales channels → Online Store** ON (it must be "Active"), but **don't add it to any collection**. To hide it from search, install the free **Search & Discovery** app, or add the tag `hidden` and exclude that tag from your collections.
4. Tag every frame that should show the lens selector with **`lens-selector`** (all eyeglasses, plus any sunglasses you sell with prescription lenses).

When a shopper picks a paid lens, the frame **and** a "Lens Upgrade" line go into the cart together. The frame line also stores the lens name and prescription (or "Will send on WhatsApp"), so your team sees everything on the order.

> If a customer removes the frame from the cart but leaves the lens, that lens line stays behind. Check for this when you confirm COD orders by phone.

---

## 11. Collection page

**Customize → Collections → Default collection:**
- Collection banner: show description ON, show image ON
- Product grid: products per page 24, columns desktop 4 / mobile 2
- **Enable filtering ON**, filter layout **Vertical** (desktop) and drawer (mobile)
- **Enable sorting ON**

Filters are set up in the free **Search & Discovery** app (see `content/04-COLLECTIONS-TAGS-METAFIELDS.md`).

---

## 12. Shopify settings checklist

- **Settings → General:** store currency **BDT (Tk)**, time zone **(GMT+06:00) Dhaka**.
- **Settings → Checkout:** Customer contact method **Phone number or email** (most BD customers prefer phone). Shipping address phone **Required**. Turn on **abandoned checkout emails** (send after 1 hour).
- **Settings → Payments:** Shopify Payments isn't available in Bangladesh. Add a **manual payment method → Cash on Delivery (COD)**. For online payments, ask local gateways such as SSLCommerz, aamarPay or ShurjoPay about their current Shopify integration (they cover bKash, Nagad and cards). Until then, you can add a manual method "bKash / Nagad (send money)" with your number and instructions.
- **Settings → Shipping and delivery → Bangladesh zone:**
  - `Inside Dhaka`: Tk 70 (condition: order price Tk 0 – 2,999.99)
  - `Outside Dhaka`: Tk 130 (condition: order price Tk 0 – 2,999.99)
  - `Free Delivery`: Tk 0 (condition: order price **Tk 3,000 and up**)
- **Discounts → Create discount → Amount off products → Automatic:** "Buy 2, get 15% off". Minimum quantity 2, applies to the collections Sunglasses + Eyeglasses + Blue Light. (Don't include Accessories or Lens Upgrade.)
- **Discounts → Create discount → Code:** `WELCOME10` (10% off, one use per customer) for the pop-up and newsletter.
- **Settings → Policies:** paste the policies from `content/06-POLICIES.md`.
- **Settings → Customer accounts:** New customer accounts.
- **Online Store → Preferences:** add your Facebook Pixel / Google Analytics through the apps in `content/02-APPS.md`.
