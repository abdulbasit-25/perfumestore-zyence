import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
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
  title = "Customer Favorites",
  eyebrow = "Bestsellers",
  limit = 8,
}: FeaturedProductsSectionProps) {
  const visible = products.slice(0, limit);
  if (visible.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
      {/* Section Header */}
      <motion.div
        className="mb-10 flex items-end justify-between gap-8 md:mb-14"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div>
          <p className="label-caps mb-4 flex items-center gap-3 text-muted-foreground font-mono text-xs tracking-wider">
            <span aria-hidden className="h-px w-10 bg-amber-700" />
            {eyebrow}
          </p>
          <h2 className="font-serif text-4xl leading-[1.05] tracking-tight md:text-6xl text-foreground">
            {title}
            <sup className="label-caps ml-3 align-super text-xs text-muted-foreground md:text-sm font-mono">
              ({String(visible.length).padStart(2, "0")})
            </sup>
          </h2>
        </div>

        <Link
          to="/shop"
          className="group label-caps hidden shrink-0 items-center gap-2 pb-1.5 text-muted-foreground transition-colors hover:text-foreground md:flex font-mono font-semibold text-sm"
        >
          All products
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </motion.div>

      {/* Product Grid */}
      <motion.div
        className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {visible.map((product, i) => (
          <motion.div
            key={product.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4 }}
          >
            <ProductCard product={product} index={i} />
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile CTA */}
      <div className="mt-12 flex justify-center md:hidden">
        <Link
          to="/shop"
          className="label-caps flex items-center gap-2 border border-hairline px-7 py-3.5 transition-colors hover:border-amber-700 hover:text-amber-700 font-mono font-semibold text-sm"
        >
          All products
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
