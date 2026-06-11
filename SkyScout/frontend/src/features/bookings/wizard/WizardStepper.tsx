import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "@/store/bookingWizardStore";

export function WizardStepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Booking progress">
      {WIZARD_STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary text-primary",
                !done && !active && "border-muted text-muted-foreground",
              )}
              aria-current={active ? "step" : undefined}
            >
              {done ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                active ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {index < WIZARD_STEPS.length - 1 && (
              <span className={cn("h-px flex-1", done ? "bg-primary" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
