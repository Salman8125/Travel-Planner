import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAirlines } from "@/features/reference/queries";

export interface FilterValues {
  priceMin?: string;
  priceMax?: string;
  airlines: string[];
}

interface FiltersProps {
  value: FilterValues;
  onApply: (patch: Record<string, string | undefined>) => void;
}

export function Filters({ value, onApply }: FiltersProps) {
  const airlinesQuery = useAirlines();
  const airlines = airlinesQuery.data?.data ?? [];

  const [priceMin, setPriceMin] = useState(value.priceMin ?? "");
  const [priceMax, setPriceMax] = useState(value.priceMax ?? "");
  const [selected, setSelected] = useState<string[]>(value.airlines);

  const toggleAirline = (code: string) => {
    setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };

  const apply = () => {
    onApply({
      priceMin: priceMin.trim() || undefined,
      priceMax: priceMax.trim() || undefined,
      airlines: selected.length ? selected.join(",") : undefined,
    });
  };

  const clear = () => {
    setPriceMin("");
    setPriceMax("");
    setSelected([]);
    onApply({ priceMin: undefined, priceMax: undefined, airlines: undefined });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Price range</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="decimal"
              placeholder="Min"
              min={0}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              aria-label="Minimum price"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="Max"
              min={0}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              aria-label="Maximum price"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Airlines</Label>
          <div className="max-h-48 space-y-1.5 overflow-auto pr-1">
            {airlines.map((a) => (
              <label key={a.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input accent-primary"
                  checked={selected.includes(a.iataCode)}
                  onChange={() => toggleAirline(a.iataCode)}
                />
                <span className="truncate">
                  {a.name} <span className="text-muted-foreground">({a.iataCode})</span>
                </span>
              </label>
            ))}
            {airlines.length === 0 && (
              <p className="text-xs text-muted-foreground">No airlines available.</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={apply} className="flex-1">
            Apply
          </Button>
          <Button size="sm" variant="outline" onClick={clear}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
