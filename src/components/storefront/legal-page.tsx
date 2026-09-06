import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { StoreShell } from "@/components/storefront/shell";

type LegalSection = {
  heading: string;
  body: string[];
};

interface LegalPageProps {
  label?: string;
  title: string;
  intro: string;
  lastUpdated?: string;
  sections: LegalSection[];
  cta?: {
    label: string;
    to: string;
    description?: string;
  };
  footer?: ReactNode;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function LegalPage({
  label = "Legal / Trust",
  title,
  intro,
  lastUpdated,
  sections,
  cta,
  footer,
}: LegalPageProps) {
  const items = useMemo(
    () =>
      sections.map((section, index) => ({
        ...section,
        id: `${slugify(section.heading)}-${index + 1}`,
      })),
    [sections],
  );

  const [activeId, setActiveId] = useState<string | undefined>(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  return (
    <StoreShell>
      <article className="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-20">
        <header className="mb-12 max-w-3xl md:mb-16">
          <p className="label-caps flex items-center gap-2 text-olive">
            <span className="h-px w-6 bg-olive" />
            {label}
          </p>
          <h1 className="display-xl mt-5">{title}</h1>
          <p className="mt-6 text-base leading-7 text-muted-foreground">{intro}</p>
          {lastUpdated ? (
            <p className="label-caps mt-6 text-muted-foreground/70">Last updated {lastUpdated}</p>
          ) : null}
        </header>

        <div className="grid gap-10 md:grid-cols-[220px_1fr] md:gap-16 lg:grid-cols-[260px_1fr]">
          <nav aria-label="Table of contents" className="hidden md:block">
            <div className="sticky top-24 space-y-1">
              <p className="label-caps mb-4 text-muted-foreground/60">On this page</p>
              <ol className="space-y-1 border-l border-border/60">
                {items.map((item, index) => {
                  const isActive = activeId === item.id;
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className={[
                          "-ml-px block border-l py-1.5 pl-4 text-sm leading-6 transition-colors",
                          isActive
                            ? "border-olive font-medium text-foreground"
                            : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                        ].join(" ")}
                      >
                        <span className="tabular-nums text-muted-foreground/60">
                          {String(index + 1).padStart(2, "0")}
                        </span>{" "}
                        {item.heading}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </div>
          </nav>

          <div className="min-w-0">
            <details className="mb-8 rounded-sm border border-border/60 bg-surface md:hidden">
              <summary className="label-caps cursor-pointer select-none px-5 py-4 text-olive">
                Jump to a section
              </summary>
              <ol className="border-t border-border/60 px-5 py-3">
                {items.map((item, index) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <span className="tabular-nums text-muted-foreground/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>{" "}
                      {item.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </details>

            <div className="divide-y divide-border/60">
              {items.map((item, index) => (
                <section
                  key={item.id}
                  id={item.id}
                  className="scroll-mt-24 py-8 first:pt-0 md:py-10"
                >
                  <div className="flex items-baseline gap-4 sm:gap-6">
                    <span className="label-caps shrink-0 tabular-nums text-olive/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-2xl leading-tight md:text-3xl">{item.heading}</h2>
                  </div>
                  <div className="mt-4 space-y-3 pl-0 text-sm leading-7 text-muted-foreground sm:pl-[calc(2ch+1.5rem)]">
                    {item.body.map((paragraph, pIndex) => (
                      <p key={pIndex}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {cta ? (
              <section className="mt-10 md:mt-14">
                <div className="flex flex-col gap-5 rounded-sm border border-olive/25 bg-olive-soft p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-md">
                    <p className="label-caps text-olive">Need more?</p>
                    <h2 className="mt-2 text-2xl leading-tight md:text-3xl">
                      {cta.description ?? "Keep shopping with confidence."}
                    </h2>
                  </div>
                  <Link
                    to={cta.to}
                    className="label-caps group inline-flex shrink-0 items-center justify-center gap-2 bg-primary px-6 py-3.5 text-primary-foreground transition-colors hover:bg-olive hover:text-accent-foreground"
                  >
                    {cta.label}
                    <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </div>
              </section>
            ) : null}

            {footer ? <div className="mt-10">{footer}</div> : null}
          </div>
        </div>
      </article>
    </StoreShell>
  );
}
