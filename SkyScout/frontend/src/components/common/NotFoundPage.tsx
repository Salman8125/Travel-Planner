import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Compass className="h-12 w-12 text-muted-foreground" aria-hidden />
      <h1 className="text-2xl font-bold">404 — Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Button asChild>
        <Link to="/flights">Back to flights</Link>
      </Button>
    </div>
  );
}
