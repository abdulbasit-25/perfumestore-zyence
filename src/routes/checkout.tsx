import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { StoreShell } from "@/components/storefront/shell";
import { previewCoupon } from "@/lib/coupon-server";
import { updateProfile } from "@/lib/auth-server";
import { createOrder } from "@/lib/order-server";
import { getProductsByIds } from "@/lib/product-server";
import { cartDetail, useAuth, useCart, useHydrated } from "@/lib/store";
import { currency } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Zyence" },
      {
        name: "description",
        content: "Confirm your shipping details and place a cash-on-delivery order.",
      },
      { property: "og:title", content: "Checkout — Zyence" },
      { property: "og:description", content: "Place your order and pay the courier on delivery." },
    ],
  }),
  component: Checkout,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter your phone number")
    .regex(/^[+\d][\d\s().-]{6,29}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email"),
  address: z.string().trim().min(6, "Enter a street address"),
  address2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2, "Enter a city"),
  province: z.string().trim().min(2, "Enter a province or state"),
  postalCode: z.string().trim().min(3, "Enter a postal or ZIP code"),
  country: z.string().trim().min(2, "Enter a country"),
  couponCode: z.string().trim().max(32).optional(),
  notes: z.string().trim().max(1000).optional(),
});

function Checkout() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const activeLines = hydrated ? lines : [];
  const {
    data: products = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["checkout-products", activeLines.map((line) => line.productId)],
    queryFn: () => getProductsByIds({ data: activeLines.map((line) => line.productId) }),
    enabled: hydrated,
  });
  const { items, subtotal, shipping, total } = cartDetail(activeLines, products);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponPreview, setCouponPreview] = useState<{
    code: string;
    discount: number;
    total: number;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponPreview(null);
      setCouponMessage("Enter a coupon code first.");
      return;
    }
    setIsApplyingCoupon(true);
    setCouponMessage(null);
    try {
      const result = await previewCoupon({ data: { code, subtotal, shipping } });
      if (!result.success) {
        setCouponPreview(null);
        setCouponMessage(result.message);
        return;
      }
      setCouponPreview({ code: result.code, discount: result.discount, total: result.total });
      setCouponCode(result.code);
      setCouponMessage(`You save ${currency(result.discount)} with this coupon.`);
    } catch {
      setCouponPreview(null);
      setCouponMessage("Unable to validate that coupon right now.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!user) {
      toast.error("Please sign in before placing an order");
      navigate({ to: "/login" });
      return;
    }
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(form));
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    const values = parsed.data;
    setIsSubmitting(true);
    try {
      const result = await createOrder({
        data: {
          customer: { name: values.name, email: values.email, phone: values.phone },
          shippingAddress: {
            address: values.address,
            ...(values.address2 ? { address2: values.address2 } : {}),
            city: values.city,
            province: values.province,
            postalCode: values.postalCode,
            country: values.country,
          },
          items: items.map((item) => ({ productId: item.product.id, quantity: item.qty })),
          ...(values.couponCode ? { couponCode: values.couponCode } : {}),
          ...(values.notes ? { notes: values.notes } : {}),
        },
      });
      if (!result.success || !result.order) throw new Error(result.message);
      if (!user.phone) {
        const profileResult = await updateProfile({
          data: {
            profile: {
              name: user.name,
              email: user.email,
              phone: values.phone,
              avatarUrl: user.avatarUrl ?? "",
            },
          },
        });
        if (profileResult.success && profileResult.user) setUser(profileResult.user);
      }
      clear();
      toast.success(`Order ${result.order.id} placed — pay the courier on delivery.`);
      await navigate({ to: "/account" });
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Unable to place your order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hydrated || isPending) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-[1500px] px-5 py-24 md:px-10">
          <p className="text-muted-foreground">Loading your bag...</p>
        </div>
      </StoreShell>
    );
  }

  if (isError) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-[1500px] px-5 py-24 md:px-10">
          <p role="alert" className="text-destructive">
            Unable to load your bag. Please try again.
          </p>
        </div>
      </StoreShell>
    );
  }

  if (items.length === 0) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-[1500px] px-5 py-24 md:px-10">
          <h1 className="text-5xl">Your bag is empty</h1>
          <Link
            to="/shop"
            className="label-caps mt-8 inline-block bg-primary px-7 py-4 text-primary-foreground"
          >
            Browse the collection
          </Link>
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <div className="mx-auto max-w-[1500px] px-5 py-12 md:px-10">
        <p className="label-caps text-olive">Cash on delivery</p>
        <h1 className="mt-4 text-5xl md:text-7xl">Checkout</h1>

        <form onSubmit={onSubmit} className="mt-12 grid gap-16 md:grid-cols-[1fr_360px]">
          <div className="max-w-xl space-y-6">
            <Field
              label="Full name"
              name="name"
              defaultValue={user?.name ?? ""}
              error={errors["name"]}
            />
            <Field
              label="Phone number"
              name="phone"
              type="tel"
              defaultValue={user?.phone ?? ""}
              error={errors["phone"]}
              placeholder="+92 300 1234567"
            />
            <Field
              label="Email"
              name="email"
              type="email"
              defaultValue={user?.email ?? ""}
              error={errors["email"]}
            />
            <Field label="Street address" name="address" error={errors["address"]} />
            <Field
              label="Apartment / unit / floor (optional)"
              name="address2"
              error={errors["address2"]}
            />
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="City" name="city" error={errors["city"]} />
              <Field label="Province / state" name="province" error={errors["province"]} />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Postal / ZIP code" name="postalCode" error={errors["postalCode"]} />
              <Field
                label="Country"
                name="country"
                defaultValue="Pakistan"
                error={errors["country"]}
              />
            </div>
            <div>
              <label className="label-caps text-muted-foreground" htmlFor="notes">
                Order notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="mt-2 w-full border-b border-hairline bg-transparent py-2 outline-none focus:border-olive"
                placeholder="Delivery instructions, gift note…"
              />
            </div>

            <div>
              <label className="label-caps text-muted-foreground" htmlFor="couponCode">
                Coupon code (optional)
              </label>
              <div className="mt-2 flex gap-3">
                <input
                  id="couponCode"
                  name="couponCode"
                  value={couponCode}
                  onChange={(event) => {
                    setCouponCode(event.target.value);
                    setCouponPreview(null);
                    setCouponMessage(null);
                  }}
                  className="min-w-0 flex-1 border-b border-hairline bg-transparent py-2 outline-none focus:border-olive"
                />
                <button
                  type="button"
                  onClick={() => void applyCoupon()}
                  disabled={isApplyingCoupon}
                  className="label-caps border border-hairline px-4 py-2 transition-colors hover:border-olive hover:text-olive disabled:opacity-50"
                >
                  {isApplyingCoupon ? "Checking..." : "Apply coupon"}
                </button>
              </div>
              {couponMessage && (
                <p className={`mt-2 text-xs ${couponPreview ? "text-olive" : "text-destructive"}`}>
                  {couponMessage}
                </p>
              )}
            </div>

            <div className="border border-hairline p-5">
              <p className="label-caps text-olive">Payment method</p>
              <p className="mt-2 text-sm">
                Cash on delivery — pay the courier when your parcel arrives.
              </p>
            </div>
          </div>

          <aside className="h-fit bg-surface p-8">
            <p className="label-caps text-muted-foreground">Order summary</p>
            <ul className="mt-6 space-y-3 text-sm">
              {items.map(({ product, qty }) => (
                <li key={product.id} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    {product.name} × {qty}
                  </span>
                  <span>{currency(product.price * qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-hairline pt-4 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{currency(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd>{shipping === 0 ? "Free" : currency(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-hairline pt-2 text-base">
                <dt>Total due on delivery</dt>
                <dd>{currency(couponPreview?.total ?? total)}</dd>
              </div>
              {couponPreview && (
                <div className="flex justify-between text-olive">
                  <dt>Coupon ({couponPreview.code})</dt>
                  <dd>-{currency(couponPreview.discount)}</dd>
                </div>
              )}
            </dl>
            <button
              type="submit"
              disabled={isSubmitting}
              className="label-caps mt-8 w-full bg-primary px-6 py-4 text-primary-foreground transition-colors hover:bg-olive hover:text-accent-foreground"
            >
              {isSubmitting ? "Placing order..." : "Place order"}
            </button>
          </aside>
        </form>
      </div>
    </StoreShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  error?: string | undefined;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label-caps text-muted-foreground" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 w-full border-b border-hairline bg-transparent py-2 outline-none focus:border-olive"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
