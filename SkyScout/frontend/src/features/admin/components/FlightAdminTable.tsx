import { createColumnHelper } from "@tanstack/react-table";

import { DataTable } from "@/components/common/DataTable";
import { totalSeatsAvailable } from "@/features/flights/fares";
import { formatDateTime } from "@/lib/date";
import type { FlightSummary } from "@/types/app";

import { FlightAdminActions } from "./FlightAdminActions";

const columnHelper = createColumnHelper<FlightSummary>();

const columns = [
  columnHelper.accessor("flightNumber", { header: "Flight" }),
  columnHelper.accessor((row) => `${row.origin.iataCode} → ${row.destination.iataCode}`, {
    id: "route",
    header: "Route",
  }),
  columnHelper.accessor((row) => row.scheduledDeparture, {
    id: "departure",
    header: "Departs",
    cell: (info) => formatDateTime(info.getValue(), info.row.original.origin.timezone),
  }),
  columnHelper.accessor((row) => totalSeatsAvailable(row), {
    id: "seats",
    header: "Seats left",
  }),
  columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: (info) => <FlightAdminActions flight={info.row.original} />,
  }),
];

export function FlightAdminTable({ data }: { data: FlightSummary[] }) {
  return <DataTable columns={columns} data={data} emptyMessage="No flights match this search." />;
}
