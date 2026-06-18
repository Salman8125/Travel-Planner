import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginForm = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});
export type RegisterForm = z.infer<typeof RegisterSchema>;
