import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getApprovedReviews } from "@/lib/review-server";

export function ReviewsSection() {
  const { data: reviews = [], isPending } = useQuery({
    queryKey: ["homepage-approved-reviews"],
    queryFn: () => getApprovedReviews({ data: { limit: 3 } }),
  });

  if (isPending || reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
      <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-olive">Customer notes</p>
          <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl md:text-5xl">
            Loved by slow-living rituals
          </h2>
        </div>
        <Link
          to="/shop"
          className="label-caps link-underline group inline-flex items-center gap-1.5 self-start"
        >
          More stories
          <ArrowUpRight className="h-3.5 w-3.5 -translate-x-0.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="flex h-full flex-col rounded-sm border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-center gap-1 text-olive">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={`${review.id}-${index}`}
                  className={`h-4 w-4 ${index < review.rating ? "fill-current" : "text-olive/30"}`}
                />
              ))}
            </div>

            <h3 className="mt-5 font-display text-2xl leading-snug">{review.title}</h3>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">“{review.comment}”</p>

            <div className="mt-6 border-t border-border/60 pt-4">
              <p className="font-medium">{review.customerName}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground/80">
                {review.isVerifiedPurchase ? "Verified buyer" : "Customer review"}
                {review.productName ? ` · ${review.productName}` : ""}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
