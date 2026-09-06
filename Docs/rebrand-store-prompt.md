# Prompt: Complete Store Rebrand (Design + CSS Refactor)

Copy/paste this into your coding assistant (or use it yourself as a checklist).

---

**Task:** Completely rebrand the visual design of this online store while keeping all existing functionality intact. This includes a full CSS refactor to centralize all styling in one file.

## 1. CSS Consolidation (do this first)
- Find every place styling currently lives: inline `style="..."` attributes, `<style>` blocks in HTML/templates, scattered `.css` files, and any CSS-in-JS.
- Move **all** of it into a single `styles.css` file.
- Remove inline styles and embedded `<style>` tags from markup entirely — HTML/templates should only reference classes, not contain styling.
- Organize `styles.css` with clear sections (comments) in this order:
  1. CSS custom properties / theme variables (`:root { --color-primary: ...; }`)
  2. Reset / base styles
  3. Typography
  4. Layout (grid/flex containers, spacing)
  5. Components (buttons, cards, nav, forms, product tiles, etc.)
  6. Utility classes
  7. Responsive/media queries
- Use **CSS custom properties** for every color, font, spacing unit, border-radius, and shadow so the whole theme can be swapped later by just changing variable values at the top of the file.

## 2. Rebrand Direction
Define (or ask me to define) before generating styles:
- New brand personality (e.g. minimal/luxury, playful/bold, warm/artisanal, tech/modern)
- Primary/secondary/accent color palette
- Font pairing (heading + body)
- Spacing/density preference (airy vs. compact)
- Corner style (sharp vs. rounded), shadow/elevation style
- Any reference sites/brands to draw inspiration from

## 3. Elements to Restyle
- Header/navigation bar and logo area
- Hero/banner section
- Product grid and product cards
- Product detail page (images, price, buttons, tabs)
- Cart / mini-cart
- Checkout flow
- Footer
- Buttons, form inputs, and all interactive states (hover, focus, active, disabled)
- Badges/labels (sale, new, out of stock)

## 4. Requirements
- Do not change any HTML structure, IDs, JS hooks, or functionality — visual/CSS only, unless a class needs to be added/renamed for cleaner styling.
- Keep the site responsive (mobile, tablet, desktop) — test breakpoints.
- Maintain accessibility: sufficient color contrast, visible focus states, readable font sizes.
- No unused/duplicate CSS left behind after the refactor.
- Add a short comment block at the top of `styles.css` explaining the theme variable structure so future theme changes only require editing the `:root` variables.

## 5. Deliverable
- Updated `styles.css` with the full new theme, using CSS variables for easy re-theming.
- Confirmation that no CSS remains outside of `styles.css` (no inline styles, no `<style>` tags).
