import heroImage from "@/assets/hero.jpg";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/magnetic-button";

const EYEBROW = "Precision Perfumery";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-20 h-96 w-96 rounded-full bg-amber-900/5 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-36 h-72 w-72 rounded-full bg-amber-700/5 blur-3xl"
      />

      <div className="section-shell relative flex gap-6 pb-16 pt-8 md:pt-12">
        <div className="hidden shrink-0 md:flex md:w-10 md:items-start md:justify-center">
          <span className="label-caps origin-top-left translate-y-full -rotate-90 whitespace-nowrap text-amber-700">
            {EYEBROW}
          </span>
        </div>

        <div className="grid flex-1 gap-8 md:grid-cols-12">
          {/* Left content column */}
          <motion.div
            className="rise md:col-span-5 md:pt-16"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="label-caps flex items-center gap-2 text-amber-700 md:hidden">
              <span className="h-px w-6 bg-amber-700" />
              {EYEBROW}
            </p>
            <h1 className="display-xl mt-4 md:mt-6 text-foreground font-serif">
              Formulated
              <br />
              to the decimal.
            </h1>
            <p className="mt-6 max-w-sm text-base text-muted-foreground md:mt-8">
              Small-batch eau de parfum, attars, and home scents—each accord weighed and re-tested
              on skin before it ships. Inspect before you pay.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4 md:mt-10">
              <MagneticButton
                as="a"
                href="/shop"
                className="label-caps group inline-flex items-center gap-2 bg-primary px-7 py-4 text-primary-foreground shadow-[var(--shadow-soft)] transition-all duration-200 hover:bg-amber-900 font-mono font-semibold text-sm"
              >
                Explore collection
                <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </MagneticButton>
              <Link
                to="/about"
                className="label-caps link-underline text-muted-foreground font-mono text-sm"
              >
                About studio
              </Link>
            </div>

            {/* Batch info displayed in monospace — "decimal precision" aesthetic */}
            <motion.div
              className="mt-12 space-y-2 pt-8 border-t border-border/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="font-mono text-xs text-muted-foreground tracking-wider">
                BATCH 2026-001
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                22% concentration • 72h maceration
              </p>
            </motion.div>
          </motion.div>

          {/* Right image column */}
          <motion.div
            className="relative md:col-span-7"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div
              aria-hidden
              className="absolute -bottom-4 -right-4 hidden h-full w-full rounded-sm border border-amber-900/20 md:block"
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
