import { z } from 'zod/v3';

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(80, 'Too long'),
  allocated_amount: z
    .string()
    .min(1, 'Required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount')
    .default('0.00')
});

export type CategoryInput = z.infer<typeof categorySchema>;
