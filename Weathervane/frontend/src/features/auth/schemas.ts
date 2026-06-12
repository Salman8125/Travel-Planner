import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CredentialsForm = z.infer<typeof credentialsSchema>;
