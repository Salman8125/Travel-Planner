import { ShieldX } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function ForbiddenPage() {
  return (
    <div className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
      <ShieldX className="h-12 w-12 text-destructive" aria-hidden />
      <h1 className="text-2xl font-bold">403 — Access denied</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        You don&apos;t have permission to view this page. Admin access is required.
      </p>
      <Button asChild>
        <Link to="/flights">Back to flights</Link>
      </Button>
    </div>
  );
}
