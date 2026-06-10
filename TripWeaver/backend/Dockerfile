# Multi-stage: publish with the SDK, run on the slim ASP.NET runtime.
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY *.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app
COPY --from=build /app .
# Bind 0.0.0.0:4005 explicitly (the image otherwise defaults to port 8080).
ENV ASPNETCORE_URLS=http://0.0.0.0:4005
EXPOSE 4005
ENTRYPOINT ["dotnet", "TripWeaver.dll"]
