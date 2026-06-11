import { z } from 'zod/v3';

const amount = z
  .string()
  .min(1, 'Amount is required')
  .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount')
  .refine((v) => Number(v) > 0, 'Must be greater than 0');

export const expenseRecordSchema = z.object({
  amount,
  date: z.string().min(1, 'Date is required'),
  description: z.string().max(255, 'Too long').default(''),
  category_id: z.string().nullable().default(null)
});

export const expenseEditSchema = z.object({
  amount,
  date: z.string().min(1, 'Date is required'),
  description: z.string().max(255, 'Too long').default(''),
  category_id: z.string().nullable().default(null)
});

export type ExpenseRecordInput = z.infer<typeof expenseRecordSchema>;
export type ExpenseEditInput = z.infer<typeof expenseEditSchema>;
