import { Navigate, Outlet, useLocation } from "react-router-dom";

import { ForbiddenPage } from "@/components/common/ForbiddenPage";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";

export function AdminRoute() {
  const { isAuthenticated, isAdmin, bootstrapped } = useAuth();
  const location = useLocation();

  if (!bootstrapped) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  if (!isAdmin) return <ForbiddenPage />;

  return <Outlet />;
}
