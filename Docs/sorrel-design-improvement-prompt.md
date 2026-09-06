# Master Prompt: Full Design & UX Overhaul — Sorrel E-Commerce Platform

Paste this whole document into your coding agent (Claude Code, Cursor, etc.) as one prompt.
It covers the customer storefront, the admin dashboard, and the shared component system.

---

## 0. Context (fill in / verify before running)

- **Live site:** https://e-comerce-store-two.vercel.app/
- **Stack:** React + TanStack Router, Tailwind CSS, Zustand (`useAuth`, `useCart`, `useHydrated`), lucide-react icons, dark/light theme toggle.
- **Brand:** "Sorrel" — an atelier selling linen apparel, hand-thrown ceramics, and home objects. Positioning is quiet, slow-made, editorial, warm-neutral — think artisan/craft brand, not a generic tech marketplace. Key selling points: pay-on-delivery, 14-day returns, worldwide shipping, small-batch production.
- **Existing surfaces:** Home, Shop (with category filters), Product detail, Cart, Checkout, Account/Orders, Login, About ("Atelier"), Contact, Admin/Manager dashboard (role-gated), legal pages, newsletter signup, FAQ accordion, Instagram feed strip, a "Store Assistant" chat widget.
- **Do not** change the brand tone (warm, editorial, artisanal) into something generic/corporate. Every visual decision should reinforce "considered, slow-made, crafted" — not "SaaS dashboard."

Your job: **audit, then rebuild the design system and UI layer** across the entire app — customer-facing and admin — without breaking existing routes, data flow, or business logic. This is a *design and front-end quality* pass, not a rewrite of business logic.

---

## 1. Ground rules

1. **Audit before you touch anything.** Crawl every route (list them explicitly first) and every component in `/components`. Produce a short written inventory of: (a) components that already exist and are reusable, (b) components that are duplicated/inconsistent across pages, (c) gaps where a page hand-rolls UI that should be a shared component.
2. **Build a reusable UI layer.** Before styling individual pages, create/extend a shared component library (see §3). Every page should compose from this library — no one-off buttons, cards, inputs, badges, modals, or toasts duplicated per page.
3. **If a needed primitive doesn't exist, build it** in the shared library first, then use it. Don't inline a bespoke version on one page.
4. **One design system, two "modes."** Customer-facing pages keep the warm/editorial/artisan aesthetic. The admin dashboard uses the *same design tokens* (colors, type scale, radii, spacing, motion curves) but a denser, utilitarian layout language (tables, data cards, forms) — same DNA, different density. They should feel like siblings, not two unrelated products.
5. **Mobile and laptop are both first-class.** Every component and page must be explicitly designed (not just "shrunk") for: mobile (~360–428px), tablet (~768px), laptop (~1280–1440px), and large desktop (1600px+). Call out breakpoint-specific decisions in your implementation notes, don't just wrap things in generic `md:` classes without checking real rendering.
6. **Motion with restraint.** Add tasteful micro-interactions and transitions everywhere they earn their place (see §5) — but nothing should feel like a demo reel. Respect `prefers-reduced-motion` globally.
7. **No regressions.** Cart logic, auth, checkout flow, order creation, admin CRUD, and routing behavior must keep working exactly as before. This is a visual/UX/component-architecture pass, not a functional rewrite. Flag anywhere you had to touch logic to fix a UI bug.
8. **Accessibility is not optional.** Every interactive element needs visible focus states, correct roles/labels, sufficient contrast in both light and dark themes, and keyboard operability (menus, modals, drawers, accordions, carousels).

---

## 2. Design system foundation (do this first)

Create (or consolidate into) a single source of truth — `design-tokens.css` / Tailwind theme extension — covering:

- **Color:** neutral/warm base palette (paper, stone, olive/brand accent, ink), semantic tokens (`background`, `foreground`, `muted`, `muted-foreground`, `border`/`hairline`, `accent`, `destructive`, `success`, `warning`), each with a light and dark value. Audit current usage of `bg-background`, `text-olive`, `border-hairline`, etc. and make sure every color in the app resolves to a token — no raw hex/`text-gray-500` scattered around.
- **Typography:** confirm the display serif/editorial font pairing with a workhorse sans for UI text; define a proper type scale (display, h1–h4, body-lg, body, small, label-caps) with consistent line-height and tracking, and make sure it's used consistently (right now "label-caps" appears ad hoc — formalize it as a real utility/component).
- **Spacing & radius scale:** one spacing scale, one radius scale (sharp-ish for an artisan brand — avoid overly rounded "app" corners that clash with the editorial tone).
- **Elevation/shadow scale:** 3–4 shadow levels max, used consistently for cards, dropdowns, modals, sticky headers-on-scroll.
- **Motion tokens:** a shared set of durations/easings (e.g., `--ease-out-quad`, 150/200/300ms tiers) so every transition in the app feels like it belongs to the same system instead of being hand-tuned per component.
- **Container/grid system:** a consistent max-width + gutter system (I saw `max-w-[1500px]` in the header — confirm this is the *one* container width used everywhere, or standardize it).

