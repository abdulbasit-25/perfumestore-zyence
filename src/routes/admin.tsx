import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { canAccessAdmin } from "@/lib/permissions";
import { useAuth, useHydrated } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Zyence Studio — Admin" },
      { name: "description", content: "Internal Zyence operations dashboard." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Zyence Studio" },
      { property: "og:description", content: "Internal operations dashboard." },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const user = useAuth((s) => s.user);
  const authReady = useAuth((s) => s.ready);
  const hydrated = useHydrated();
  const navigate = useNavigate();

  useEffect(() => {
    // After hydration, check authentication and role
    if (hydrated && authReady) {
      if (!user) {
        // Not authenticated, redirect to login
        navigate({ to: "/login" });
      } else if (!canAccessAdmin(user.role)) {
        // Authenticated but not admin, redirect to account
        navigate({ to: "/account" });
      }
    }
  }, [authReady, hydrated, user, navigate]);

  // Show loading while hydrating or redirecting
  if (!hydrated || !authReady || !user || !canAccessAdmin(user.role)) {
    return (
      <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10">
        <div className="h-16 w-64 animate-pulse bg-surface-2" />
      </div>
    );
  }

  return <Outlet />;
}
