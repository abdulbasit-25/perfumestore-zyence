import { createFileRoute, Link } from "@tanstack/react-router";
import { StoreShell } from "@/components/storefront/shell";
import { ArrowRight, HeartHandshake, Leaf, ShieldCheck, Sparkles, Star } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Sorrel" },
      {
        name: "description",
        content:
          "Learn about Sorrel, our mission, our values, and why customers choose us for considered home goods and everyday essentials.",
      },
      { property: "og:title", content: "About Us — Sorrel" },
      {
        property: "og:description",
        content:
          "A more thoughtful way to shop, with quality materials, personal service, and a clear sense of purpose.",
      },
    ],
  }),
  component: About,
});

const values = [
  {
    icon: ShieldCheck,
    title: "Trust first",
    body: "We keep our product selection clear, our communication direct, and our service grounded in the details that matter to real customers.",
  },
  {
    icon: Leaf,
    title: "Thoughtful materials",
    body: "We focus on useful, durable pieces and natural finishes that feel good to live with over time.",
  },
  {
    icon: HeartHandshake,
    title: "Service with care",
    body: "Every order is treated as a relationship, not a transaction — from the first click through delivery and follow-up.",
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
            A calmer way to shop for everyday essentials.
          </h1>

          <div className="mt-12 grid gap-10 md:grid-cols-12 md:items-center">
            <div className="space-y-5 text-base leading-7 text-muted-foreground md:col-span-6">
              <p>
                Sorrel is an independent store focused on everyday goods that are useful, beautiful,
                and easy to live with. We curate products with intention, balancing quality and
                simplicity so customers can build a home or wardrobe that feels considered rather
                than cluttered.
              </p>
              <p>
                Our brand stands for thoughtful design, honest materials, and a slower rhythm of
                shopping. We believe that good products should make daily life easier, more
                comfortable, and more joyful without excess or complexity.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/shop"
                  className="label-caps group inline-flex items-center gap-2 bg-primary px-6 py-3.5 text-primary-foreground transition-colors hover:bg-olive hover:text-accent-foreground"
                >
                  Shop now
                  <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
                <Link to="/shop" className="label-caps link-underline text-muted-foreground">
                  Explore our products
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
                  src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
                  alt="A warm, minimal home environment with natural textures"
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
              Built around usefulness, character, and trust.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-7 text-muted-foreground">
              <p>
                We began with a simple idea: a better shopping experience should feel personal,
                informed, and easy to trust. Instead of flooding the market with disposable
                products, we select pieces that look good in daily life and stand up to repeated
                use.
              </p>
              <p>
                That philosophy shapes everything we do — from the brands we carry to the way we
                communicate with customers. We prefer clarity over noise, quality over excess, and a
                supportive experience over a rushed one.
              </p>
              <p>
                Customers return to Sorrel because they know they will find products they can rely
                on and a store that values their time, questions, and confidence. We are committed
                to being a dependable place to shop for the pieces that make home and routine feel a
                little more considered.
              </p>
            </div>
          </div>

          <div className="rounded-sm border border-border/60 bg-surface p-6 md:p-8">
            <p className="label-caps flex items-center gap-2 text-olive">
              <Sparkles className="h-3.5 w-3.5" />
              Why customers choose us
            </p>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-muted-foreground">
              <li className="flex gap-3">
                <Star className="mt-0.5 h-4 w-4 shrink-0 text-olive" />
                Carefully chosen products with a clear point of view.
              </li>
              <li className="flex gap-3">
                <Star className="mt-0.5 h-4 w-4 shrink-0 text-olive" />
                Clear communication and straightforward customer service.
              </li>
              <li className="flex gap-3">
                <Star className="mt-0.5 h-4 w-4 shrink-0 text-olive" />A focus on quality and
                long-term value instead of trends for their own sake.
              </li>
              <li className="flex gap-3">
                <Star className="mt-0.5 h-4 w-4 shrink-0 text-olive" />A retail experience built to
                feel warm, informed, and easy to navigate.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </StoreShell>
  );
}
