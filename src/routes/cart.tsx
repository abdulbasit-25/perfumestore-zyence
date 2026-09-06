import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { StoreShell } from "@/components/storefront/shell";
import { getProductsByIds } from "@/lib/product-server";
import { cartDetail, useCart, useHydrated } from "@/lib/store";
import { currency, cn } from "@/lib/utils";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your bag — Zyence" },
      {
        name: "description",
        content: "Review the pieces in your bag before placing a pay-on-delivery order.",
      },
      { property: "og:title", content: "Your bag — Zyence" },
      {
        property: "og:description",
        content: "Review your bag and check out with cash on delivery.",
      },
    ],
  }),
  component: CartPage,
});

const FREE_SHIPPING_THRESHOLD = 200;

function CartPage() {
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const activeLines = hydrated ? lines : [];

  const {
    data: products = [],
    isPending,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["cart-products", activeLines.map((line) => line.productId)],
    queryFn: () => getProductsByIds({ data: activeLines.map((line) => line.productId) }),
    enabled: hydrated,
  });

  const { items, subtotal, shipping, total } = cartDetail(activeLines, products);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <StoreShell>
      <div className="mx-auto max-w-[1500px] px-5 py-10 pb-28 md:px-10 md:py-12 md:pb-12">
        <h1 className="text-4xl sm:text-5xl md:text-7xl">Your bag</h1>

        {!hydrated || isPending ? (
          <div className="mt-10 space-y-4 border-t border-hairline pt-6 md:mt-12">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-5">
                <div className="aspect-[4/5] w-24 shrink-0 animate-pulse bg-surface-2" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-4 w-2/3 animate-pulse bg-surface-2" />
                  <div className="h-3 w-1/3 animate-pulse bg-surface-2" />
                  <div className="mt-8 h-8 w-24 animate-pulse bg-surface-2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div
            role="alert"
            className="mt-10 flex flex-col items-start gap-4 border border-destructive/40 bg-destructive/5 p-6 md:mt-12"
          >
            <p className="text-destructive">Unable to load your bag. Please try again.</p>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="label-caps border border-destructive/50 px-5 py-2 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              {isFetching ? "Retrying…" : "Retry"}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-14 flex flex-col items-start border-t border-hairline pt-14 sm:mt-16 sm:pt-16">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" strokeWidth={1.25} />
            <p className="mt-6 font-display text-3xl sm:text-4xl">Nothing in the bag yet</p>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Pieces you add will wait here. Everything ships pay-on-delivery.
            </p>
            <Link
              to="/shop"
              className="label-caps mt-8 bg-primary px-7 py-4 text-primary-foreground transition-opacity hover:opacity-90"
            >
              Browse the collection
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 md:mt-12 md:grid-cols-[1fr_360px] md:gap-16">
            <div className="border-t border-hairline">
              {items.map(({ product, qty }) => (
                <CartLine
                  key={product.id}
                  product={product}
                  qty={qty}
                  onQtyChange={(next) => setQty(product.id, next)}
                  onRemove={() => remove(product.id)}
                />
              ))}
            </div>

            {/* Order summary — sticky on desktop, static (feeds the mobile sticky bar) on mobile */}
            <aside className="h-fit bg-surface p-6 sm:p-8 md:sticky md:top-24">
              <p className="label-caps text-muted-foreground">Summary</p>

              {remainingForFreeShipping > 0 ? (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">
                    Add{" "}
                    <span className="text-foreground">{currency(remainingForFreeShipping)}</span>{" "}
                    more for free shipping
                  </p>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-hairline">
                    <div
                      className="h-full rounded-full bg-olive transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-olive">You've unlocked free shipping</p>
              )}

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Subtotal · {items.reduce((n, i) => n + i.qty, 0)} item
                    {items.reduce((n, i) => n + i.qty, 0) === 1 ? "" : "s"}
                  </dt>
                  <dd>{currency(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd>{shipping === 0 ? "Free" : currency(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-hairline pt-3 text-base">
                  <dt>Total</dt>
                  <dd>{currency(total)}</dd>
                </div>
              </dl>

              <Link
                to="/checkout"
                className="label-caps mt-8 hidden bg-primary px-6 py-4 text-center text-primary-foreground transition-colors hover:bg-olive hover:text-accent-foreground md:block"
              >
                Checkout
              </Link>
              <p className="mt-4 text-center text-xs text-muted-foreground md:text-left">
                Payment is collected on delivery.
              </p>
            </aside>
          </div>
        )}
      </div>

      {/* Mobile sticky checkout bar */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-background/95 px-5 py-3 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-medium">{currency(total)}</p>
            </div>
            <Link
              to="/checkout"
              className="label-caps flex-1 bg-primary px-6 py-3 text-center text-primary-foreground transition-colors hover:bg-olive hover:text-accent-foreground"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </StoreShell>
  );
}

function CartLine({
  product,
  qty,
  onQtyChange,
  onRemove,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    sku: string;
    image: string;
    price: number;
    stock?: number;
  };
  qty: number;
  onQtyChange: (next: number) => void;
  onRemove: () => void;
}) {
  const [removing, setRemoving] = useState(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const atMax = typeof product.stock === "number" ? qty >= product.stock : false;

  const handleRemoveClick = () => {
    // Soft-remove with a brief undo window instead of removing instantly.
    setRemoving(true);
    undoTimer.current = setTimeout(() => {
      onRemove();
    }, 3000);
  };

  const handleUndo = () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setRemoving(false);
  };

  if (removing) {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-hairline py-6 text-sm text-muted-foreground">
        <span>Removed {product.name}</span>
        <button onClick={handleUndo} className="label-caps text-olive underline underline-offset-4">
          Undo
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-4 border-b border-hairline py-6 sm:gap-5">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="media-zoom w-20 shrink-0 sm:w-24"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1280}
          className="aspect-[4/5] w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="text-base sm:text-lg"
          >
            {product.name}
          </Link>
          <button
            onClick={handleRemoveClick}
            aria-label={`Remove ${product.name} from bag`}
            className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">{product.sku}</p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          <div className="flex items-center border border-hairline text-sm">
            <button
              onClick={() => (qty <= 1 ? handleRemoveClick() : onQtyChange(qty - 1))}
              aria-label={qty <= 1 ? `Remove ${product.name}` : "Decrease quantity"}
              className="grid h-8 w-8 place-items-center text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {qty <= 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
            </button>
            <span className="w-8 text-center tabular-nums" aria-live="polite">
              {qty}
            </span>
            <button
              onClick={() => !atMax && onQtyChange(qty + 1)}
              disabled={atMax}
              aria-label="Increase quantity"
              className="grid h-8 w-8 place-items-center text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className={cn("font-medium", qty > 1 && "text-right")}>
            {currency(product.price * qty)}
            {qty > 1 && (
              <span className="block text-xs font-normal text-muted-foreground">
                {currency(product.price)} each
              </span>
            )}
          </span>
        </div>
        {atMax && (
          <p className="mt-2 text-xs text-muted-foreground">Max available quantity reached</p>
        )}
      </div>
    </div>
  );
}
