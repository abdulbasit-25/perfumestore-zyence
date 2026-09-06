# Rebrand Prompt: Sorrel Atelier → Zyence (Perfume Brand)

Paste this whole prompt into your coding agent (Claude Code, etc.) inside the project repo.

---

## Context

The current codebase is "Sorrel Atelier" — a slow-fashion/ceramics COD (cash-on-delivery) e-commerce site with a homepage, category pages, product pages, contact page, and an admin panel backed by MongoDB Atlas. A `sorrel` collection already exists in Atlas.

**Task:** Rebrand the entire storefront + admin into a new brand called **Zyence**, a perfume/fragrance house. Keep the existing architecture, layout components, COD flow, and page structure — this is a **content, data, and design-token rebrand**, not a rebuild. Do not change backend logic, auth, checkout flow, or routing structure unless a field name literally doesn't apply to perfume (see Data Model section).

---

## 1. Brand Identity Transformation

| Element | Sorrel (old) | Zyence (new) |
|---|---|---|
| Brand name | Sorrel / Sorrel Atelier | Zyence |
| Category | Slow-made apparel, ceramics, home objects | Fine fragrance: eau de parfum, attars, home scent |
| Voice | Warm, tactile, artisanal, "made slowly" | Sensory, precise, modern-luxe — evocative but not flowery. Think notes, mood, longevity, not "handwoven" language |
| Visual mood | Oatmeal linen, warm plaster, stoneware, natural light | Dark glass, amber/smoke tones, minimal studio product shots, negative space |
| Tagline direction | "Made slowly, worn daily." | Something like "Composed, not sprayed." / "Scent, engineered." — write 3–5 options and let me pick, don't lock one in silently |
| Origin story ("How it's made") | Source → Make → Finish → Ship COD | Compose (raw materials/perfumers) → Macerate/Blend → Bottle → Ship COD |

Keep the **COD value props** (pay on delivery, inspect first, no card upfront) — that's the core commerce mechanic and stays brand-agnostic. Just reskin the copy around it (e.g. "Inspect the bottle before you pay" instead of "Open the parcel and check every piece").

---

## 2. Category / Taxonomy Remap

Replace the apparel/ceramics taxonomy with a fragrance taxonomy:

- **Eau de Parfum** (was: Apparel)
- **Attars / Oils** (was: Ceramics)
- **Home Fragrance** (candles, diffusers, room mist) (was: Objects)
- **Discovery / Gift Sets** (was: Textiles)

Product examples to replace the sample SKUs (Cream Mug, Olive Vase, Linen Shirt, Leather Tote, Brass Lamp, Knit Sweater):
- e.g. "Amber Oud EDP", "Fig & Vetiver EDP", "Rose Attar", "Sandalwood Diffuser", "Discovery Set — 5x5ml"

---

## 3. Page-by-Page Rewrite Checklist

Go through every page/subpage that currently exists and reskin it. Based on the current site, that's at minimum:

