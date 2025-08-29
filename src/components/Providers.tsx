// src/components/Providers.tsx
"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import GlobalLoader from "@/components/common/GlobalLoader";

export default function Providers({ children }: { children: ReactNode }) {
  // keep a stable QueryClient instance
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 5 * 60 * 1000, retry: 1 },
          mutations: { retry: 0 },
        },
      })
  );

  return (
    <AuthProvider>
      <QueryClientProvider client={qc}>
        <UIProvider>
          {children}
          <GlobalLoader />
        </UIProvider>

        {process.env.NODE_ENV !== "production" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </AuthProvider>
  );
}
