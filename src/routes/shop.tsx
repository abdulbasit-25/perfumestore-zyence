import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ListFilter, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard, ProductCardSkeleton } from "@/components/storefront/product-card";
import { StoreShell } from "@/components/storefront/shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCategories } from "@/lib/category-server";
import type { Product } from "@/lib/catalog-types";
import { getProducts } from "@/lib/product-server";
import { useCart, useWishlist } from "@/lib/store";
import { cn, currency } from "@/lib/utils";
import { toast } from "sonner";

type ShopSearch = {
  category?: string | undefined;
  q?: string | undefined;
  max?: number | undefined;
  inStock?: boolean | undefined;
};

type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A–Z" },
];

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    max: search["max"] !== undefined ? Number(search["max"]) || undefined : undefined,
    inStock: search["inStock"] === true || search["inStock"] === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop all — Sorrel" },
      {
        name: "description",
        content:
          "Browse linen apparel, hand-thrown ceramics, woven textiles and objects. Filter by category, price and availability.",
      },
      { property: "og:title", content: "Shop all — Sorrel" },
      {
        property: "og:description",
        content: "Linen apparel, ceramics, textiles and objects, made in small runs.",
      },
    ],
  }),
  component: Shop,
});

function useFilteredProducts(search: ShopSearch) {
  return useQuery({
    queryKey: ["products", search],
    queryFn: async (): Promise<Product[]> => {
      const filterData: {
        category?: string;
        search?: string;
        maxPrice?: number;
        inStock?: boolean;
      } = {};

      if (search.category) filterData.category = search.category;
      if (search.q) filterData.search = search.q;
      if (search.max) filterData.maxPrice = search.max;
      if (search.inStock) filterData.inStock = search.inStock;

      return getProducts({ data: filterData });
    },
  });
}

