import { Check } from "lucide-react";

import { Money } from "@/components/common/Money";
import { cn } from "@/lib/utils";
import { CABIN_LABELS, type Cabin, type CabinAvailability } from "@/types/app";

interface CabinPickerProps {
  cabins: CabinAvailability[];
  totalPassengers: number;
  value?: Cabin;
  onChange: (cabin: Cabin) => void;
}

export function CabinPicker({ cabins, totalPassengers, value, onChange }: CabinPickerProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Select cabin">
      {cabins.map((cabin) => {
        const disabled = cabin.availableSeats < totalPassengers;
        const selected = value === cabin.cabin;
        return (
          <button
            key={cabin.cabin}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(cabin.cabin)}
            className={cn(
              "relative flex flex-col items-start rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected ? "border-primary ring-2 ring-primary" : "hover:border-primary/50",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {selected && <Check className="absolute right-3 top-3 h-4 w-4 text-primary" aria-hidden />}
            <span className="text-sm font-semibold">{CABIN_LABELS[cabin.cabin]}</span>
            <span className="mt-1 text-lg font-bold">
              <Money value={cabin.basePrice} currency={cabin.currency} />
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              {cabin.availableSeats > 0
                ? `${cabin.availableSeats} seat${cabin.availableSeats === 1 ? "" : "s"} left`
                : "Sold out"}
            </span>
            {disabled && cabin.availableSeats > 0 && (
              <span className="mt-1 text-xs text-destructive">Not enough seats</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
