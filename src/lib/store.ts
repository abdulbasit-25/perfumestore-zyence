import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./catalog-types";

/* ---------------- theme ---------------- */

type Theme = "light" | "dark";

export const useTheme = create<{ theme: Theme; toggle: () => void; set: (t: Theme) => void }>()(
  persist(
    (set, get) => ({
      theme: "light",
      toggle: () => {
        const next: Theme = get().theme === "light" ? "dark" : "light";
        applyTheme(next);
        set({ theme: next });
      },
      set: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    { name: "zyence-theme" },
  ),
);

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/* ---------------- auth session ---------------- */

export type Role = "customer" | "manager" | "admin";
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
};

export const useAuth = create<{
  user: SessionUser | null;
  ready: boolean;
  setUser: (user: SessionUser | null) => void;
  signOut: () => void;
}>()((set) => ({
  user: null,
  ready: false,
  setUser: (user) => set({ user, ready: true }),
  signOut: () => set({ user: null, ready: true }),
}));

/* ---------------- cart ---------------- */

export type CartLine = { productId: string; qty: number };

export const useCart = create<{
  lines: CartLine[];
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}>()(
  persist(
    (set) => ({
      lines: [],
      add: (productId, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === productId);
          return {
            lines: existing
              ? state.lines.map((l) => (l.productId === productId ? { ...l, qty: l.qty + qty } : l))
              : [...state.lines, { productId, qty }],
          };
        }),
      setQty: (productId, qty) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.productId === productId ? { ...l, qty } : l))
            .filter((l) => l.qty > 0),
        })),
      remove: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "zyence-cart" },
  ),
);

/* ---------------- wishlist ---------------- */

export const useWishlist = create<{
  productIds: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
}>()(
  persist(
    (set, get) => ({
      productIds: [],
      isWishlisted: (productId) => get().productIds.includes(productId),
      toggleWishlist: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
    }),
    { name: "zyence-wishlist" },
  ),
);

export function cartDetail(lines: CartLine[], products: Product[]) {
  const items = lines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      return product ? { product, qty: line.qty } : null;
    })
    .filter((x): x is { product: Product; qty: number } => x !== null);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const shipping = items.length === 0 || subtotal > 200 ? 0 : 12;
  return { items, subtotal, shipping, total: subtotal + shipping };
}

/* ---------------- hydration helper ---------------- */

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