Deliver this as an actual token file + Tailwind config update, not just a written spec.

---

## 3. Reusable component library to build/consolidate

Build these as a proper internal library (e.g. `/components/ui`) if they don't already exist in a consistent form. Use shadcn/ui-style primitives as a base where sensible, then re-skin to the Sorrel aesthetic:

**Core primitives**
- Button (primary/secondary/ghost/link/destructive, with loading state, icon-leading/trailing, size variants)
- Input, Textarea, Select, Checkbox, Radio, Switch — all with consistent label/error/helper-text pattern
- Badge/Chip (for stock status, category tags, order status, "new"/"sale")
- Card (product card, info card, stat card variants sharing one base)
- Avatar
- Tooltip
- Skeleton loader (for every async surface — product grids, orders table, dashboard stats)
- Empty state (empty cart, empty search results, empty orders, empty admin table)

**Overlay/navigation**
- Modal/Dialog (confirmations, quick-view)
- Drawer/Sheet (mobile nav — already exists in header, formalize it; also use for filters on mobile shop page, and admin mobile nav)
- Dropdown menu / Popover
- Toast/notification system (add-to-cart confirmation, form errors, admin action feedback — audit whether this exists consistently; if not, build one global toast provider)
- Tabs
- Accordion (already used for FAQ — reuse the same primitive for product detail "shipping/returns" tabs, admin filters, etc.)
- Pagination

**Commerce-specific**
- ProductCard (grid + list variants, image hover effect, price/sale price, quick-add)
- ProductGallery (product detail image viewer with zoom/thumbnails, swipeable on mobile)
- CartLineItem (shared between cart page and any mini-cart/drawer)
- PriceDisplay (handles currency, sale strikethrough, consistently everywhere)
- StockBadge / OrderStatusBadge (color-coded, shared between customer order history and admin orders table)
- QuantityStepper
- RatingStars (if reviews exist or are planned)
- FilterPanel / SortDropdown (shop page)

**Admin-specific**
- DataTable (sortable, paginated, with row actions, bulk-select, responsive — collapses to stacked cards on mobile/tablet instead of horizontal-scrolling an unreadable table)
- StatCard / KPI tile (for dashboard overview)
- FormSection (consistent admin form layout: label, input, description, error)
- PageHeader (title + breadcrumb + primary action, consistent across every admin screen)
- Sidebar nav (collapsible, active-state, icon+label, mobile → drawer)

**Layout**
- Section wrapper (consistent vertical rhythm between homepage sections — hero, "how it's made," best sellers, newsletter, FAQ, Instagram feed, contact)
- SiteHeader / SiteFooter (already exist — refine per §4)
- Container

Document each component's variants/props briefly as you build them (a lightweight internal style-guide page at `/dev/components` or similar is encouraged, even if stripped from production).

---

## 4. Customer-facing storefront — page-by-page

For every page below: define the mobile layout AND the laptop/desktop layout explicitly (not just "it reflows"), and use the shared components from §3.

- **Header/Nav:** Sticky header, correct active-link highlighting per section *and* category (not just per route — e.g. "Apparel" and "Ceramics" both route to `/shop` with different query params, so active state must check the query, not just the path). Mobile drawer with backdrop, scroll-lock, escape-to-close, animated icon swap. Add a subtle scroll-shadow/border-strengthen effect once the user scrolls down. Cart badge with live count and micro-animation on item add.
- **Homepage:** Hero with clear CTA hierarchy; "how it's made" 4-step process section (add scroll-reveal, connecting line/progress on desktop, stacked timeline on mobile); trust badges row (pay on delivery, returns, shipping, secure checkout) as a shared "TrustBadge" component; best-sellers carousel/grid with real product card component and hover states; newsletter section with proper form validation + success state; FAQ accordion (shared Accordion); Instagram feed strip (lazy-loaded images, hover overlay, keyboard accessible); footer.
- **Shop/PLP:** Filter/sort UI — sidebar on desktop, bottom-sheet/drawer on mobile (use the Drawer primitive) — with active-filter chips, clear-all, result count, empty-state when filters return nothing. Product grid: responsive column count (2 mobile / 3 tablet / 4 desktop), skeleton loading state, consistent ProductCard with hover image-swap or zoom, wishlist/quick-add if applicable. Pagination or infinite scroll — pick one and make it consistent.
- **PDP (Product detail):** Gallery with swipe-on-mobile + zoom-on-desktop, sticky "add to cart" bar on mobile once you scroll past the main CTA, size/variant selector with clear selected/unavailable states, accordion for details/shipping/returns, related products row, add-to-cart micro-interaction (button state change + toast + cart badge bump).
- **Cart:** Line items using the shared CartLineItem, quantity stepper, remove with undo toast, order summary card, empty-cart state with CTA back to shop, sticky checkout button on mobile.
- **Checkout:** Clear step indicator (address → review → confirm, given COD means no payment step), inline validation, order summary visible/sticky on desktop, collapsible on mobile, loading/success states.
- **Account/Orders:** Order history as responsive table→card list, order-status badges shared with admin, empty state for no orders, profile/address management forms using shared form components.
- **Login/Auth:** Clean, centered, on-brand (not a generic auth-template look), clear error states, loading states on submit.
- **About/Atelier, Contact, Legal pages:** Long-form content should use a consistent editorial reading-width container, good typographic rhythm; contact form uses shared form components + success/error toast.
- **Store Assistant chat widget:** Make sure its trigger button, panel, and message bubbles use the shared design tokens (currently likely styled independently) — should feel native to the site, not like a bolted-on third-party widget. Proper mobile sizing (full-screen sheet on small viewports, floating panel on desktop).

