FROM golang:1.25 AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/api ./cmd/api

FROM gcr.io/distroless/static-debian12 AS runtime
COPY --from=build /out/api /api
EXPOSE 8080
ENTRYPOINT ["/api"]
