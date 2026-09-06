import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import type { Product } from "@/lib/catalog-types";
import {
  createAdminReview,
  deleteReview,
  getReviews,
  moderateReview,
  type AdminReview,
  type ReviewStatus,
} from "@/lib/review-server";
import { getProducts } from "@/lib/product-server";

export const Route = createFileRoute("/admin/reviews")({ component: AdminReviews });
const statuses: { label: string; value: ReviewStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

function AdminReviews() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<AdminReview | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("all");
  const [adding, setAdding] = useState(false);
  const {
    data: reviews = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => getReviews({ data: { token: undefined } }),
  });
  const visibleReviews = useMemo(
    () =>
      statusFilter === "all" ? reviews : reviews.filter((review) => review.status === statusFilter),
    [reviews, statusFilter],
  );
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });

  const moderate = async (review: AdminReview, status: ReviewStatus) => {
    const result = await moderateReview({
      data: { token: undefined, id: review.id, status },
    });
    if (!result.success) toast.error(result.message);
    else {
      toast.success(`Review ${status}.`);
      setSelected(null);
      refresh();
    }
  };

  const remove = async (review: AdminReview) => {
    if (!window.confirm(`Delete the review for ${review.productName}?`)) return;
    const result = await deleteReview({
      data: { token: undefined, id: review.id },
    });
    if (!result.success) toast.error(result.message);
    else {
      toast.success("Review deleted.");
      setSelected(null);
      refresh();
    }
  };

  return (
    <AdminShell title="Reviews">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => setStatusFilter(status.value)}
              className={`border px-3 py-2 text-sm ${statusFilter === status.value ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
            >
              {status.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Add review
        </button>
      </div>
      {isPending ? <p className="py-12 text-muted-foreground">Loading reviews...</p> : null}
      {isError ? (
        <p role="alert" className="py-12 text-destructive">
          Unable to load reviews.
        </p>
      ) : null}
      {!isPending && !isError ? (
        <DataTable
          data={visibleReviews}
          columns={[
            { accessorKey: "productName", header: "Product" },
            { accessorKey: "customerName", header: "Customer" },
            {
              accessorKey: "rating",
              header: "Rating",
              cell: ({ getValue }: { getValue: () => unknown }) => (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-olive text-olive" /> {String(getValue())}
                </span>
              ),
            },
            { accessorKey: "status", header: "Status" },
            { accessorKey: "isVerifiedPurchase", header: "Verified" },
            {
              id: "actions",
              header: "",
              cell: ({ row }: { row: { original: AdminReview } }) => (
                <button
                  type="button"
                  className="label-caps text-olive"
                  onClick={() => setSelected(row.original)}
                >
                  View
                </button>
              ),
            },
          ]}
          searchPlaceholder="Search reviews..."
          emptyTitle="No reviews"
          emptyBody="Customer reviews will appear here for moderation."
        />
      ) : null}
      {selected ? (
        <ReviewDrawer
          review={selected}
          onClose={() => setSelected(null)}
          onModerate={(status) => void moderate(selected, status)}
          onDelete={() => void remove(selected)}
        />
      ) : null}
      {adding ? (
        <AddReviewDrawer
          products={[]}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            refresh();
          }}
        />
      ) : null}
    </AdminShell>
  );
}

function ReviewDrawer({
  review,
  onClose,
  onModerate,
  onDelete,
}: {
  review: AdminReview;
  onClose: () => void;
  onModerate: (status: ReviewStatus) => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30" onClick={onClose}>
      <aside
        className="h-full w-full max-w-lg overflow-y-auto bg-background p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between">
          <h2 className="font-display text-3xl">Review details</h2>
          <button type="button" onClick={onClose} className="label-caps text-muted-foreground">
            Close
          </button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">{review.productName}</p>
        <p className="mt-2 text-lg">{review.title}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{review.comment}</p>
        <dl className="mt-8 space-y-2 border-t border-border pt-5 text-sm">
          <div className="flex justify-between">
            <dt>Customer</dt>
            <dd>{review.customerName}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Created by</dt>
            <dd>{review.createdBy}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Verified purchase</dt>
            <dd>{review.isVerifiedPurchase ? "Yes" : "No"}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Status</dt>
            <dd>{review.status}</dd>
          </div>
        </dl>
        <div className="mt-8 grid grid-cols-3 gap-2">
          {statuses.slice(1).map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => onModerate(status.value as ReviewStatus)}
              className="border border-border px-3 py-2 text-sm"
            >
              {status.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="mt-8 w-full border border-destructive px-3 py-2 text-sm text-destructive"
        >
          Delete review
        </button>
      </aside>
    </div>
  );
}

function AddReviewDrawer({
  products: initialProducts,
  onClose,
  onSaved,
}: {
  products: Product[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<ReviewStatus>("approved");
  const [rating, setRating] = useState(5);
  const { data: products = initialProducts } = useQuery({
    queryKey: ["admin-review-products"],
    queryFn: () => getProducts({ data: {} }),
  });
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const result = await createAdminReview({
        data: {
          token: undefined,
          productId: String(form.get("productId")),
          customerName: String(form.get("customerName") ?? ""),
          title: String(form.get("title") ?? "Customer review"),
          rating,
          comment: String(form.get("comment") ?? ""),
          status,
          isVerifiedPurchase: form.get("verified") === "on",
        },
      });
      if (!result.success) toast.error(result.message);
      else {
        toast.success("Review added.");
        onSaved();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add review.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30" onClick={onClose}>
      <aside
        className="h-full w-full max-w-lg overflow-y-auto bg-background p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between">
          <h2 className="font-display text-3xl">Add review</h2>
          <button type="button" onClick={onClose} className="label-caps text-muted-foreground">
            Close
          </button>
        </div>
        <form onSubmit={save} className="mt-8 space-y-5 text-sm">
          <label className="block">
            Product
            <select
              name="productId"
              required
              className="mt-2 w-full border border-border bg-background p-3"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            Customer name (optional)
            <input
              name="customerName"
              className="mt-2 w-full border border-border bg-background p-3"
            />
          </label>
          <fieldset>
            <legend>Rating</legend>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} stars`}
                  onClick={() => setRating(value)}
                  className="p-1"
                >
                  <Star
                    className={`h-5 w-5 ${value <= rating ? "fill-olive text-olive" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            Title
            <input
              name="title"
              defaultValue="Customer review"
              className="mt-2 w-full border border-border bg-background p-3"
            />
          </label>
          <label className="block">
            Comment
            <textarea
              name="comment"
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              className="mt-2 w-full border border-border bg-background p-3"
            />
          </label>
          <label className="flex items-center gap-2">
            <input name="verified" type="checkbox" /> Verified purchase
          </label>
          <label className="block">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ReviewStatus)}
              className="mt-2 w-full border border-border bg-background p-3"
            >
              {statuses.slice(1).map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
              <option value="pending">Pending</option>
            </select>
          </label>
          <button disabled={saving} className="w-full bg-primary px-4 py-3 text-primary-foreground">
            {saving ? "Saving..." : "Add review"}
          </button>
        </form>
      </aside>
    </div>
  );
}
