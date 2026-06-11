import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { applyApiError } from "@/lib/applyApiError";

import { loginSchema, registerSchema } from "../schemas";
import { useLogin, useRegister } from "../mutations";

interface AuthFormProps {
  mode: "login" | "register";
}

interface FormValues {
  email: string;
  password: string;
}

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo") || "/flights";

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const mutation = isLogin ? loginMutation : registerMutation;

  const form = useForm<FormValues>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success(isLogin ? "Welcome back!" : "Account created.");
        navigate(returnTo, { replace: true });
      },
      onError: (error) => applyApiError<FormValues>(error, form.setError),
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder={isLogin ? "Your password" : "At least 8 characters"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" loading={mutation.isPending}>
          {isLogin ? "Sign in" : "Create account"}
        </Button>
      </form>
    </Form>
  );
}
