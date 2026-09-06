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
      { title: "Shop all — Zyence" },
      {
        name: "description",
        content:
          "Browse eau de parfum, attars, home fragrance, and discovery sets. Filter by category, price and availability.",
      },
      { property: "og:title", content: "Shop all — Zyence" },
      {
        property: "og:description",
        content: "Small-batch fragrances, attars, home scents, and discovery sets from Zyence.",
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
  const resetSearch = () => navigate({ search: {}, replace: true });

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
        <ShopHeader activeCategory={activeCategory} />

        <ShopToolbar
          isPending={isPending}
          resultCount={sortedData?.length ?? 0}
          sort={sort}
          setSort={setSort}
          activeFilterCount={activeFilterCount}
          onOpenMobileFilters={() => setFiltersOpen(true)}
          search={search}
          activeCategoryName={activeCategory?.name}
          maxPrice={maxPrice}
          setSearch={setSearch}
          onResetAll={resetSearch}
        />

        <div className="mt-10 grid gap-10 md:grid-cols-[240px_1fr]">
          <aside className="hidden md:block">
            <div className="sticky top-24">
              <FilterPanel
                categories={categories}
                search={search}
                setSearch={setSearch}
                maxPrice={maxPrice}
                queryInput={queryInput}
                setQueryInput={setQueryInput}
                onReset={resetSearch}
              />
            </div>
          </aside>

          <ProductResults
            isPending={isPending}
            isError={isError || categoriesError}
            isFetching={isFetching}
            onRetry={refetch}
            products={sortedData}
            onAddToCart={handleAddToCart}
            onQuickView={handleQuickView}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={isWishlisted}
            onResetFilters={resetSearch}
          />
        </div>
      </div>

      <MobileFilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        resultCount={sortedData?.length ?? 0}
        isPending={isPending}
        categories={categories}
        search={search}
        setSearch={setSearch}
        maxPrice={maxPrice}
        queryInput={queryInput}
        setQueryInput={setQueryInput}
        onReset={resetSearch}
      />

      <QuickViewDialog
        product={quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </StoreShell>
  );
}

/** Page eyebrow, headline, and one line of orientation copy. */
function ShopHeader({ activeCategory }: { activeCategory?: { name: string } }) {
  return (
    <div className="flex flex-col gap-3 border-b border-hairline pb-8">
      <p className="label-caps text-olive">
        {activeCategory ? activeCategory.name : "Full collection"}
      </p>
      <h1 className="display-xl">Shop</h1>
      <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
        Eau de parfum, attars, home fragrance, and discovery sets — composed in small batches and
        ready to find their next home.
      </p>
    </div>
  );
}

