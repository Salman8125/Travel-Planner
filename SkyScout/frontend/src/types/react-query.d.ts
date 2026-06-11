import "@tanstack/react-query";

interface AppQueryMeta {
  suppressGlobalError?: boolean;
}

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: AppQueryMeta;
    mutationMeta: AppQueryMeta;
  }
}
