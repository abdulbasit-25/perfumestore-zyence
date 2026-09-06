import heroImage from "@/assets/hero.jpg";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function HeroSection() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-20 h-96 w-96 rounded-full bg-olive/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-36 h-72 w-72 rounded-full bg-olive/5 blur-3xl"
        />

        <div className="section-shell relative flex gap-6 pb-16 pt-8 md:pt-12">
          <div className="hidden shrink-0 md:flex md:w-10 md:items-start md:justify-center">
            <span className="label-caps origin-top-left translate-y-full -rotate-90 whitespace-nowrap text-olive">
              New Collection — 2026 — Zyence
            </span>
          </div>

          <div className="grid flex-1 gap-8 md:grid-cols-12">
            <div className="rise md:col-span-5 md:pt-16">
              <p className="label-caps flex items-center gap-2 text-olive md:hidden">
                <span className="h-px w-6 bg-olive" />
                New scents · 2026
              </p>
              <h1 className="display-xl mt-4 md:mt-6">
                Scent,
                <br />
                <em className="italic">engineered</em> precisely.
              </h1>
              <p className="mt-6 max-w-sm text-base text-muted-foreground md:mt-8">
                Small-batch composed fragrances with precision blending. Eau de parfum, attars, and
                curated home scents. Inspect before you pay.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4 md:mt-10">
                <Link
                  to="/shop"
                  className="label-caps group inline-flex items-center gap-2 bg-primary px-7 py-4 text-primary-foreground shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-olive hover:text-accent-foreground"
                >
                  Explore the collection
                  <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
                <Link to="/about" className="label-caps link-underline text-muted-foreground">
                  About the studio
                </Link>
              </div>
            </div>

            <div className="relative md:col-span-7">
              <div
                aria-hidden
                className="absolute -bottom-4 -right-4 hidden h-full w-full rounded-sm border border-olive/30 md:block"
              />
              <div className="media-zoom relative overflow-hidden rounded-sm border border-border/70 bg-surface shadow-[var(--shadow-media)]">
                <img
                  src={heroImage}
                  alt="Zyence fragrance collection: luxury eau de parfum bottles in dark glass with gold accents"
                  width={1920}
                  height={1200}
                  className="aspect-[4/3] w-full rounded-sm object-cover md:aspect-[5/6]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
