# Multi-stage: publish with the .NET 10 SDK, run on the slim ASP.NET runtime.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY TripWeaver.csproj ./
RUN dotnet restore TripWeaver.csproj
COPY . .
RUN dotnet publish TripWeaver.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=build /app .
# The .NET 8+ images run as a non-root user and default to :8080 — keep that.
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=10 \
    CMD curl -fsS http://localhost:8080/health/ready || exit 1
ENTRYPOINT ["dotnet", "TripWeaver.dll"]