/** Result count, sort control, mobile filter trigger, and active filter chips. */
function ShopToolbar({
  isPending,
  resultCount,
  sort,
  setSort,
  activeFilterCount,
  onOpenMobileFilters,
  search,
  activeCategoryName,
  maxPrice,
  setSearch,
  onResetAll,
}: {
  isPending: boolean;
  resultCount: number;
  sort: SortKey;
  setSort: (v: SortKey) => void;
  activeFilterCount: number;
  onOpenMobileFilters: () => void;
  search: ShopSearch;
  activeCategoryName?: string;
  maxPrice: number;
  setSearch: (patch: Partial<ShopSearch>) => void;
  onResetAll: () => void;
}) {
  return (
    <div className="mt-6 flex flex-col gap-4 pb-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {isPending ? "Loading…" : `${resultCount} fragrance${resultCount === 1 ? "" : "s"}`}
        </p>

        <div className="flex items-center gap-2">
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

          <button
            type="button"
            onClick={onOpenMobileFilters}
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

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-hairline pt-4">
          {search.q && (
            <FilterChip label={`"${search.q}"`} onRemove={() => setSearch({ q: undefined })} />
          )}
          {activeCategoryName && (
            <FilterChip
              label={activeCategoryName}
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
            onClick={onResetAll}
            className="label-caps ml-1 text-muted-foreground underline decoration-hairline underline-offset-4 hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

/** Loading skeleton, error state, empty state, or the product grid — one place that decides which. */
function ProductResults({
  isPending,
  isError,
  isFetching,
  onRetry,
  products,
  onAddToCart,
  onQuickView,
  onToggleWishlist,
  isWishlisted,
  onResetFilters,
}: {
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  onRetry: () => void;
  products: Product[] | undefined;
  onAddToCart: (p: Pick<Product, "id" | "name">) => void;
  onQuickView: (p: Pick<Product, "id">) => void;
  onToggleWishlist: (p: Pick<Product, "id">) => void;
  isWishlisted: (id: string) => boolean;
  onResetFilters: () => void;
}) {
  if (isPending) {
    return (
      <div className="grid min-w-0 grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex min-w-0 flex-col items-center gap-4 border border-destructive/40 bg-destructive/5 px-6 py-16 text-center"
      >
        <p className="text-destructive">Unable to load fragrances. Please try again.</p>
        <button
          onClick={onRetry}
          disabled={isFetching}
          className="label-caps border border-destructive/50 px-5 py-2 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          {isFetching ? "Retrying…" : "Retry"}
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex min-w-0 flex-col items-center justify-center border border-dashed border-hairline px-6 py-20 text-center sm:py-24">
        <p className="font-display text-3xl sm:text-4xl">No fragrances match yet</p>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          Try widening the price range or clearing the category — or search a note you're looking
          for, like "amber" or "vetiver."
        </p>
        <button
          onClick={onResetFilters}
          className="label-caps mt-8 bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          index={i}
          onAddToCart={onAddToCart}
          onQuickView={onQuickView}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={isWishlisted(product.id)}
        />
      ))}
    </div>
  );
}

/** Bottom sheet that hosts the same FilterPanel on mobile/tablet. */
function MobileFilterSheet({
  open,
  onClose,
  resultCount,
  isPending,
  categories,
  search,
  setSearch,
  maxPrice,
  queryInput,
  setQueryInput,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  isPending: boolean;
  categories: { id: string; slug: string; name: string }[];
  search: ShopSearch;
  setSearch: (patch: Partial<ShopSearch>) => void;
  maxPrice: number;
  queryInput: string;
  setQueryInput: (v: string) => void;
  onReset: () => void;
}) {
  return (
    <>
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-hairline bg-background px-5 pt-5 pb-8 shadow-2xl transition-transform duration-300 md:hidden",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-hairline" />
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl">Filters</p>
          <button
            type="button"
            onClick={onClose}
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
            onReset={onReset}
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="label-caps mt-8 w-full bg-primary py-3 text-primary-foreground"
        >
          Show {isPending ? "…" : resultCount} results
        </button>
      </div>
    </>
  );
}

/** Product preview dialog triggered from a card's quick-view action. */
function QuickViewDialog({
  product,
  onOpenChange,
  onAddToCart,
}: {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (p: Pick<Product, "id" | "name">) => void;
}) {
  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        {product && (
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
            <img
              src={product.image}
              alt={product.name}
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="flex flex-col justify-center">
              <DialogHeader className="text-left">
                <DialogTitle className="font-display text-3xl">{product.name}</DialogTitle>
                <DialogDescription className="mt-2 text-base">
                  {product.description}
                </DialogDescription>
              </DialogHeader>
              <p className="mt-6 text-lg">{currency(product.price)}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={product.stock === 0}
                  onClick={() => onAddToCart(product)}
                  className="label-caps bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {product.stock === 0 ? "Sold out" : "Add to cart"}
                </button>
                <Link
                  to="/product/$slug"
                  params={{ slug: product.slug }}
                  className="label-caps link-underline self-center text-muted-foreground"
                >
                  Full details
                </Link>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
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
    <div className="space-y-7">
      <div className="relative">
        <Search className="absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="Search notes, names…"
          aria-label="Search products"
          className="w-full border-b border-hairline bg-transparent py-2 pl-6 text-sm outline-none placeholder:text-muted-foreground focus:border-olive"
        />
      </div>

      <div className="border-t border-hairline pt-7">
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

      <div className="border-t border-hairline pt-7">
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

      <div className="border-t border-hairline pt-7">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(search.inStock)}
            onChange={(e) => setSearch({ inStock: e.target.checked || undefined })}
            className="accent-olive"
          />
          In stock only
        </label>
      </div>

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