/** Debounces a value so we don't hammer navigation/queries on every keystroke. */
function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function Shop() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data, isPending, isError, refetch, isFetching } = useFilteredProducts(search);
  const { data: categories = [], isError: categoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ["products-all"],
    queryFn: async () => getProducts({ data: {} }),
  });

  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 350;
    return Math.max(...allProducts.map((p) => p.price));
  }, [allProducts]);

  const [sort, setSort] = useState<SortKey>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const addToCart = useCart((state) => state.add);
  const isWishlisted = useWishlist((state) => state.isWishlisted);
  const toggleWishlist = useWishlist((state) => state.toggleWishlist);

  // Local search input is debounced before it hits the URL/query,
  // so typing feels instant but we don't refetch on every keystroke.
  const [queryInput, setQueryInput] = useState(search.q ?? "");
  const debouncedQuery = useDebouncedValue(queryInput, 350);

  useEffect(() => {
    setQueryInput(search.q ?? "");
  }, [search.q]);

  useEffect(() => {
    if (debouncedQuery === (search.q ?? "")) return;
    navigate({
      search: (prev) => ({ ...prev, q: debouncedQuery || undefined }),
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Lock body scroll while the mobile filter sheet is open.
  useEffect(() => {
    if (!filtersOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFiltersOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [filtersOpen]);

  const setSearch = (patch: Partial<ShopSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const activeCategory = categories.find((c) => c.slug === search.category);

  const activeFilterCount =
    (search.category ? 1 : 0) +
    (search.max && search.max < maxPrice ? 1 : 0) +
    (search.inStock ? 1 : 0) +
    (search.q ? 1 : 0);

  const sortedData = useMemo(() => {
    if (!data) return data;
    const copy = [...data];
    switch (sort) {
      case "price-asc":
        return copy.sort((a, b) => a.price - b.price);
      case "price-desc":
        return copy.sort((a, b) => b.price - a.price);
      case "name-asc":
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return copy;
    }
  }, [data, sort]);

  const handleAddToCart = (product: Pick<Product, "id" | "name">) => {
    addToCart(product.id);
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleWishlist = (product: Pick<Product, "id">) => {
    const alreadyWishlisted = isWishlisted(product.id);
    toggleWishlist(product.id);
    toast.success(alreadyWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleQuickView = (product: Pick<Product, "id">) => {
    const fullProduct = data?.find((item) => item.id === product.id);
    if (fullProduct) setQuickViewProduct(fullProduct);
  };

  return (
    <StoreShell>
      <div className="mx-auto max-w-[1500px] px-5 py-10 md:px-10 md:py-12">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <p className="label-caps text-olive">
            {activeCategory ? activeCategory.name : "Everything"}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl">Shop</h1>
        </div>

        {/* Toolbar: result count, active chips, sort, mobile filter trigger */}
        <div className="mt-8 flex flex-col gap-4 border-b border-hairline pb-6 md:mt-10">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {isPending
                ? "Loading…"
                : `${sortedData?.length ?? 0} piece${sortedData?.length === 1 ? "" : "s"}`}
            </p>

            <div className="flex items-center gap-2">
              {/* Sort — visible on all sizes */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  aria-label="Sort products"
                  className="label-caps cursor-pointer appearance-none border-b border-hairline bg-transparent py-2 pr-6 pl-1 text-muted-foreground outline-none focus:border-olive focus:text-foreground"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <SlidersHorizontal className="pointer-events-none absolute top-1/2 right-0 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>

              {/* Filter trigger — mobile/tablet only */}
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="label-caps relative flex items-center gap-2 border border-hairline px-4 py-2 text-foreground transition-colors hover:border-olive md:hidden"
              >
                <ListFilter className="h-3.5 w-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="grid h-4 min-w-4 place-items-center rounded-full bg-olive px-1 text-[10px] font-medium text-accent-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {search.q && (
                <FilterChip label={`"${search.q}"`} onRemove={() => setSearch({ q: undefined })} />
              )}
              {activeCategory && (
                <FilterChip
                  label={activeCategory.name}
                  onRemove={() => setSearch({ category: undefined })}
                />
              )}
              {search.max && search.max < maxPrice && (
                <FilterChip
                  label={`Up to $${search.max}`}
                  onRemove={() => setSearch({ max: undefined })}
                />
              )}
              {search.inStock && (
                <FilterChip label="In stock" onRemove={() => setSearch({ inStock: undefined })} />
              )}
              <button
                onClick={() => navigate({ search: {}, replace: true })}
                className="label-caps ml-1 text-muted-foreground underline decoration-hairline underline-offset-4 hover:text-foreground"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-[220px_1fr]">
          {/* Desktop sidebar filters */}
          <aside className="hidden md:block">
            <div className="sticky top-24">
              <FilterPanel
                categories={categories}
                search={search}
                setSearch={setSearch}
                maxPrice={maxPrice}
                queryInput={queryInput}
                setQueryInput={setQueryInput}
                onReset={() => navigate({ search: {}, replace: true })}
              />
            </div>
          </aside>

          {/* Grid */}
          <div className="min-w-0">
            {isPending ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : isError || categoriesError ? (
              <div
                role="alert"
                className="flex flex-col items-center gap-4 border border-destructive/40 bg-destructive/5 px-6 py-16 text-center"
              >
                <p className="text-destructive">Unable to load products. Please try again.</p>
                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="label-caps border border-destructive/50 px-5 py-2 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                >
                  {isFetching ? "Retrying…" : "Retry"}
                </button>
              </div>
            ) : sortedData && sortedData.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
                {sortedData.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    onAddToCart={handleAddToCart}
                    onQuickView={handleQuickView}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={isWishlisted(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed border-hairline px-6 py-20 text-center sm:py-24">
                <p className="font-display text-3xl sm:text-4xl">Nothing here yet</p>
                <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                  No pieces match this combination of filters. Try widening the price range or
                  clearing the category.
                </p>
                <button
                  onClick={() => navigate({ search: {}, replace: true })}
                  className="label-caps mt-8 bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <div
        aria-hidden={!filtersOpen}
        onClick={() => setFiltersOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          filtersOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-hairline bg-background px-5 pt-5 pb-8 shadow-2xl transition-transform duration-300 md:hidden",
          filtersOpen ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-hairline" />
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl">Filters</p>
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            aria-label="Close filters"
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6">
          <FilterPanel
            categories={categories}
            search={search}
            setSearch={setSearch}
            maxPrice={maxPrice}
            queryInput={queryInput}
            setQueryInput={setQueryInput}
            onReset={() => navigate({ search: {}, replace: true })}
          />
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen(false)}
          className="label-caps mt-8 w-full bg-primary py-3 text-primary-foreground"
        >
          Show {isPending ? "…" : (sortedData?.length ?? 0)} results
        </button>
      </div>

      <Dialog
        open={Boolean(quickViewProduct)}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      >
        <DialogContent className="max-w-3xl">
          {quickViewProduct && (
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="flex flex-col justify-center">
                <DialogHeader className="text-left">
                  <DialogTitle className="font-display text-3xl">
                    {quickViewProduct.name}
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-base">
                    {quickViewProduct.description}
                  </DialogDescription>
                </DialogHeader>
                <p className="mt-6 text-lg">{currency(quickViewProduct.price)}</p>
                <button
                  type="button"
                  disabled={quickViewProduct.stock === 0}
                  onClick={() => handleAddToCart(quickViewProduct)}
                  className="label-caps mt-6 bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {quickViewProduct.stock === 0 ? "Sold out" : "Add to cart"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StoreShell>
  );
}

/** Shared filter body used by both the desktop sidebar and the mobile sheet. */
function FilterPanel({
  categories,
  search,
  setSearch,
  maxPrice,
  queryInput,
  setQueryInput,
  onReset,
}: {
  categories: { id: string; slug: string; name: string }[];
  search: ShopSearch;
  setSearch: (patch: Partial<ShopSearch>) => void;
  maxPrice: number;
  queryInput: string;
  setQueryInput: (v: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="relative">
        <Search className="absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="Search"
          aria-label="Search products"
          className="w-full border-b border-hairline bg-transparent py-2 pl-6 text-sm outline-none placeholder:text-muted-foreground focus:border-olive"
        />
      </div>

      <div>
        <p className="label-caps mb-3 text-muted-foreground">Category</p>
        <div className="flex flex-col items-start gap-2 text-sm">
          <button
            onClick={() => setSearch({ category: undefined })}
            className={cn(
              "link-underline transition-colors",
              !search.category ? "text-olive" : "text-foreground",
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSearch({ category: c.slug })}
              className={cn(
                "link-underline transition-colors",
                search.category === c.slug ? "text-olive" : "text-foreground",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label-caps mb-3 text-muted-foreground">Max price</p>
        <input
          type="range"
          min={50}
          max={maxPrice}
          step={5}
          value={search.max ?? maxPrice}
          onChange={(e) => setSearch({ max: Number(e.target.value) })}
          aria-label="Maximum price"
          className="w-full accent-olive"
        />
        <p className="mt-1 text-sm text-muted-foreground">Up to ${search.max ?? maxPrice}</p>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(search.inStock)}
          onChange={(e) => setSearch({ inStock: e.target.checked || undefined })}
          className="accent-olive"
        />
        In stock only
      </label>

      <button onClick={onReset} className="label-caps link-underline text-muted-foreground">
        Reset all
      </button>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-hairline bg-foreground/5 py-1 pr-1.5 pl-3 text-xs">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="grid h-4 w-4 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
