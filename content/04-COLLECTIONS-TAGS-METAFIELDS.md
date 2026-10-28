# SHADEO: Collections, tags, metafields and filters

Set this up **before** adding products so every product is tagged correctly from day one.

## 1. Product types
Use exactly one of these in **Product → Product organization → Type**:
`Sunglasses` · `Eyeglasses` · `Blue Light Glasses` · `Accessories` · `Lens Upgrade`

## 2. Tag system (all lowercase)

| Group | Tags | Used for |
|---|---|---|
| Gender | `men`, `women`, `unisex` | Collections + filter |
| Shape | `aviator`, `round`, `square`, `rectangle`, `cat-eye`, `oversized`, `shield` | Shape collections |
| Lens | `polarized`, `blue-light`, `gradient`, `mirrored`, `photochromic` | Collections + badges |
| Material | `acetate`, `metal`, `tr90`, `titanium` | Filter |
| Merchandising | `new`, `bestseller`, `sale`, `gift-idea` | Collections + badges |
| Function | `lens-selector` | Shows the lens selector on the product page |
| Hidden | `hidden` | Lens Upgrade product (excluded from collections) |

**Example:** the "Gulshan" aviator gets
`Type: Sunglasses` · Tags: `unisex, aviator, polarized, metal, bestseller`

## 3. Automated collections
**Products → Collections → Create collection → Automated.** Every collection below also needs the condition **Tag is not equal to `hidden`**.

| Collection | Handle | Conditions (all must match) |
|---|---|---|
| Sunglasses | `sunglasses` | Type = Sunglasses |
| Men's Sunglasses | `mens-sunglasses` | Type = Sunglasses · Tag = men **OR** unisex* |
| Women's Sunglasses | `womens-sunglasses` | Type = Sunglasses · Tag = women **OR** unisex* |
| Polarized | `polarized` | Tag = polarized |
| Eyeglasses | `eyeglasses` | Type = Eyeglasses |
| Prescription Sunglasses | `prescription-sunglasses` | Type = Sunglasses · Tag = lens-selector |
| Blue Light | `blue-light` | Tag = blue-light |
| Accessories | `accessories` | Type = Accessories |
| New Arrivals | `new-arrivals` | Tag = new (sort: Newest) |
| Bestsellers | `bestsellers` | Tag = bestseller (sort: Best selling) |
| Sale | `sale` | Compare-at price > 0 |
| Aviator / Round / Square / Cat Eye / Oversized / Shield | `aviator`, `round`, … | Tag = (shape) |

\* Shopify can't mix AND + OR in one collection. Easiest fix: tag unisex frames with **both** `men` and `women`, then use Tag = men (or women) only.

Collection descriptions are in `07-SEO.md`.

## 4. Product metafields
**Settings → Custom data → Products → Add definition**:

| Name | Namespace and key | Type | Example |
|---|---|---|---|
| Frame size | `custom.frame_size` | Single line text (choices: Small, Medium, Large) | Medium |
| Lens width | `custom.lens_width` | Integer | 52 |
| Bridge width | `custom.bridge_width` | Integer | 18 |
| Temple length | `custom.temple_length` | Integer | 145 |
| Frame width | `custom.frame_width` | Integer | 138 |
| Frame material | `custom.frame_material` | Single line text | Acetate |
| Frame weight | `custom.frame_weight` | Integer | 24 |
| Frame color | `custom.frame_color` | Single line text | Tortoise |
| Lens color | `custom.lens_color` | Single line text | Green G15 |

**Variant metafield** (Settings → Custom data → Variants):
| Lens note | `custom.lens_note` | Single line text | "Blocks 40% of blue light from screens" |

Fill in the lens notes on the "Lens Upgrade" variants:
- Blue-Light Filter: *Cuts screen glare and eye strain, no prescription*
- Single Vision – Clear: *For near- or far-sightedness, anti-glare coated*
- Single Vision + Blue-Light: *Your prescription + screen protection*
- Single Vision – Sun Tint: *Your prescription as sunglasses, UV400*

## 5. Color swatches
Name the variant option **"Color"** (e.g. Black, Tortoise, Gold/Green, Clear Crystal). In Dawn, go to **Customize → Product information → Variant picker** and set style to **Swatch**. Then in **Settings → Custom data → Variants**, link the Color option to a category metafield to choose a swatch color. Or upload a small frame-color image per variant as the swatch.

## 6. Filters (Search & Discovery app → Filters → Add filter)
In this order:
1. **Availability**
2. **Price**
3. **Product type**
4. **Tag** filter, renamed "Shape" (group tag values: aviator, round, square, rectangle, cat-eye, oversized, shield)
5. **Tag** filter, renamed "Gender" (men, women)
6. **Tag** filter, renamed "Lens type" (polarized, blue-light, gradient, mirrored, photochromic)
7. **Variant option: Color**
8. **Metafield: Frame material**
9. **Metafield: Frame size**

Turn on **"Hide filter values with no products"**.

**Search synonyms:** shades ↔ sunglasses · chosma, chashma ↔ eyeglasses · computer glasses ↔ blue light · polarised ↔ polarized

## 7. Starter catalog (sample)

| Product | Type | Shape | Price (Tk) | Compare-at | Tags |
|---|---|---|---|---|---|
| Gulshan Aviator Polarized | Sunglasses | Aviator | 2,890 | 3,490 | unisex, men, women, aviator, polarized, metal, bestseller |
| Cox's Oversized | Sunglasses | Oversized | 2,490 | | women, oversized, gradient, acetate, new |
| Kuakata Cat Eye | Sunglasses | Cat eye | 2,690 | | women, cat-eye, acetate, bestseller |
| Sundarban Shield Sport | Sunglasses | Shield | 3,190 | | men, shield, polarized, mirrored, tr90, new |
| Sajek Round | Eyeglasses | Round | 2,290 | | men, women, round, metal, lens-selector, bestseller |
| Padma Square Blue-Light | Blue Light Glasses | Square | 1,990 | 2,490 | men, women, square, blue-light, tr90, lens-selector |
| Sylhet Rectangle | Eyeglasses | Rectangle | 2,190 | | men, rectangle, acetate, lens-selector, new |
| SHADEO Cleaning Kit | Accessories | – | 390 | | gift-idea (handle: `shadeo-cleaning-kit`) |
| SHADEO Hard Case | Accessories | – | 590 | | gift-idea |
| SHADEO Sport Strap | Accessories | – | 290 | | |
| Lens Upgrade | Lens Upgrade | – | (per variant) | | hidden (handle: `lens-upgrade`) |

Product descriptions for these are in `03-WEBSITE-COPY.md`.
