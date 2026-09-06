import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import type { Category } from "@/lib/catalog-types";

type CollectionsSectionProps = {
  categories: Category[];
};

export function CollectionsSection({ categories }: CollectionsSectionProps) {
  return (
    <section className="mx-auto max-w-[1500px] px-5 py-20 md:px-10 md:py-28">
      {/* ── Section header ─────────────────────────────── */}
      <div className="mb-10 flex items-end justify-between gap-8 md:mb-14">
        <div>
          <p className="label-caps mb-4 flex items-center gap-3 text-muted-foreground">
            <span aria-hidden className="h-px w-10 bg-olive" />
            Shop by category
          </p>
          <h2 className="font-display text-4xl leading-[1.05] tracking-tight md:text-6xl">
            The collections
          </h2>
        </div>

        <Link
          to="/shop"
          className="group label-caps hidden shrink-0 items-center gap-2 pb-1 text-olive transition-colors hover:text-foreground md:flex"
        >
          View all products
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* ── Collection rows ────────────────────────────── */}
      <div className="border-t border-hairline">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            to="/shop"
            search={{ category: category.slug }}
            className="group relative grid grid-cols-[2.5rem_1fr_auto] grid-rows-[auto_auto] items-start gap-x-4 gap-y-1.5 overflow-hidden border-b border-hairline px-1 py-7 transition-colors md:grid-cols-[3.5rem_minmax(0,1.2fr)_minmax(0,1fr)_auto] md:grid-rows-1 md:items-center md:gap-x-8 md:px-4 md:py-9"
          >
            {/* Fill sweep on hover */}
            <span
              aria-hidden
              className="absolute inset-0 origin-bottom scale-y-0 bg-surface transition-transform duration-500 ease-out group-hover:scale-y-100"
            />

            {/* Index */}
            <span className="label-caps relative col-start-1 row-start-1 pt-1.5 text-muted-foreground transition-colors duration-300 group-hover:text-olive md:pt-0">
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* Name */}
            <h3 className="font-display relative col-start-2 row-start-1 text-[1.65rem] leading-none tracking-tight transition-transform duration-500 ease-out group-hover:translate-x-2 md:text-4xl lg:text-[2.75rem]">
              {category.name}
            </h3>

            {/* Description */}
            <p className="relative col-start-2 row-start-2 max-w-md text-sm leading-relaxed text-muted-foreground md:col-start-3 md:row-start-1">
              {category.description}
            </p>

            {/* Arrow */}
            <span className="relative col-start-3 row-span-2 row-start-1 flex h-9 w-9 items-center justify-center self-center justify-self-end rounded-full border border-hairline transition-all duration-500 group-hover:border-olive group-hover:bg-olive group-hover:text-background md:col-start-4 md:row-span-1 md:h-11 md:w-11">
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
