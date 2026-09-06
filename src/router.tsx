import "@/lib/async-hooks-polyfill";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { useAuth } from "@/lib/store";

function clearExpiredSession(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("UNAUTHORIZED") || message.includes("Unauthorized")) {
    useAuth.getState().signOut();
  }
}

export const getRouter = () => {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({ onError: clearExpiredSession }),
    mutationCache: new MutationCache({ onError: clearExpiredSession }),
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
