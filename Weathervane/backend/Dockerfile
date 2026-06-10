# Multi-stage: build a static binary, run on distroless (near-scratch + CA certs).
FROM golang:1.23-alpine AS build
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
# CGO_ENABLED=0 is required for a static binary that runs on distroless/static.
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/server ./cmd/server

FROM gcr.io/distroless/static-debian12 AS runtime
COPY --from=build /out/server /server
EXPOSE 4004
ENTRYPOINT ["/server"]
