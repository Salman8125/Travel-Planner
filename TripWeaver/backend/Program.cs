using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using TripWeaver.Common.Errors;
using TripWeaver.Common.Security;
using TripWeaver.Common.Web;
using TripWeaver.Features.Auth;
using TripWeaver.Features.Itineraries;
using TripWeaver.Infrastructure.Persistence;
using TripWeaver.Infrastructure.Seeding;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole(options =>
{
    options.IncludeScopes = true;
    options.JsonWriterOptions = new JsonWriterOptions { Indented = false };
});

builder.Services.AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();
builder.Services.Configure<SeedOptions>(builder.Configuration.GetSection(SeedOptions.SectionName));
builder.Services.Configure<TripOptions>(builder.Configuration.GetSection(TripOptions.SectionName));

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("ConnectionStrings:Default is required.");
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddScoped<DbInitializer>();
builder.Services.AddScoped<DataSeeder>();

var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret is required.");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            RoleClaimType = "role",
            NameClaimType = "sub",
        };
        options.Events = new JwtBearerEvents
        {
            OnChallenge = async ctx =>
            {
                ctx.HandleResponse();
                await SecurityErrorWriter.WriteAsync(
                    ctx.HttpContext, ErrorCode.Unauthorized, "Authentication required or invalid token.");
            },
            OnForbidden = ctx => SecurityErrorWriter.WriteAsync(
                ctx.HttpContext, ErrorCode.Forbidden, "You do not have permission to perform this action."),
        };
    });
builder.Services.AddAuthorizationBuilder()
    .AddPolicy(Policies.AdminOnly, policy => policy.RequireRole("ADMIN"));

builder.Services.AddScoped<ICurrentUser, CurrentUser>();
builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<ItineraryAssembler>();
builder.Services.AddSingleton<BudgetReconciler>();
builder.Services.AddSingleton<ReferenceGenerator>();
builder.Services.AddScoped<ItineraryValidator>();
builder.Services.AddScoped<ItineraryService>();

var corsOrigins = builder.Configuration.GetSection($"{CorsOptions.SectionName}:Origins").Get<string[]>() ?? [];
const string CorsPolicy = "default";
builder.Services.AddCors(options => options.AddPolicy(CorsPolicy, policy =>
{
    if (corsOrigins.Length == 0)
    {
        policy.AllowAnyOrigin();
    }
    else
    {
        policy.WithOrigins(corsOrigins);
    }
    policy.WithMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS")
        .WithHeaders("Authorization", "Content-Type", "Idempotency-Key", "If-Match", "X-Request-Id")
        .WithExposedHeaders("X-Request-Id", "ETag");
}));

var rateLimit = builder.Configuration.GetSection(RateLimitOptions.SectionName).Get<RateLimitOptions>() ?? new RateLimitOptions();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, _) =>
        await SecurityErrorWriter.WriteAsync(context.HttpContext, ErrorCode.Throttled, "Too many requests. Please slow down.");
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = rateLimit.PermitPerMinute, Window = TimeSpan.FromMinutes(1) }));
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = rateLimit.AuthPermitPerMinute, Window = TimeSpan.FromMinutes(1) }));
});

builder.Services.AddOpenApi();

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddControllers(options => options.Filters.Add<ValidationFilter>())
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

var app = builder.Build();

app.UseExceptionHandler();
app.UseMiddleware<RequestIdMiddleware>();
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseCors(CorsPolicy);
app.MapOpenApi();
app.MapScalarApiReference("/docs", options =>
    options.WithTitle("TripWeaver API").WithOpenApiRoutePattern("/openapi/v1.json"));
app.UseAuthentication();
app.UseAuthorization();
if (rateLimit.Enabled)
{
    app.UseRateLimiter();
}

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/health/ready", async (AppDbContext db) =>
    await db.Database.CanConnectAsync()
        ? Results.Ok(new { status = "ready", db = "up" })
        : Results.Json(new { status = "unavailable", db = "down" }, statusCode: StatusCodes.Status503ServiceUnavailable));

using (var scope = app.Services.CreateScope())
{
    var sp = scope.ServiceProvider;
    await sp.GetRequiredService<DbInitializer>().MigrateAsync();
    if (sp.GetRequiredService<IOptions<SeedOptions>>().Value.Enabled)
    {
        await sp.GetRequiredService<DataSeeder>().SeedAsync();
    }
}

app.Run();

public partial class Program;
