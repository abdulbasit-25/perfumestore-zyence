import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import appCss from "../styles/styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUser } from "@/lib/auth-server";
import { useAuth } from "@/lib/store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl">404</h1>
        <h2 className="mt-4 text-xl">This page has been retired</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="label-caps inline-flex items-center justify-center bg-primary px-5 py-3 text-primary-foreground transition-colors hover:bg-olive hover:text-accent-foreground"
          >
            Back to the shop
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="label-caps bg-primary px-5 py-3 text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="label-caps border border-hairline px-5 py-3">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const themeScript = `(function(){try{var s=localStorage.getItem('sorrel-theme');var t=s?JSON.parse(s).state.theme:'light';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

// Suppress AsyncLocalStorage error which is a known TanStack Start issue
const errorSuppressionScript = `(function(){var originalError=console.error;console.error=function(){if(arguments[0]&&typeof arguments[0]==='string'&&arguments[0].includes('AsyncLocalStorage is not a constructor')){return;}originalError.apply(console,arguments)};window.addEventListener('error',function(e){if(e.message&&e.message.includes('AsyncLocalStorage is not a constructor')){e.preventDefault();}},true);})();`;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sorrel — Slow-made goods, paid on delivery" },
      {
        name: "description",
        content:
          "Sorrel is an independent atelier making linen apparel, stoneware ceramics and considered objects. Cash on delivery.",
      },
      { property: "og:title", content: "Sorrel — Slow-made goods" },
      {
        property: "og:description",
        content: "Linen apparel, stoneware and objects from an independent atelier.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: errorSuppressionScript }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <AuthSessionHydrator />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster position="bottom-right" />
      </QueryClientProvider>
    </TooltipProvider>
  );
}

function AuthSessionHydrator() {
  const setUser = useAuth((state) => state.setUser);
  const { data, isPending } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => getCurrentUser(),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!isPending) setUser(data ?? null);
  }, [data, isPending, setUser]);

  return null;
}
