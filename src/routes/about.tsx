import { createFileRoute, Link } from "@tanstack/react-router";
import { StoreShell } from "@/components/storefront/shell";
import { ArrowRight, Droplets, HeartHandshake, Leaf, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Zyence" },
      {
        name: "description",
        content:
          "Zyence is an independent perfume house composing fragrances from honestly sourced aromatics, in small batches, for people who wear scent as a signature rather than a habit.",
      },
      { property: "og:title", content: "About Us — Zyence" },
      {
        property: "og:description",
        content:
          "How we source, compose, and bottle — and why we'd rather make five fragrances well than fifty forgettably.",
      },
    ],
  }),
  component: About,
});

const values = [
  {
    icon: Leaf,
    title: "Honest sourcing",
    body: "We name every aromatic we use, where it grows, and who grows it — from Bulgarian rose to Haitian vetiver — so you know what you're actually wearing.",
  },
  {
    icon: Sparkles,
    title: "Composed, not assembled",
    body: "Each fragrance is built in top, heart, and base notes over months of iteration on skin, not just on paper — so it still smells like itself six hours in.",
  },
  {
    icon: HeartHandshake,
    title: "Discovery over guesswork",
    body: "Sample sets, honest notes on how a scent wears, and a team that will tell you when a fragrance isn't right for you.",
  },
];

function About() {
  return (
    <StoreShell>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full bg-olive/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-olive/5 blur-3xl"
        />

        <div className="relative mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
          <p className="label-caps flex items-center gap-2 text-olive">
            <span className="h-px w-6 bg-olive" />
            About us
          </p>
          <h1 className="display-xl mt-6 max-w-4xl">
            Fragrance built note by note, not off a shelf of shortcuts.
          </h1>

          <div className="mt-12 grid gap-10 md:grid-cols-12 md:items-center">
            <div className="space-y-5 text-base leading-7 text-muted-foreground md:col-span-6">
              <p>
                Zyence is an independent perfume house. We compose scents in small batches, working
                from raw aromatics — absolutes, resins, isolates — rather than pre-blended bases,
                because that's the only way to know exactly what's in a bottle and why it smells the
                way it does.
              </p>
              <p>
                Every fragrance starts as dozens of trial accords on blotter and skin before we
                commit to a formula. We'd rather spend a year getting one composition right than
                release six that are merely fine.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/shop"
                  className="label-caps group inline-flex items-center gap-2 bg-primary px-6 py-3.5 text-primary-foreground transition-colors hover:bg-olive hover:text-accent-foreground"
                >
                  Shop the collection
                  <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
                <Link to="/shop" className="label-caps link-underline text-muted-foreground">
                  Order a discovery set
                </Link>
              </div>
            </div>

            <div className="relative md:col-span-6">
              <div
                aria-hidden
                className="absolute -bottom-5 -right-5 h-full w-full rounded-sm border border-olive/30"
              />
              <div className="media-zoom relative overflow-hidden rounded-sm border border-border/60 shadow-[var(--shadow-media-about)]">
                <img
                  src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80"
                  alt="Amber perfume bottle and raw aromatic ingredients on a work bench"
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rule-top mx-auto max-w-[1500px] px-5 py-16 md:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group relative rounded-sm border border-border/60 bg-surface p-7 theme-card-hover"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-olive/30 text-olive transition-colors duration-300 group-hover:bg-olive group-hover:text-surface">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-display mt-6 text-xl">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rule-top mx-auto max-w-[1500px] px-5 py-16 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <p className="label-caps text-olive">Our story</p>
            <h2 className="mt-4 text-4xl leading-tight md:text-5xl">
              Started on a kitchen table with a mixing kit and too many blotter strips.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-7 text-muted-foreground">
              <p>
                Zyence began with a founder frustrated by how little most fragrance brands would
                tell her about what she was actually spraying on her skin. Formulas listed as
                "parfum," notes described in mood-board language, no real answer to a simple
                question: what's in this bottle?
              </p>
              <p>
                So she started blending on her own — a bergamot here, an oud accord there, testing
                how they aged over a day rather than judging them fresh off the strip. What began as
                a hobby became a habit, and the habit became a house: today Zyence works with
                growers and distillers directly, keeps formulas on file for anyone who asks, and
                composes every scent to be worn, not just sampled.
              </p>
              <p>
                We're still small. Every batch is mixed, macerated, and bottled by hand, and every
                fragrance carries a real perfumer's name, not a marketing one. Customers come back
                because a Zyence bottle smells the same on day one hundred as it did on day one —
                and because when they ask what's in it, we actually tell them.
              </p>
            </div>
          </div>

          <div className="rounded-sm border border-border/60 bg-surface p-6 md:p-8">
            <p className="label-caps flex items-center gap-2 text-olive">
              <Droplets className="h-3.5 w-3.5" />
              How we work
            </p>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-muted-foreground">
              <li className="flex gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-olive" />
                Full notes for every fragrance — top, heart, and base — listed on the product page,
                not hidden behind "parfum."
              </li>
              <li className="flex gap-3">
                <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-olive" />
                Aromatics sourced from named growers and distillers, with sustainable alternatives
                used wherever an ingredient is under pressure.
              </li>
              <li className="flex gap-3">
                <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-olive" />
                Small-batch macerated for a minimum of four weeks before bottling, so the accord has
                time to settle before it reaches you.
              </li>
              <li className="flex gap-3">
                <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-olive" />
                Discovery sets and honest wear-testing notes, so you can find your scent before
                committing to a full bottle.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </StoreShell>
  );
}
