import "@tanstack/vue-query";

declare module "@tanstack/vue-query" {
  interface Register {
    queryMeta: {
      suppressGlobalError?: boolean;
    };
    mutationMeta: {
      suppressGlobalError?: boolean;
    };
  }
}
