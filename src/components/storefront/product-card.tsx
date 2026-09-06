import { Link } from "@tanstack/react-router";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { cn, currency } from "@/lib/utils";

type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  stock: number;
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

  // Buttons live inside the <Link>; preventDefault + stopPropagation stop
  // them from triggering navigation to the product page.
  const stopAndRun = (fn?: (p: ProductCardData) => void) => (e: React.MouseEvent) => {
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
      <div className="media-zoom group relative aspect-[4/5] overflow-hidden bg-surface-2">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1280}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* Dim overlay on hover */}
        <div className="pointer-events-none absolute inset-0 bg-background/0 transition-colors duration-200 group-hover:bg-background/10" />

        {/* Stock badges */}
        {outOfStock && (
          <span className="label-caps absolute top-3 left-3 bg-background px-2 py-1">Sold out</span>
        )}
        {!outOfStock && product.stock <= 5 && (
          <span className="label-caps absolute top-3 left-3 bg-olive px-2 py-1 text-accent-foreground">
            {product.stock} left
          </span>
        )}

        {/* Wishlist + quick view — top right */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
          <button
            type="button"
            onClick={stopAndRun(onToggleWishlist)}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isWishlisted}
            className="grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background"
          >
            <Heart className={cn("h-3.5 w-3.5", isWishlisted && "fill-current text-olive")} />
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

        {/* Add to cart — slides up from bottom on hover (desktop), always visible on touch */}
        {!outOfStock && onAddToCart && (
          <div className="absolute inset-x-2 bottom-2 z-10 translate-y-0 opacity-100 transition-all duration-200 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
            <button
              type="button"
              onClick={stopAndRun(onAddToCart)}
              className="label-caps flex w-full items-center justify-center gap-2 bg-primary py-2.5 text-primary-foreground transition-opacity hover:opacity-90"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Add to cart
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h3 className="text-lg leading-snug">{product.name}</h3>
        <span className="text-sm text-muted-foreground">{currency(product.price)}</span>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-[4/5] animate-pulse bg-surface-2" />
      <div className="mt-3 h-4 w-2/3 animate-pulse bg-surface-2" />
    </div>
  );
}
