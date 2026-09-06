import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProductCard } from "@/components/storefront/product-card";
import { StoreShell } from "@/components/storefront/shell";
import { getCategories } from "@/lib/category-server";
import { getProductBySlug, getProducts } from "@/lib/product-server";
import { createReview, getProductReviewSummary, getProductReviews } from "@/lib/review-server";
import { useAuth, useCart } from "@/lib/store";
import { currency } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await getProductBySlug({ data: params.slug });
    if (!product) throw notFound();

    const [related, categories] = await Promise.all([
      getProducts({ data: { categoryId: product.categoryId } }),
      getCategories(),
    ]);
    return {
      product,
      related: related.filter((p) => p.id !== product.id).slice(0, 3),
      categories,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Piece not found — Sorrel" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    return {
      meta: [
        { title: `${product.name} — Sorrel` },
        { name: "description", content: product.description },
        { property: "og:title", content: `${product.name} — Sorrel` },
        { property: "og:description", content: product.description },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product, related, categories } = Route.useLoaderData();
  const add = useCart((s) => s.add);
  const user = useAuth((s) => s.user);
  const queryClient = useQueryClient();
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const { data: reviews = [], isPending: reviewsPending } = useQuery({
    queryKey: ["product-reviews", product.id],
    queryFn: () => getProductReviews({ data: product.id }),
  });
  const { data: reviewSummary } = useQuery({
    queryKey: ["product-review-summary", product.id],
    queryFn: () => getProductReviewSummary({ data: product.id }),
  });
  const category = categories.find((c) => c.id === product.categoryId);
  const averageRating = reviewSummary?.averageRating ?? 0;
  const totalReviews = reviewSummary?.totalReviews ?? 0;

  const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittingReview(true);
    try {
      const result = await createReview({
        data: {
          token: undefined,
          productId: product.id,
          rating,
          title: reviewTitle,
          body: reviewBody,
        },
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setReviewTitle("");
      setReviewBody("");
      toast.success("Your review was sent for approval.");
      void queryClient.invalidateQueries({ queryKey: ["product-reviews", product.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <StoreShell>
      <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-10">
        <nav className="label-caps text-muted-foreground">
          <Link to="/shop" className="link-underline">
            Shop
          </Link>
          <span className="px-2">/</span>
          <Link to="/shop" search={{ category: product.categoryId }} className="link-underline">
            {category?.name}
          </Link>
        </nav>

        <div className="mt-8 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <img
              src={product.image}
              alt={product.name}
              width={1024}
              height={1280}
              className="w-full bg-surface-2 object-cover"
            />
          </div>

          <div className="md:col-span-5 md:pt-8">
            <h1 className="text-5xl leading-none md:text-6xl">{product.name}</h1>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-xl">{currency(product.price)}</span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-olive text-olive" />
                {averageRating ? averageRating.toFixed(1) : "New"} ({totalReviews})
              </span>
            </div>

            <p className="mt-8 text-muted-foreground">{product.description}</p>

            <dl className="mt-8 space-y-2 border-t border-hairline pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">SKU</dt>
                <dd>{product.sku}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Availability</dt>
                <dd className={product.stock === 0 ? "text-destructive" : "text-olive"}>
                  {product.stock === 0 ? "Sold out" : `${product.stock} in stock`}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Payment</dt>
                <dd>Cash on delivery</dd>
              </div>
            </dl>

            <div className="mt-10 flex flex-wrap items-stretch gap-3">
              <div className="flex items-center border border-hairline">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-4 hover:text-olive"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-4 py-4 hover:text-olive"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                disabled={product.stock === 0}
                onClick={() => {
                  add(product.id, qty);
                  toast.success(`${product.name} added to your bag`);
                }}
                className="label-caps flex-1 bg-primary px-8 py-4 text-primary-foreground transition-colors hover:bg-olive hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                {product.stock === 0 ? "Sold out" : "Add to bag"}
              </button>
            </div>
          </div>
        </div>

        <section className="rule-top mt-28 pt-12" aria-labelledby="reviews-heading">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label-caps text-olive">Customer reviews</p>
              <h2 id="reviews-heading" className="font-display mt-3 text-3xl md:text-4xl">
                Notes from the people who own it
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalReviews} published {totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>

          {reviewSummary && reviewSummary.totalReviews > 0 ? (
            <div className="mt-10 grid gap-8 border-y border-border/60 py-8 md:grid-cols-[220px_1fr]">
              <div>
                <p className="font-display text-5xl">{reviewSummary.averageRating.toFixed(1)}</p>
                <div className="mt-2 flex items-center gap-1" aria-label="Average rating">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 fill-olive text-olive ${index < Math.round(reviewSummary.averageRating) ? "" : "opacity-25"}`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Based on {totalReviews} reviews
                </p>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((ratingValue) => {
                  const count = reviewSummary.distribution[ratingValue as 1 | 2 | 3 | 4 | 5];
                  const width = totalReviews ? `${(count / totalReviews) * 100}%` : "0%";
                  return (
                    <div key={ratingValue} className="flex items-center gap-3 text-sm">
                      <span className="w-10">{ratingValue} stars</span>
                      <span className="h-2 flex-1 bg-surface-2">
                        <span className="block h-2 bg-olive" style={{ width }} />
                      </span>
                      <span className="w-6 text-right text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {reviewsPending ? (
            <p className="mt-10 text-sm text-muted-foreground">Loading reviews...</p>
          ) : null}
          {!reviewsPending && reviews.length === 0 ? (
            <p className="mt-10 border-y border-border/60 py-8 text-sm text-muted-foreground">
              No reviews yet. Be the first to share your experience.
            </p>
          ) : null}
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {reviews.map((review) => (
              <article key={review.id} className="border-b border-border/60 pb-8">
                <div
                  className="flex items-center gap-1"
                  aria-label={`${review.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 fill-olive text-olive ${index < review.rating ? "" : "opacity-25"}`}
                    />
                  ))}
                </div>
                <h3 className="mt-4 text-lg font-medium">{review.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.comment}</p>
                {review.isVerifiedPurchase ? (
                  <p className="mt-3 text-xs text-olive">Verified Purchase</p>
                ) : null}
                <p className="label-caps mt-5 text-xs text-muted-foreground">
                  {review.customerName} · {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 border-t border-border/60 pt-10">
            <h3 className="font-display text-2xl">Share your experience</h3>
            {user ? (
              <form onSubmit={submitReview} className="mt-6 max-w-2xl space-y-5">
                <fieldset>
                  <legend className="text-sm">Your rating</legend>
                  <div className="mt-2 flex gap-1">
                    {Array.from({ length: 5 }, (_, index) => {
                      const value = index + 1;
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-label={`${value} star${value === 1 ? "" : "s"}`}
                          aria-pressed={rating === value}
                          onClick={() => setRating(value)}
                          className="p-1"
                        >
                          <Star
                            className={`h-5 w-5 ${value <= rating ? "fill-olive text-olive" : "text-muted-foreground"}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <label className="block text-sm">
                  Title
                  <input
                    value={reviewTitle}
                    onChange={(event) => setReviewTitle(event.target.value)}
                    minLength={3}
                    maxLength={120}
                    required
                    className="mt-2 w-full border border-border bg-background p-3"
                  />
                </label>
                <label className="block text-sm">
                  Review
                  <textarea
                    value={reviewBody}
                    onChange={(event) => setReviewBody(event.target.value)}
                    minLength={10}
                    maxLength={2000}
                    required
                    rows={5}
                    className="mt-2 w-full resize-y border border-border bg-background p-3"
                  />
                </label>
                <button
                  disabled={submittingReview}
                  className="bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-50"
                >
                  {submittingReview ? "Sending..." : "Send review"}
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                <Link to="/login" className="link-underline text-foreground">
                  Sign in
                </Link>{" "}
                to write a review.
              </p>
            )}
          </div>
        </section>

        <section className="mt-28">
          <h2 className="mb-8 text-3xl">Pairs well with</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      </div>
    </StoreShell>
  );
}