### Home
- Hero headline/subhead → fragrance-led copy
- Hero image/model shot → swap for perfume bottle / studio shot placeholder (flag if imagery needs sourcing — don't fabricate asset URLs)
- Trust strip (SLOW-MADE / HAND-THROWN / PAY ON DELIVERY / SMALL BATCH / SHIPPED WORLDWIDE) → fragrance equivalents, e.g. SMALL-BATCH BLENDED / LONG-LASTING / PAY ON DELIVERY / VEGAN & CRUELTY-FREE / SHIPPED WORLDWIDE
- "Shop by category" 4-tile section → 4 fragrance categories above
- "How it's made" 4-step section → Compose/Blend/Bottle/Ship COD
- "Fresh arrivals" + "Customer favorites" product grids → new SKUs
- Customer review block → new placeholder reviews (mark clearly as placeholder copy for client to swap with real reviews)
- "On payment" 3-step COD explainer → reskin copy only, keep mechanic
- Newsletter block → reskin copy ("Join the atelier list" → "Get first access to new scents")
- Instagram/feed section → reskin captions to fragrance context

### Category / Shop pages
- All category and subcategory pages → renamed per taxonomy in §2
- Filters (if any: size, color, material) → swap to fragrance filters (concentration: EDP/EDT/Attar, scent family: woody/floral/citrus/oriental, size: 5ml/30ml/50ml/100ml)

### Product detail page
- Field labels: "material," "size guide" (clothing sizing) → "concentration," "volume," "longevity," "sillage," "top/heart/base notes"
- Reviews, add-to-cart, COD messaging → keep structure, reskin copy

### Contact page
- Headline/subhead → reskin
- Keep form fields as-is (Name, Email, Phone, Subject, Message)
- Footer contact block, socials → update brand name, keep same fields

### FAQ
- Rewrite the 6 FAQ questions/answers for fragrance context (shipping, COD, returns — note: opened/tested fragrance bottles usually have stricter return rules than clothing; flag this to the client rather than assuming a policy)

### Footer / global nav
- Brand name, nav labels (Shop → All goods/Textiles/Objects becomes All Scents/Eau de Parfum/Home Fragrance/Gift Sets)
- "Designed & built by ARCHER" credit line stays as-is

---

## 4. Admin Panel Changes

- Brand/tenant switcher or config: add "Zyence" as a selectable brand alongside "Sorrel" (see Data Model — assumes multi-brand admin)
- Category management: seed the 4 fragrance categories from §2 for Zyence only — do not touch Sorrel's existing categories
- Product form fields: if the schema is generic (`attributes: {}` / key-value), no code change needed, just seed fragrance-specific attribute keys (notes, concentration, volume) for Zyence products
- If size/material fields are hardcoded (not generic), add fragrance-specific fields *without removing* Sorrel's apparel fields — gate by brand
- Nav/branding in admin UI: label switch, logo/color token swap when "Zyence" context is active

---

## 5. MongoDB Atlas — Data Model for Zyence

You said Sorrel is already added as a collection. Two possible existing patterns — **check which one the codebase actually uses before writing anything**, then match it:

**Pattern A — one collection per brand** (matches "sorrel is already added" literally):
- Create a new collection `zyence` (or `zyence_products` if `sorrel` is actually named `sorrel_products`) with the **same schema shape as `sorrel`**, just populated with fragrance data.
- Suggested document shape (adjust to match Sorrel's actual field names exactly — don't introduce a divergent schema):
```json
{
  "_id": ObjectId,
  "brand": "zyence",
  "name": "Amber Oud",
  "slug": "amber-oud-edp",
  "category": "eau-de-parfum",
  "concentration": "EDP",
  "volume_ml": 50,
  "price": 92.00,
  "currency": "USD",
  "notes": { "top": ["bergamot", "pink pepper"], "heart": ["oud", "rose"], "base": ["amber", "musk"] },
  "longevity": "8-10 hours",
  "sillage": "moderate-heavy",
  "images": ["..."],
  "stock": 0,
  "cod_eligible": true,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

**Pattern B — single shared collection with a `brand` field** (more scalable, recommended if you're going to add more brands later): if `sorrel` already stores `brand: "sorrel"` on each doc, just insert new docs with `brand: "zyence"` into the *same* collection — do not create a separate physical collection in this case, that would fragment queries and break any shared admin list/filter logic.

⚠️ **Do this before writing migration/seed scripts:** open the existing `sorrel` collection in Atlas, confirm which pattern is actually in use, and mirror it exactly. Flag it to me if the two patterns are mixed inconsistently across the codebase — that's worth fixing, not copying.

- Also check: is there a top-level `brands` collection (brand config: name, theme tokens, nav labels, active categories)? If yes, add a `zyence` document there too, alongside the product-level changes.

---

## 6. Explicit Non-Goals

- Do not change auth, checkout/payment logic, courier/COD backend logic, or routing structure.
- Do not delete or modify any Sorrel data, pages, or admin config — Zyence is additive.
- Do not invent real product photography or fabricate external asset URLs — use clearly-labeled placeholders and flag where real assets are needed.
- Do not lock in a single tagline/voice choice silently — where copy has multiple reasonable directions (tagline, review placeholders, FAQ return policy), present options rather than deciding unilaterally.

---

## 7. Deliverable format

Go section by section (Home → Category pages → Product page → Contact → FAQ → Footer/Nav → Admin → Atlas), showing a diff or before/after for each, rather than dumping a single giant rewritten file. Confirm the Atlas pattern (A or B above) before running any DB writes.
