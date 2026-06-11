import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { useAuthBootstrap } from "@/features/auth";
import { useApplyTheme } from "@/hooks/useApplyTheme";
import { useAuth } from "@/hooks/useAuth";

import { createQueryClient } from "./queryClient";

function ThemeGate() {
  useApplyTheme();
  return null;
}

function BootstrapGate({ children }: { children: ReactNode }) {
  useAuthBootstrap();
  const { bootstrapped } = useAuth();

  if (!bootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }
  return <>{children}</>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeGate />
        <BootstrapGate>{children}</BootstrapGate>
        <Toaster />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