---

## 5. Effects & micro-interactions (apply system-wide, not per-page hacks)

Build these as reusable patterns/hooks (e.g. a `useScrollReveal` hook, a shared `motion` wrapper), not copy-pasted per component:

- Scroll-reveal fade/slide-up for section entrances (homepage sections, PDP sections)
- Hover states: buttons (scale/opacity/underline-draw), product cards (image crossfade or subtle zoom), nav links (underline-draw — already hinted at with `link-underline`, make sure it's consistently applied)
- Page-transition or at least route-change scroll-to-top + subtle fade
- Skeleton loading everywhere data is fetched (products, orders, admin tables, dashboard stats) instead of blank space or spinners-only
- Toast entrance/exit animation
- Modal/drawer open/close with backdrop fade + panel slide/scale
- Add-to-cart: button micro-feedback (checkmark/loading pulse) + cart icon bump animation
- Number/stat count-up animation on admin dashboard KPIs
- Respect `prefers-reduced-motion: reduce` for all of the above — provide instant/no-motion fallback

---

## 6. Admin dashboard — specific requirements

- **Layout:** persistent sidebar on desktop/laptop (collapsible to icon-only), converts to a top bar + drawer on mobile/tablet. Consistent PageHeader on every screen (title, breadcrumb, primary action button).
- **Dashboard/overview:** KPI stat cards (revenue, orders, customers, low-stock) with trend indicators, a recent-orders table, a simple chart (orders/revenue over time) — keep charts on-brand (muted palette, not default chart-library rainbow colors).
- **Products management:** table with search/filter/sort, bulk actions, inline stock/status editing where reasonable, image thumbnails, responsive collapse to cards on small screens.
- **Orders management:** status pipeline clearly visualized, filter by status/date, order detail view reusing the same components as customer order history where sensible (shared OrderStatusBadge, PriceDisplay, etc.), quick status-update actions with confirmation + toast feedback.
- **Customers/Users, role management (admin/manager):** consistent table pattern, role badges, safe-guarded destructive actions (confirm dialogs).
- **Forms everywhere in admin** (create/edit product, etc.) use the shared FormSection/Input/Select components — no bespoke form styling per page.
- **Empty/error/loading states** for every admin data view, not just the happy path.
- **Mobile admin is a real requirement**, not an afterthought — assume a manager might update order status from a phone.

---

## 7. Responsiveness & device QA checklist

For every page/component, explicitly verify and note in your output:

- [ ] 360–390px (small mobile)
- [ ] 428px (large mobile)
- [ ] 768px (tablet/portrait)
- [ ] 1024–1280px (small laptop)
- [ ] 1440–1600px+ (desktop/large laptop)
- [ ] Touch targets ≥ 40px on mobile for every clickable element
- [ ] No horizontal scroll anywhere unintentional
- [ ] Sticky elements (header, mobile add-to-cart bar, checkout summary) don't overlap content or cause layout shift
- [ ] Images have explicit aspect ratios to prevent CLS
- [ ] Dark mode checked on every rebuilt component, not just light mode

---

## 8. Deliverables & how to report back

When you finish (or after each major milestone), provide:

1. **Component inventory + gap analysis** (from step 1).
2. **List of new/updated shared components** with a one-line description of each.
3. **Design tokens file** (colors, type, spacing, radius, shadow, motion) — diffed or shown in full.
4. **Page-by-page summary** of what changed, with particular note of any mobile-specific vs. desktop-specific layout decisions.
5. **Known trade-offs or follow-ups** you didn't get to, and anything where you had to touch business logic to fix a UI bug (per rule §1.7).
6. Confirm nothing in cart/auth/checkout/admin CRUD behavior regressed.

Work incrementally: design tokens + core UI primitives first, then storefront pages, then admin. Don't attempt everything in one giant diff — checkpoint after each phase so it can be reviewed.
