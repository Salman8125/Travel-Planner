import { Suspense } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { PageSkeleton } from "@/components/common/PageSkeleton";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/admin/flights", label: "Flights" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/reference", label: "Reference" },
];

export default function AdminLayout() {
  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-muted-foreground">Manage flights, bookings, and reference data.</p>
      </div>

      <nav className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
    </div>
  );
}
