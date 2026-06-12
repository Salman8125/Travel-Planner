import { http, unwrap, unwrapList } from "@/lib/api/client";
import type { Location, PaginationMeta } from "@/lib/api/models";
import type { LocationListParams } from "@/lib/api/query-keys";

export function listLocations(
  params: LocationListParams,
): Promise<{ data: Location[]; meta: PaginationMeta }> {
  return unwrapList<Location>(http.get("/api/locations", { params }));
}

export function getLocation(id: string): Promise<Location> {
  return unwrap<Location>(http.get(`/api/locations/${encodeURIComponent(id)}`));
}
