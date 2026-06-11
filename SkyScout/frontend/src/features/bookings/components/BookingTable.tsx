import { createColumnHelper } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";

import { DataTable } from "@/components/common/DataTable";
import { Money } from "@/components/common/Money";
import { Button } from "@/components/ui/button";
import { CABIN_LABELS, type Booking } from "@/types/app";

import { BookingStatusBadge } from "./BookingStatusBadge";

const columnHelper = createColumnHelper<Booking>();

const columns = [
  columnHelper.accessor("reference", {
    header: "PNR",
    cell: (info) => (
      <Link to={`/bookings/${info.getValue()}`} className="font-mono font-medium text-primary hover:underline">
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <BookingStatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("cabin", {
    header: "Cabin",
    cell: (info) => CABIN_LABELS[info.getValue()],
  }),
  columnHelper.accessor((row) => row.passengers.length, {
    id: "passengers",
    header: "Pax",
  }),
  columnHelper.accessor("totalPrice", {
    header: "Total",
    cell: (info) => <Money value={info.getValue()} currency={info.row.original.currency} />,
  }),
  columnHelper.accessor("createdAt", {
    header: "Booked",
    cell: (info) => format(parseISO(info.getValue()), "d MMM yyyy"),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (info) => (
      <Button variant="ghost" size="sm" asChild>
        <Link to={`/bookings/${info.row.original.reference}`}>View</Link>
      </Button>
    ),
  }),
];

export function BookingTable({ data }: { data: Booking[] }) {
  return <DataTable columns={columns} data={data} emptyMessage="No bookings yet." />;
}
