import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Star } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import type { Product } from "@/lib/catalog-types";

type BestSellersSectionProps = {
  products: Product[];
};

export function BestSellersSection({ products }: BestSellersSectionProps) {
  return (
    <section className="rule-top mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="label-caps text-olive">Customer favorites</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-olive/30 bg-olive/5 px-2.5 py-1 text-xs text-olive">
              <Star className="h-3 w-3 fill-current" />
              Top-rated this quarter
            </span>
          </div>
          <h2 className="mt-4 text-3xl md:text-4xl">Best sellers</h2>
        </div>
        <Link
          to="/shop"
          className="label-caps link-underline group inline-flex items-center gap-1.5"
        >
          Shop all
          <ArrowUpRight className="h-3.5 w-3.5 -translate-x-0.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}
