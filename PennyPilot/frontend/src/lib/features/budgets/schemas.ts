import { z } from 'zod/v3';

const amount = z
  .string()
  .min(1, 'Required')
  .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount (up to 2 decimals)');

const allocation = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount')
  .default('0.00');

const period = z.enum(['ONE_TIME', 'WEEKLY', 'MONTHLY', 'YEARLY']);

export const categoryRowSchema = z.object({
  name: z.string().min(1, 'Name required').max(80, 'Too long'),
  allocated_amount: allocation
});

export const budgetCreateSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(120, 'Too long'),
    total_amount: amount.refine((v) => Number(v) > 0, 'Must be greater than 0'),
    currency: z.string().length(3, 'Use a 3-letter code'),
    period,
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().nullable().default(null),
    allow_overspend: z.boolean().default(false),
    categories: z.array(categoryRowSchema).default([])
  })
  .superRefine((data, ctx) => {
    if (data.end_date && data.end_date <= data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_date'],
        message: 'Must be after the start date'
      });
    }
    const allocated = data.categories.reduce((sum, c) => sum + Number(c.allocated_amount || 0), 0);
    if (allocated > Number(data.total_amount || 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['categories'],
        message: 'Category allocations exceed the total budget'
      });
    }
  });

export const budgetEditSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(120, 'Too long'),
    total_amount: amount.refine((v) => Number(v) > 0, 'Must be greater than 0'),
    currency: z.string().length(3),
    period,
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().nullable().default(null),
    allow_overspend: z.boolean().default(false)
  })
  .superRefine((data, ctx) => {
    if (data.end_date && data.end_date <= data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_date'],
        message: 'Must be after the start date'
      });
    }
  });

export type BudgetCreateInput = z.infer<typeof budgetCreateSchema>;
export type BudgetEditInput = z.infer<typeof budgetEditSchema>;
