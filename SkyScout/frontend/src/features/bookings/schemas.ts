import { z } from "zod";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

function ageInYears(dob: string): number {
  return (Date.now() - new Date(dob).getTime()) / MS_PER_YEAR;
}

export const passengerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    dateOfBirth: dateOnly,
    type: z.enum(["ADULT", "CHILD", "INFANT"]),
    passportNumber: z.string().trim().optional(),
  })
  .superRefine((p, ctx) => {
    const age = ageInYears(p.dateOfBirth);
    if (Number.isNaN(age) || age < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date of birth must be in the past", path: ["dateOfBirth"] });
      return;
    }
    if (p.type === "INFANT" && age >= 2)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Infants must be under 2", path: ["dateOfBirth"] });
    if (p.type === "CHILD" && (age < 2 || age >= 12))
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Children must be 2–11", path: ["dateOfBirth"] });
    if (p.type === "ADULT" && age < 12)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Adults must be 12 or older", path: ["dateOfBirth"] });
  });

export const passengersFormSchema = z.object({
  passengers: z.array(passengerSchema).min(1, "At least one passenger").max(9, "Up to 9 passengers"),
});

export const contactSchema = z.object({
  contactEmail: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export type PassengersFormValues = z.infer<typeof passengersFormSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;
