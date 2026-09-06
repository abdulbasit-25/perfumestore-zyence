import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth, useCart, useHydrated } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/shop", label: "Eau de Parfum", search: { category: "eau-de-parfum" } },
  { to: "/shop", label: "Home Fragrance", search: { category: "home-fragrance" } },
  { to: "/about", label: "Studio" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const user = useAuth((s) => s.user);
  const { pathname, search } = useRouterState({
    select: (s) => ({ pathname: s.location.pathname, search: s.location.search }),
  });
  const count = hydrated ? lines.reduce((sum, l) => sum + l.qty, 0) : 0;

  const isActive = (item: (typeof nav)[number]) => {
    if (pathname !== item.to) return false;
    const wantCategory = "search" in item ? item.search.category : undefined;
    const currentCategory = (search as { category?: string })?.category;
    return wantCategory === currentCategory;
  };

  // Close drawer on route change, lock scroll while open, close on Escape.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/80 backdrop-blur-md shadow-[0_10px_30px_-24px_rgba(0,0,0,0.14)]">
      <div className="section-shell flex h-16 items-center gap-4 md:gap-6">
        <button
          className="-ml-2 grid h-10 w-10 place-items-center rounded-full text-foreground transition-colors hover:bg-foreground/5 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          type="button"
        >
          <span className="relative h-5 w-5">
            <Menu
              className={cn(
                "absolute inset-0 h-5 w-5 transition-all duration-200",
                open ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
              )}
            />
            <X
              className={cn(
                "absolute inset-0 h-5 w-5 transition-all duration-200",
                open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0",
              )}
            />
          </span>
        </button>

        <Link
          to="/"
          className="font-display text-2xl tracking-tight text-foreground transition-colors hover:text-olive"
          onClick={() => setOpen(false)}
        >
          Zyence
        </Link>

        <nav className="ml-6 hidden items-center gap-7 md:flex">
          {nav.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.label}
                to={item.to}
                search={"search" in item ? (item.search as never) : ({} as never)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "label-caps link-underline text-muted-foreground transition-colors hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3 md:gap-4">
          <ThemeToggle />
          {(user?.role === "admin" || user?.role === "manager") && (
            <Link to="/admin" className="label-caps hidden text-olive sm:inline">
              Admin
            </Link>
          )}
          <Link
            to={user ? "/account" : "/login"}
            aria-label="Account"
            className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-foreground/5 hover:text-olive"
          >
            <User className="h-[18px] w-[18px]" />
          </Link>
          <Link
            to="/cart"
            aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
            className="relative grid h-10 w-10 place-items-center rounded-full transition-all duration-200 hover:bg-foreground/5 hover:text-olive"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {count > 0 && (
              <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-olive px-1 text-[10px] font-medium text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 top-16 z-30 bg-background/60 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <nav
        id="mobile-nav"
        className={cn(
          "fixed inset-x-0 top-16 z-30 origin-top border-t border-hairline bg-background px-5 py-4 shadow-[var(--shadow-panel)] transition-all duration-200 md:hidden",
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.label}
                to={item.to}
                search={"search" in item ? (item.search as never) : ({} as never)}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "label-caps rounded-md px-2 py-2.5 text-muted-foreground transition-colors",
                  active
                    ? "bg-foreground/5 text-foreground"
                    : "hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
