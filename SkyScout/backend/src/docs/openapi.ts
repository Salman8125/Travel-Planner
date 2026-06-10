const bearer = [{ bearerAuth: [] as string[] }];

const errorResponse = {
  description: "Error",
  content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } },
};

function dataResponse(description: string, schemaRef: string, withMeta = false) {
  const schema: Record<string, unknown> = {
    type: "object",
    properties: { data: { $ref: schemaRef } },
    required: ["data"],
  };
  if (withMeta) {
    (schema.properties as Record<string, unknown>).meta = { $ref: "#/components/schemas/PaginationMeta" };
  }
  return { description, content: { "application/json": { schema } } };
}

function listResponse(description: string, itemRef: string) {
  return {
    description,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            data: { type: "array", items: { $ref: itemRef } },
            meta: { $ref: "#/components/schemas/PaginationMeta" },
          },
          required: ["data", "meta"],
        },
      },
    },
  };
}

function jsonBody(schema: unknown, required = true) {
  return { required, content: { "application/json": { schema } } };
}

export const openapiDocument: Record<string, unknown> = {
  openapi: "3.0.3",
  info: {
    title: "SkyScout API",
    version: "2.0.0",
    description:
      "Flight search & booking API. Responses use a `{ data, meta? }` envelope; errors use " +
      "`{ error: { code, message, details?, requestId } }`. Authenticated routes use a Bearer JWT.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Auth" },
    { name: "Flights" },
    { name: "Bookings" },
    { name: "Reference" },
    { name: "Ops" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      ErrorEnvelope: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: {},
              requestId: { type: "string" },
            },
            required: ["code", "message"],
          },
        },
      },
      PaginationMeta: {
        type: "object",
        properties: {
          page: { type: "integer" },
          pageSize: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
      AuthResult: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              email: { type: "string", format: "email" },
              role: { type: "string", enum: ["USER", "ADMIN"] },
            },
          },
        },
      },
      CabinAvailability: {
        type: "object",
        properties: {
          cabin: { type: "string", enum: ["ECONOMY", "BUSINESS", "FIRST"] },
          basePrice: { type: "string", example: "278.00" },
          currency: { type: "string", example: "USD" },
          availableSeats: { type: "integer" },
          totalSeats: { type: "integer" },
        },
      },
      FlightSummary: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          flightNumber: { type: "string" },
          airline: { type: "object", properties: { iataCode: { type: "string" }, name: { type: "string" } } },
          origin: { type: "object", properties: { iataCode: { type: "string" }, city: { type: "string" }, timezone: { type: "string" } } },
          destination: { type: "object", properties: { iataCode: { type: "string" }, city: { type: "string" }, timezone: { type: "string" } } },
          scheduledDeparture: { type: "string", format: "date-time" },
          scheduledArrival: { type: "string", format: "date-time" },
          durationMinutes: { type: "integer" },
          status: { type: "string", enum: ["SCHEDULED", "DELAYED", "BOARDING", "DEPARTED", "ARRIVED", "CANCELLED"] },
          cabins: { type: "array", items: { $ref: "#/components/schemas/CabinAvailability" } },
        },
      },
      FlightSearchResult: {
        type: "object",
        properties: {
          outbound: {
            type: "object",
            properties: {
              data: { type: "array", items: { $ref: "#/components/schemas/FlightSummary" } },
              meta: { $ref: "#/components/schemas/PaginationMeta" },
            },
          },
          inbound: {
            type: "object",
            nullable: true,
            properties: {
              data: { type: "array", items: { $ref: "#/components/schemas/FlightSummary" } },
              meta: { $ref: "#/components/schemas/PaginationMeta" },
            },
          },
        },
      },
      Passenger: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          dateOfBirth: { type: "string", format: "date" },
          type: { type: "string", enum: ["ADULT", "CHILD", "INFANT"] },
          passportNumber: { type: "string", nullable: true },
          seatNumber: { type: "string", nullable: true },
        },
      },
      Booking: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          reference: { type: "string", example: "4XHN36" },
          status: { type: "string", enum: ["PENDING", "CONFIRMED", "CANCELLED", "FAILED"] },
          flightId: { type: "string", format: "uuid" },
          cabin: { type: "string", enum: ["ECONOMY", "BUSINESS", "FIRST"] },
          totalPrice: { type: "string", example: "278.00" },
          currency: { type: "string" },
          contactEmail: { type: "string", format: "email" },
          passengers: { type: "array", items: { $ref: "#/components/schemas/Passenger" } },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          cancelledAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      Airport: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          iataCode: { type: "string" },
          name: { type: "string" },
          city: { type: "string" },
          country: { type: "string" },
          timezone: { type: "string" },
        },
      },
      Airline: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          iataCode: { type: "string" },
          name: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/health": { get: { tags: ["Ops"], summary: "Liveness", responses: { "200": { description: "ok" } } } },
    "/ready": { get: { tags: ["Ops"], summary: "Readiness (DB ping)", responses: { "200": { description: "ready" }, "503": { description: "db down" } } } },

    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: jsonBody({ type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email" }, password: { type: "string", minLength: 8 } } }),
        responses: { "201": dataResponse("Created", "#/components/schemas/AuthResult"), "400": errorResponse, "409": errorResponse },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        requestBody: jsonBody({ type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email" }, password: { type: "string" } } }),
        responses: { "200": dataResponse("Token", "#/components/schemas/AuthResult"), "401": errorResponse },
      },
    },
    "/api/auth/me": {
      get: { tags: ["Auth"], summary: "Current user", security: bearer, responses: { "200": { description: "User" }, "401": errorResponse } },
    },

    "/api/flights/search": {
      post: {
        tags: ["Flights"],
        summary: "Search flights",
        requestBody: jsonBody({
          type: "object",
          required: ["origin", "destination", "departureDate"],
          properties: {
            origin: { type: "string", minLength: 3, maxLength: 3 },
            destination: { type: "string", minLength: 3, maxLength: 3 },
            departureDate: { type: "string", format: "date" },
            returnDate: { type: "string", format: "date" },
            passengers: { type: "object", properties: { adults: { type: "integer" }, children: { type: "integer" }, infants: { type: "integer" } } },
            cabin: { type: "string", enum: ["ECONOMY", "BUSINESS", "FIRST"] },
            sortBy: { type: "string", enum: ["price", "departure", "duration"] },
            order: { type: "string", enum: ["asc", "desc"] },
            page: { type: "integer" },
            pageSize: { type: "integer" },
          },
        }),
        responses: { "200": dataResponse("Results", "#/components/schemas/FlightSearchResult"), "400": errorResponse },
      },
    },
    "/api/flights/{id}": {
      get: { tags: ["Flights"], summary: "Flight details", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": dataResponse("Flight", "#/components/schemas/FlightSummary"), "404": errorResponse } },
      patch: {
        tags: ["Flights"],
        summary: "Update flight (admin)",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: jsonBody({ type: "object", properties: { flightNumber: { type: "string" }, scheduledDeparture: { type: "string", format: "date-time" }, scheduledArrival: { type: "string", format: "date-time" }, aircraftId: { type: "string", format: "uuid", nullable: true }, status: { type: "string", enum: ["SCHEDULED", "DELAYED", "BOARDING", "DEPARTED", "ARRIVED"] } } }),
        responses: { "200": dataResponse("Updated", "#/components/schemas/FlightSummary"), "400": errorResponse, "401": errorResponse, "403": errorResponse, "404": errorResponse },
      },
      delete: { tags: ["Flights"], summary: "Soft-delete flight (admin)", security: bearer, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }], responses: { "204": { description: "Deleted" }, "401": errorResponse, "403": errorResponse, "404": errorResponse, "409": errorResponse } },
    },
    "/api/flights": {
      post: {
        tags: ["Flights"],
        summary: "Create flight + cabin inventory (admin)",
        security: bearer,
        requestBody: jsonBody({
          type: "object",
          required: ["flightNumber", "airlineIata", "origin", "destination", "scheduledDeparture", "scheduledArrival", "cabins"],
          properties: {
            flightNumber: { type: "string" },
            airlineIata: { type: "string" },
            origin: { type: "string" },
            destination: { type: "string" },
            scheduledDeparture: { type: "string", format: "date-time" },
            scheduledArrival: { type: "string", format: "date-time" },
            aircraftId: { type: "string", format: "uuid" },
            cabins: { type: "array", items: { type: "object", required: ["cabin", "totalSeats", "basePrice", "currency"], properties: { cabin: { type: "string", enum: ["ECONOMY", "BUSINESS", "FIRST"] }, totalSeats: { type: "integer" }, basePrice: { type: "string" }, currency: { type: "string" } } } },
          },
        }),
        responses: { "201": dataResponse("Created", "#/components/schemas/FlightSummary"), "400": errorResponse, "401": errorResponse, "403": errorResponse, "409": errorResponse },
      },
    },
    "/api/flights/{id}/status": {
      patch: {
        tags: ["Flights"],
        summary: "Set flight status (admin). CANCELLED cascades to active bookings (releases seats).",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: jsonBody({ type: "object", required: ["status"], properties: { status: { type: "string", enum: ["SCHEDULED", "DELAYED", "BOARDING", "DEPARTED", "ARRIVED", "CANCELLED"] } } }),
        responses: { "200": dataResponse("Updated", "#/components/schemas/FlightSummary"), "401": errorResponse, "403": errorResponse, "404": errorResponse },
      },
    },

    "/api/bookings": {
      post: {
        tags: ["Bookings"],
        summary: "Create a booking",
        security: bearer,
        parameters: [{ name: "Idempotency-Key", in: "header", required: false, schema: { type: "string" }, description: "Replaying with the same key returns the original booking." }],
        requestBody: jsonBody({
          type: "object",
          required: ["flightId", "cabin", "contactEmail", "passengers"],
          properties: {
            flightId: { type: "string", format: "uuid" },
            cabin: { type: "string", enum: ["ECONOMY", "BUSINESS", "FIRST"] },
            contactEmail: { type: "string", format: "email" },
            passengers: { type: "array", minItems: 1, items: { type: "object", required: ["firstName", "lastName", "dateOfBirth", "type"], properties: { firstName: { type: "string" }, lastName: { type: "string" }, dateOfBirth: { type: "string", format: "date" }, type: { type: "string", enum: ["ADULT", "CHILD", "INFANT"] }, passportNumber: { type: "string" } } } },
          },
        }),
        responses: { "201": dataResponse("Created", "#/components/schemas/Booking"), "200": dataResponse("Idempotent replay", "#/components/schemas/Booking"), "400": errorResponse, "401": errorResponse, "402": errorResponse, "409": errorResponse },
      },
      get: { tags: ["Bookings"], summary: "List bookings (own; admin sees all)", security: bearer, parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "pageSize", in: "query", schema: { type: "integer" } }], responses: { "200": listResponse("Bookings", "#/components/schemas/Booking"), "401": errorResponse } },
    },
    "/api/bookings/{reference}": {
      get: { tags: ["Bookings"], summary: "Get booking by PNR (owner or admin)", security: bearer, parameters: [{ name: "reference", in: "path", required: true, schema: { type: "string" } }], responses: { "200": dataResponse("Booking", "#/components/schemas/Booking"), "401": errorResponse, "404": errorResponse } },
    },
    "/api/bookings/{reference}/cancel": {
      post: { tags: ["Bookings"], summary: "Cancel a booking (owner or admin); releases seats", security: bearer, parameters: [{ name: "reference", in: "path", required: true, schema: { type: "string" } }], responses: { "200": dataResponse("Cancelled", "#/components/schemas/Booking"), "401": errorResponse, "404": errorResponse, "409": errorResponse } },
    },

    "/api/airports": {
      get: { tags: ["Reference"], summary: "List airports", parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "pageSize", in: "query", schema: { type: "integer" } }], responses: { "200": listResponse("Airports", "#/components/schemas/Airport") } },
      post: { tags: ["Reference"], summary: "Create airport (admin)", security: bearer, requestBody: jsonBody({ type: "object", required: ["iataCode", "name", "city", "country", "timezone"], properties: { iataCode: { type: "string" }, name: { type: "string" }, city: { type: "string" }, country: { type: "string" }, timezone: { type: "string" } } }), responses: { "201": dataResponse("Created", "#/components/schemas/Airport"), "400": errorResponse, "401": errorResponse, "403": errorResponse, "409": errorResponse } },
    },
    "/api/airports/{id}": {
      get: { tags: ["Reference"], summary: "Get airport", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": dataResponse("Airport", "#/components/schemas/Airport"), "404": errorResponse } },
      patch: { tags: ["Reference"], summary: "Update airport (admin)", security: bearer, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }], requestBody: jsonBody({ type: "object", properties: { name: { type: "string" }, city: { type: "string" }, country: { type: "string" }, timezone: { type: "string" } } }), responses: { "200": dataResponse("Updated", "#/components/schemas/Airport"), "401": errorResponse, "403": errorResponse, "404": errorResponse } },
      delete: { tags: ["Reference"], summary: "Delete airport (admin)", security: bearer, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }], responses: { "204": { description: "Deleted" }, "401": errorResponse, "403": errorResponse, "404": errorResponse, "409": errorResponse } },
    },
    "/api/airlines": {
      get: { tags: ["Reference"], summary: "List airlines", parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "pageSize", in: "query", schema: { type: "integer" } }], responses: { "200": listResponse("Airlines", "#/components/schemas/Airline") } },
      post: { tags: ["Reference"], summary: "Create airline (admin)", security: bearer, requestBody: jsonBody({ type: "object", required: ["iataCode", "name"], properties: { iataCode: { type: "string" }, name: { type: "string" } } }), responses: { "201": dataResponse("Created", "#/components/schemas/Airline"), "400": errorResponse, "401": errorResponse, "403": errorResponse, "409": errorResponse } },
    },
    "/api/airlines/{id}": {
      get: { tags: ["Reference"], summary: "Get airline", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": dataResponse("Airline", "#/components/schemas/Airline"), "404": errorResponse } },
      patch: { tags: ["Reference"], summary: "Update airline (admin)", security: bearer, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }], requestBody: jsonBody({ type: "object", properties: { name: { type: "string" } } }), responses: { "200": dataResponse("Updated", "#/components/schemas/Airline"), "401": errorResponse, "403": errorResponse, "404": errorResponse } },
      delete: { tags: ["Reference"], summary: "Delete airline (admin)", security: bearer, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }], responses: { "204": { description: "Deleted" }, "401": errorResponse, "403": errorResponse, "404": errorResponse, "409": errorResponse } },
    },
  },
};
