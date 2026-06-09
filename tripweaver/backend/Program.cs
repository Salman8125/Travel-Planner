using TripWeaver.Domain;

// HTTP layer — thin minimal API. Parse body -> call domain -> return JSON.
var builder = WebApplication.CreateBuilder(args);

// Permissive CORS (dev only) so browser frontends on localhost can call cross-origin.
const string DevCors = "dev-cors";
builder.Services.AddCors(options =>
    options.AddPolicy(DevCors, p => p
        .AllowAnyOrigin()
        .WithMethods("POST", "GET", "OPTIONS")
        .WithHeaders("Content-Type")));

var app = builder.Build();
app.UseCors(DevCors);

// skill: build_itinerary -> itinerary object (synchronous; composes the four inputs).
app.MapPost("/build_itinerary", (BuildRequest req) => Results.Ok(ItineraryBuilder.Build(req)));

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
