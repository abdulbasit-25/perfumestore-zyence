# Zyence Rebrand & Redesign — Master Prompt

Paste this into your AI builder (Lovable / Claude Code / v0) or hand it to a developer. It's written as a direct instruction set, section by section, matching your existing stack (React + TanStack Router + Vite + shadcn/ui + Tailwind).

---

## 0. The problem to fix

The current site reads as a templated "AI-generated store": generic hero copy, stock badge-row ("SLOW-MADE / HAND-THROWN / PAY ON DELIVERY"), a feed grid with placeholder captions, and no sensory or material identity. A perfume brand sells atmosphere, not bullet points. Every section below exists to replace generic SaaS-template patterns with something that feels composed, tactile, and specific to fragrance.

---

## 1. Brand direction

> **Zyence — precision perfumery.** The brand idea is "formulated to the decimal": scent as chemistry and craft at once. Lean into that tension — clinical precision (grid systems, exact numbers, lab-note typography) layered over warm, sensory materials (amber glass, oil, light through liquid).

**Mood references:** Aesop, Le Labo, Byredo, D.S. & Durga — apothecary-meets-laboratory, not "influencer luxury."

**Tone of voice:** short declarative sentences, technical precision ("22% concentration," "72-hour maceration"), no exclamation points, no generic superlatives ("amazing," "premium").

---

## 2. Visual system

