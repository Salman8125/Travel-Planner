import { createColumnHelper } from "@tanstack/react-table";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable";
import { ErrorState } from "@/components/common/ErrorState";
import { ListSkeleton } from "@/components/common/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAirlines, useAirports } from "@/features/reference/queries";
import type { Airline, Airport } from "@/types/app";

import { AirlineForm } from "../components/AirlineForm";
import { AirportForm } from "../components/AirportForm";
import { useDeleteAirline, useDeleteAirport } from "../mutations";

function DeleteAirportButton({ airport }: { airport: Airport }) {
  const del = useDeleteAirport();
  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm">
          Delete
        </Button>
      }
      title={`Delete ${airport.iataCode}?`}
      description="Airports referenced by a flight can't be deleted."
      destructive
      confirmLabel="Delete"
      loading={del.isPending}
      onConfirm={(close) => del.mutate(airport.id, { onSuccess: close })}
    />
  );
}

function DeleteAirlineButton({ airline }: { airline: Airline }) {
  const del = useDeleteAirline();
  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm">
          Delete
        </Button>
      }
      title={`Delete ${airline.iataCode}?`}
      description="Airlines referenced by a flight can't be deleted."
      destructive
      confirmLabel="Delete"
      loading={del.isPending}
      onConfirm={(close) => del.mutate(airline.id, { onSuccess: close })}
    />
  );
}

const airportCols = createColumnHelper<Airport>();
const airportColumns = [
  airportCols.accessor("iataCode", { header: "IATA" }),
  airportCols.accessor("name", { header: "Name" }),
  airportCols.accessor("city", { header: "City" }),
  airportCols.accessor("country", { header: "Country" }),
  airportCols.accessor("timezone", { header: "Timezone" }),
  airportCols.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: (info) => (
      <div className="text-right">
        <DeleteAirportButton airport={info.row.original} />
      </div>
    ),
  }),
];

const airlineCols = createColumnHelper<Airline>();
const airlineColumns = [
  airlineCols.accessor("iataCode", { header: "IATA" }),
  airlineCols.accessor("name", { header: "Name" }),
  airlineCols.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: (info) => (
      <div className="text-right">
        <DeleteAirlineButton airline={info.row.original} />
      </div>
    ),
  }),
];

export default function AdminReferencePage() {
  const airportsQuery = useAirports(1, 100);
  const airlinesQuery = useAirlines(1, 100);

  return (
    <Tabs defaultValue="airports" className="space-y-4">
      <TabsList>
        <TabsTrigger value="airports">Airports</TabsTrigger>
        <TabsTrigger value="airlines">Airlines</TabsTrigger>
      </TabsList>

      <TabsContent value="airports" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Airports</h2>
          <AirportForm />
        </div>
        {airportsQuery.isLoading ? (
          <ListSkeleton rows={5} />
        ) : airportsQuery.isError ? (
          <ErrorState error={airportsQuery.error} onRetry={() => airportsQuery.refetch()} />
        ) : (
          <DataTable columns={airportColumns} data={airportsQuery.data?.data ?? []} />
        )}
      </TabsContent>

      <TabsContent value="airlines" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Airlines</h2>
          <AirlineForm />
        </div>
        {airlinesQuery.isLoading ? (
          <ListSkeleton rows={5} />
        ) : airlinesQuery.isError ? (
          <ErrorState error={airlinesQuery.error} onRetry={() => airlinesQuery.refetch()} />
        ) : (
          <DataTable columns={airlineColumns} data={airlinesQuery.data?.data ?? []} />
        )}
      </TabsContent>
    </Tabs>
  );
}
