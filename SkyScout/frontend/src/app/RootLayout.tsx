import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import { NavBar } from "@/components/common/NavBar";
import { PageSkeleton } from "@/components/common/PageSkeleton";

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          SkyScout — flight search &amp; booking demo.
        </div>
      </footer>
    </div>
  );
}
