import { ArrowDownUp } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortBy = "price" | "departure" | "duration";
type Order = "asc" | "desc";

interface SortControlsProps {
  sortBy?: SortBy;
  order?: Order;
  onChange: (patch: { sortBy?: string; order?: string }) => void;
}

export function SortControls({ sortBy, order, onChange }: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowDownUp className="h-4 w-4 text-muted-foreground" aria-hidden />
      <Select
        value={sortBy ?? "default"}
        onValueChange={(v) => onChange({ sortBy: v === "default" ? undefined : v })}
      >
        <SelectTrigger className="w-[150px]" aria-label="Sort by">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Best match</SelectItem>
          <SelectItem value="price">Price</SelectItem>
          <SelectItem value="departure">Departure</SelectItem>
          <SelectItem value="duration">Duration</SelectItem>
        </SelectContent>
      </Select>
      <Select value={order ?? "asc"} onValueChange={(v) => onChange({ order: v })} disabled={!sortBy}>
        <SelectTrigger className="w-[120px]" aria-label="Order">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
