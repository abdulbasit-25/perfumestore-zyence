import { Link } from "@tanstack/react-router";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { cn, currency } from "@/lib/utils";

type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  stock: number;
  scent?: {
    top?: string;
    heart?: string;
    base?: string;
  };
};

export function ProductCard({
  product,
  index = 0,
  onAddToCart,
  onQuickView,
  onToggleWishlist,
  isWishlisted = false,
}: {
  product: ProductCardData;
  index?: number;
  onAddToCart?: (product: ProductCardData) => void;
  onQuickView?: (product: ProductCardData) => void;
  onToggleWishlist?: (product: ProductCardData) => void;
  isWishlisted?: boolean;
}) {
  const outOfStock = product.stock === 0;

  const stopAndRun = (fn?: (p: ProductCardData) => void) => (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn?.(product);
  };

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="product-card-rise block rise"
      data-rise-delay={Math.min(index, 6)}
    >
      <motion.div
        className="relative"
        initial={{ y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="media-zoom group relative aspect-[4/5] overflow-hidden bg-surface-2 rounded-sm border border-border/50">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={1024}
            height={1280}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />

          {/* Dim overlay on hover with enhanced shadow */}
          <div className="pointer-events-none absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/5" />
          <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(14,13,12,0.1)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Stock badges */}
          {outOfStock && (
            <span className="label-caps absolute top-3 left-3 bg-background px-2 py-1 font-mono text-xs">Sold out</span>
          )}
          {!outOfStock && product.stock <= 5 && (
            <span className="label-caps absolute top-3 left-3 bg-amber-700 px-2 py-1 text-amber-50 font-mono text-xs">
              {product.stock} left
            </span>
          )}

          {/* Wishlist + quick view buttons */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <button
              type="button"
              onClick={stopAndRun(onToggleWishlist)}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={isWishlisted}
              className="grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background"
            >
              <Heart className={cn("h-3.5 w-3.5", isWishlisted && "fill-current text-amber-700")} />
            </button>
            {onQuickView && (
              <button
                type="button"
                onClick={stopAndRun(onQuickView)}
                aria-label={`Quick view ${product.name}`}
                className="grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Add to cart button */}
          {!outOfStock && onAddToCart && (
            <div className="absolute inset-x-2 bottom-2 z-10 translate-y-0 opacity-100 transition-all duration-200 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
              <button
                type="button"
                onClick={stopAndRun(onAddToCart)}
                className="label-caps flex w-full items-center justify-center gap-2 bg-primary py-2.5 text-primary-foreground transition-opacity hover:opacity-90 font-mono font-semibold text-xs"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Add to cart
              </button>
            </div>
          )}

          {/* Scent note pyramid - appears on hover */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-end p-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center space-y-1 text-white">
              {product.scent?.top && (
                <p className="text-xs font-mono uppercase tracking-widest opacity-90">Top: {product.scent.top}</p>
              )}
              {product.scent?.heart && (
                <p className="text-xs font-mono uppercase tracking-widest opacity-80">Heart: {product.scent.heart}</p>
              )}
              {product.scent?.base && (
                <p className="text-xs font-mono uppercase tracking-widest opacity-70">Base: {product.scent.base}</p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Product info with monospace pricing */}
      <div className="mt-4 space-y-2">
        <h3 className="text-base leading-snug font-serif">{product.name}</h3>
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-xs text-muted-foreground">COD Available</span>
          <span className="font-mono text-sm font-semibold text-amber-700 tracking-wider">
            {currency(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="aspect-[4/5] animate-pulse bg-surface-2" />
      <div className="mt-3 h-4 w-2/3 animate-pulse bg-surface-2" />
    </div>
  );
}
