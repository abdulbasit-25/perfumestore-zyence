import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { createCategory, deleteCategory, getCategories } from "@/lib/category-server";
import { getProducts } from "@/lib/product-server";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const [draft, setDraft] = useState({ name: "", description: "" });
  const queryClient = useQueryClient();
  const { data: list = [], isError: categoriesError } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => getCategories(),
  });

  // Fetch products from server
  const { data: products = [] } = useQuery({
    queryKey: ["admin-categories-products"],
    queryFn: async () => {
      return getProducts({ data: {} });
    },
  });

  const add = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      toast.error("Category needs a name");
      return;
    }
    const category = {
      name: draft.name.trim(),
      slug: draft.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),
      description: draft.description.trim(),
    };
    try {
      const token = undefined;
      const result = await createCategory({ data: { token, category } });
      if (!result.success) throw new Error(result.message);
      setDraft({ name: "", description: "" });
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success(`${category.name} added`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create category");
    }
  };

  return (
    <AdminShell title="Categories">
      {categoriesError && (
        <p
          role="alert"
          className="mb-4 border border-destructive/50 bg-destructive/10 p-4 text-destructive"
        >
          Unable to load categories.
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface-2">
              <tr>
                <th className="label-caps px-3 py-2 text-left text-muted-foreground">Name</th>
                <th className="label-caps px-3 py-2 text-left text-muted-foreground">Slug</th>
                <th className="label-caps px-3 py-2 text-left text-muted-foreground">Products</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((category) => (
                <tr key={category.id} className="border-t border-border">
                  <td className="px-3 py-2.5">
                    <p>{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{category.slug}</td>
                  <td className="px-3 py-2.5">
                    {products.filter((p) => p.categoryId === category.id).length}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => {
                        void (async () => {
                          try {
                            const token = undefined;
                            const result = await deleteCategory({
                              data: { token, id: category.id },
                            });
                            if (!result.success) throw new Error(result.message);
                            await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
                            toast.success(`${category.name} removed`);
                          } catch (error) {
                            toast.error(
                              error instanceof Error ? error.message : "Failed to delete category",
                            );
                          }
                        })();
                      }}
                      className="label-caps text-muted-foreground hover:text-destructive"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="font-display text-2xl">No categories</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Add one to organise the catalogue.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={add} className="h-fit space-y-4 border border-border bg-card p-4">
          <h2 className="label-caps text-muted-foreground">New category</h2>
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Name"
            className="w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive"
          />
          <textarea
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            placeholder="Short description"
            rows={3}
            className="w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-olive"
          />
          <button
            type="submit"
            className="label-caps w-full bg-primary px-4 py-3 text-primary-foreground"
          >
            Add category
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
