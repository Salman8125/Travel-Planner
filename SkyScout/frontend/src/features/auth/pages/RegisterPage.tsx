import { Link, useSearchParams } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { AuthForm } from "../components/AuthForm";

export default function RegisterPage() {
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo");
  const loginHref = returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login";

  return (
    <div className="container flex justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Book flights in seconds with SkyScout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthForm mode="register" />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to={loginHref} className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
