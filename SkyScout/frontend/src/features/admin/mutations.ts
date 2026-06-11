import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as referenceApi from "@/features/reference/api";
import { queryKeys } from "@/lib/queryKeys";
import type { FlightStatus } from "@/types/app";

import * as adminApi from "./api";
import type { CreateFlightInput } from "./api";

function useInvalidateFlights() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.flights.all });
}

export function useCreateFlight() {
  const invalidate = useInvalidateFlights();
  return useMutation({
    mutationFn: (input: CreateFlightInput) => adminApi.createFlight(input),
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      invalidate();
      toast.success("Flight created.");
    },
  });
}

export function useSetFlightStatus() {
  const invalidate = useInvalidateFlights();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: FlightStatus }) =>
      adminApi.setFlightStatus(id, status),
    onSuccess: () => {
      invalidate();
      toast.success("Flight status updated.");
    },
  });
}

export function useDeleteFlight() {
  const invalidate = useInvalidateFlights();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteFlight(id),
    onSuccess: () => {
      invalidate();
      toast.success("Flight deleted.");
    },
  });
}

function useInvalidateReference() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["reference", "airports"] });
    queryClient.invalidateQueries({ queryKey: ["reference", "airlines"] });
  };
}

export function useCreateAirport() {
  const invalidate = useInvalidateReference();
  return useMutation({
    mutationFn: referenceApi.createAirport,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      invalidate();
      toast.success("Airport created.");
    },
  });
}

export function useDeleteAirport() {
  const invalidate = useInvalidateReference();
  return useMutation({
    mutationFn: (id: string) => referenceApi.deleteAirport(id),
    onSuccess: () => {
      invalidate();
      toast.success("Airport deleted.");
    },
  });
}

export function useCreateAirline() {
  const invalidate = useInvalidateReference();
  return useMutation({
    mutationFn: referenceApi.createAirline,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      invalidate();
      toast.success("Airline created.");
    },
  });
}

export function useDeleteAirline() {
  const invalidate = useInvalidateReference();
  return useMutation({
    mutationFn: (id: string) => referenceApi.deleteAirline(id),
    onSuccess: () => {
      invalidate();
      toast.success("Airline deleted.");
    },
  });
}