- **Palette:** near-black (#0E0D0C), warm bone/cream (#F4EFE7), one amber/oil accent (#B4763B or similar), one deep glass green or aubergine as a secondary accent. Avoid pure white and pure black.
- **Typography:** a high-contrast serif for display headlines (e.g. a Didone like Canela, GT Sectra, or Fraunces) paired with a technical monospace or grotesk for labels, prices, and UI chrome (e.g. Söhne Mono, JetBrains Mono). The mono typeface is what sells the "decimal precision" idea — use it for batch numbers, percentages, timestamps.
- **Grain & texture:** subtle film-grain overlay (CSS/SVG noise) across dark sections so black doesn't look flat/digital.
- **Photography direction:** macro shots of liquid, glass, light refraction, dropper close-ups — not lifestyle stock photography.

---

## 3. Homepage — section-by-section rebuild

### 3.1 Hero
- Replace the static hero image with a **Three.js / React Three Fiber scene**: a single rotating perfume bottle (glass material with `MeshPhysicalMaterial`, transmission + roughness for realistic glass), slowly auto-rotating, tilting toward the cursor on mousemove (subtle, ±8°).
- Liquid inside the bottle can be a simple shader (fresnel + a slow noise-driven surface wobble) to suggest it's real oil, not a static render.
- Headline in the serif display face, a single precise sub-line ("Batch-tested. Skin-tested. Nothing shipped by guess."), and a CTA button with a **magnetic hover** (button slightly follows cursor within its bounds, GSAP or Framer Motion `useMotionValue`).
- On scroll, the bottle scene pins briefly and the label data (notes, concentration %, batch number) counts up/types in next to it — this replaces the generic badge row.

### 3.2 "The formula" (replaces the 4-badge row)
- A horizontal precision diagram: top notes / heart notes / base notes laid out like a lab readout, each with a percentage, revealed with a scroll-triggered stagger (Framer Motion `whileInView`).
- Hover a note → a thin line draws from it to a live-updating scent wheel/radar chart (SVG, animated with Framer Motion or a small D3 arc).

### 3.3 Process ("How it's made")
Keep the 4-step structure (Compose / Blend / Bottle / Ship) but:
- Give each step a short looping macro video or WebM (2–4s) instead of an icon, autoplaying muted, cropped into a rounded glass-shaped mask.
- Steps connect with an animated dashed line that draws itself as the section scrolls into view.

### 3.4 Product grid ("Customer favorites")
- Product cards: on hover, cross-fade from packaging shot to an "in-light" shot (liquid catching light), bottle lifts 4px with a soft shadow bloom, and the note pyramid (top/heart/base) fades in beneath the name.
- Add a **quick-look** interaction: hover-and-hold or a small expand icon opens a lightweight 3D preview (reuse the hero's R3F bottle component, swap the material color/label) instead of a static modal.
- Price and "COD" tag rendered in the mono typeface for the lab-note feel.

### 3.5 Pay-on-delivery section
Reframe as **"On trust, not on faith"** — three-step iconography (Inspect → Nothing upfront → Courier collects) with icons redrawn as thin-line technical diagrams rather than generic checkmarks. Animate the icons with a subtle stroke-draw-on-scroll (SVG `stroke-dashoffset` animation).

### 3.6 Ingredient/material transparency section (new — add this)
Perfume brands that don't feel AI-generated always show raw material sourcing. Add a section: a horizontal scroll-snap gallery of 4–6 raw ingredients (bergamot, oud, ambergris substitute, etc.), each with origin, extraction method, and a macro photo. This single section does more for "not a generic store" credibility than any animation will.

### 3.7 Newsletter
Keep, but replace the flat input with a bordered "lab requisition" style field (monospace placeholder, thin underline that fills on focus) and a subtle particle-dissolve confirmation animation on subscribe.

### 3.8 Social feed
Replace generic "View post" captions with a masonry grid, grain-overlay hover state (image desaturates to warm sepia, caption slides up), no Instagram-clone framing.

### 3.9 FAQ
Keep accordion but style with the mono-serif contrast and add a thin animated accent line that grows on the open item.

### 3.10 Footer
Keep structure; add a subtle noise/gradient background so it doesn't read as flat black, and make the "Back to top" a small circular button with a magnetic hover + rotate-on-hover icon.

---

## 4. Micro-interactions checklist

- **Magnetic buttons** on all primary CTAs (cursor-follow within bounds).
- **Custom cursor** on desktop: small dot + trailing ring that scales up over interactive elements and product images (skip on touch devices).
- **Scroll-linked reveals**: fade + 12px rise, staggered by 80–120ms per item, using `whileInView` (Framer Motion) — never instant pop-ins.
- **Product image hover**: crossfade + 1.02 scale, 400–500ms ease-out.
- **Page transitions**: on route change (TanStack Router), a brief 250ms cross-fade/slide rather than a hard cut.
- **Loading state**: a thin liquid-fill progress bar (amber accent) instead of a generic spinner — reinforces the brand.

---

## 5. Technical implementation notes (matches your stack)

- **Three.js:** use `@react-three/fiber` + `@react-three/drei` (OrbitControls disabled/limited, `Environment` for reflections, `MeshTransmissionMaterial` from drei for realistic glass — much easier than hand-rolling shaders).
- **Animation:** Framer Motion for DOM/scroll animations; GSAP (+ ScrollTrigger) if you want more control over the process-section scrubbing.
- **Performance:** lazy-load the R3F canvas (only mount hero scene after initial paint), provide a static poster-image fallback for reduced-motion users and low-end devices (`prefers-reduced-motion` media query — disable auto-rotate and parallax entirely, not just slow it down).
- **Component reuse:** your existing shadcn/ui primitives (`button.tsx`, `card.tsx`, `dialog.tsx`) can stay as the functional base — apply the new type scale, color tokens, and motion wrapper components on top rather than rebuilding from scratch.
- **Assets:** macro video loops should be served as compressed WebM/MP4 (<1.5MB each) and lazy-loaded per section to avoid tanking LCP.

---

## 6. What NOT to do

- No stock "lifestyle influencer holding product" photography.
- No generic checkmark icon rows.
- No infinite marquee of buzzwords (the "CASH ON DELIVERY • PAY ON RECEIPT •" ticker reads as template filler — replace or remove it).
- No emoji, no exclamation points in copy.
- Don't animate everything at once — pick 2–3 signature interactions (hero bottle, magnetic CTA, scroll-stagger reveals) and execute them well rather than adding motion everywhere.

---

## 7. Deliverable order (if handing to an AI builder in stages)

1. Design tokens (colors, type scale, spacing) + grain overlay utility
2. Hero section with R3F bottle scene + fallback poster
3. Product grid with hover/quick-look
4. Process + ingredient sourcing sections
5. Micro-interactions pass (cursor, magnetic buttons, page transitions)
6. Performance + reduced-motion audit
