import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUp, Instagram, Mail, MessageCircle, Sparkles } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

/* ── Newsletter ─────────────────────────────────── */
function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="text-sm text-muted-foreground">
        You're on the list — <span className="text-olive">first word on new pieces</span> lands in
        your inbox.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
      className="flex items-center gap-3 border-b border-hairline pb-3 transition-colors focus-within:border-olive"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        aria-label="Email address"
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
      />
      <button
        type="submit"
        className="label-caps group flex shrink-0 items-center gap-1.5 text-olive transition-colors hover:text-foreground"
      >
        Subscribe
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </form>
  );
}

/* ── Data ───────────────────────────────────────── */
const socials = [
  { href: "mailto:hello@zyence.com", label: "Email us", Icon: Mail },
  { href: "https://instagram.com", label: "Follow us on Instagram", Icon: Instagram },
] as const;

const columns = [
  {
    heading: "Shop",
    links: [
      { label: "All scents", to: "/shop" },
      { label: "Eau de Parfum", to: "/shop", search: { category: "eau-de-parfum" } },
      { label: "Attars / Oils", to: "/shop", search: { category: "attars-oils" } },
      { label: "Home Fragrance", to: "/shop", search: { category: "home-fragrance" } },
      { label: "Gift Sets", to: "/shop", search: { category: "gift-sets" } },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Orders", to: "/account" },
      { label: "Sign in", to: "/login" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms & Conditions", to: "/terms-conditions" },
      { label: "Refund Policy", to: "/refund-policy" },
      { label: "Cookie Policy", to: "/cookie-policy" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="rule-top mt-24 bg-surface">
      {/* ── Brand + newsletter ─────────────────── */}
      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-16 md:grid-cols-12 md:px-10 md:py-20">
        <div className="md:col-span-5">
          <p className="label-caps mb-5 text-muted-foreground">Est. 2026 — Fine fragrance</p>
          <p className="font-display text-5xl leading-none tracking-tight md:text-6xl">
            Zyence<span className="text-olive">.</span>
          </p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Fine fragrance, composed with precision. Shipped with care, paid on delivery.
          </p>
          <div className="mt-7 flex items-center gap-3">
            {socials.map(({ href, label, Icon }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <a
                    href={href}
                    aria-label={label}
                    className="group flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-olive hover:text-olive"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7 md:self-end">
          <p className="label-caps mb-4 text-muted-foreground">First access to new scents</p>
          <NewsletterForm />
          <p className="mt-3 text-xs text-muted-foreground">
            One email per collection. No noise, unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* ── Link columns ───────────────────────── */}
      <div className="rule-top">
        <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-x-6 gap-y-10 px-5 py-12 sm:grid-cols-4 md:px-10">
          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <p className="label-caps mb-5 text-muted-foreground">{col.heading}</p>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      {...("search" in link ? { search: link.search } : {})}
                      className="link-underline w-fit"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* ── Colophon ───────────────────────────── */}
      <div className="rule-top">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-5 py-5 text-center text-xs text-muted-foreground md:px-10">
          <Sparkles className="h-3.5 w-3.5 text-olive" aria-hidden />
          <span>Designed &amp; built by</span>
          <a
            href="https://abdulbasit-archer.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="link-underline text-foreground"
          >
            ARCHER
          </a>
          <span aria-hidden>—</span>
          <span>available for remote work worldwide</span>
          <span aria-hidden>·</span>
          <a href="mailto:abdulbasit.alpha25@gmail.com" className="link-underline">
            Email
          </a>
          <span aria-hidden>·</span>
          <a
            href="https://wa.me/923415878569"
            target="_blank"
            rel="noreferrer"
            className="link-underline"
          >
            WhatsApp
          </a>
        </div>
      </div>

      {/* ── Giant cropped wordmark ─────────────── */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <p className="mx-auto -mb-[0.18em] text-center font-display text-[clamp(5rem,17vw,17rem)] leading-[0.8] tracking-tight text-foreground/[0.05]">
          Zyence
        </p>
      </div>

      {/* ── Bottom bar ─────────────────────────── */}
      <div className="rule-top relative bg-surface">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-10">
          <span>© 2026 Zyence</span>
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-olive" aria-hidden />
            Cash on delivery
            <span className="h-1 w-1 rounded-full bg-olive" aria-hidden />
            Free shipping over $200
          </span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="label-caps group flex w-fit items-center gap-1.5 transition-colors hover:text-foreground"
          >
            Back to top
            <ArrowUp className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
