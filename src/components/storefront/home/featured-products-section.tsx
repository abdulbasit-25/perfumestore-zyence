import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import type { Product } from "@/lib/catalog-types";

type FeaturedProductsSectionProps = {
  products: Product[];
  title?: string;
  eyebrow?: string;
  limit?: number;
};

export function FeaturedProductsSection({
  products,
  title = "New this season",
  eyebrow = "Fresh arrivals",
  limit = 8,
}: FeaturedProductsSectionProps) {
  const visible = products.slice(0, limit);
  if (visible.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
      {/* ── Header ─────────────────────────────── */}
      <div className="mb-10 flex items-end justify-between gap-8 md:mb-14">
        <div>
          <p className="label-caps mb-4 flex items-center gap-3 text-muted-foreground">
            <span aria-hidden className="h-px w-10 bg-olive" />
            {eyebrow}
          </p>
          <h2 className="font-display text-4xl leading-[1.05] tracking-tight md:text-6xl">
            {title}
            <sup className="label-caps ml-3 align-super text-xs text-muted-foreground md:text-sm">
              ({String(visible.length).padStart(2, "0")})
            </sup>
          </h2>
        </div>

        <Link
          to="/shop"
          className="group label-caps hidden shrink-0 items-center gap-2 pb-1.5 text-olive transition-colors hover:text-foreground md:flex"
        >
          All goods
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* ── Grid ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4">
        {visible.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      {/* ── Mobile CTA ─────────────────────────── */}
      <div className="mt-12 flex justify-center md:hidden">
        <Link
          to="/shop"
          className="label-caps flex items-center gap-2 border border-hairline px-7 py-3.5 transition-colors hover:border-olive hover:text-olive"
        >
          All goods
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
