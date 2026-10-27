"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { useStorageSync } from "@/hooks/useStorageSync";

/**
 * Client-side providers for the whole app.
 *
 * The QueryClient is created inside `useState` so each browser session gets
 * exactly one instance and server renders never share cache state.
 *
 * `StorageQuerySync` bridges localStorage writes into the query cache. The
 * collection hooks also poll, so screens still refresh if a write happens
 * without a subscription event.
 */
function StorageQuerySync() {
  useStorageSync();
  return null;
}
export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Mock data lives in localStorage, so refetching on every window
            // focus is pure noise.
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <StorageQuerySync />
      {children}
    </QueryClientProvider>
  );
}
