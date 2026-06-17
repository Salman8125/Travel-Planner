using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TripWeaver.Common.Web;

namespace TripWeaver.Common.Errors;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken ct)
    {
        var requestId = context.RequestId();
        var (status, code, message, details) = Map(exception);

        if (status >= StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Unhandled exception ({Code}) requestId={RequestId}", code, requestId);
        }

        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";
        context.Response.Headers[RequestIdMiddleware.HeaderName] = requestId;
        await context.Response.WriteAsJsonAsync(
            ErrorResponse.Of(code, message, details, requestId), Json, ct);
        return true;
    }

    private static (int Status, string Code, string Message, IReadOnlyDictionary<string, string>? Details) Map(
        Exception exception) => exception switch
    {
        DomainException d => (d.Code.Status(), d.Code.Code(), d.Message, d.Details),
        FluentValidation.ValidationException fv => (
            ErrorCode.ValidationError.Status(),
            ErrorCode.ValidationError.Code(),
            "Request validation failed",
            fv.Errors
                .GroupBy(e => ToCamel(e.PropertyName))
                .ToDictionary(g => g.Key, g => g.First().ErrorMessage)),
        DbUpdateConcurrencyException => (
            ErrorCode.Conflict.Status(),
            ErrorCode.Conflict.Code(),
            "The resource was modified by another request. Reload and retry.",
            null),
        DbUpdateException { InnerException: PostgresException pg } => MapPostgres(pg),
        BadHttpRequestException => (
            ErrorCode.ValidationError.Status(),
            ErrorCode.ValidationError.Code(),
            "Malformed or missing request body.",
            null),
        JsonException => (
            ErrorCode.ValidationError.Status(),
            ErrorCode.ValidationError.Code(),
            "Malformed or missing request body.",
            null),
        _ => (
            ErrorCode.InternalError.Status(),
            ErrorCode.InternalError.Code(),
            "An internal error occurred.",
            null),
    };

    private static (int, string, string, IReadOnlyDictionary<string, string>?) MapPostgres(PostgresException pg) =>
        pg.SqlState switch
        {
            PostgresErrorCodes.UniqueViolation => (
                ErrorCode.Conflict.Status(), ErrorCode.Conflict.Code(),
                "A resource with the same unique value already exists.", null),
            PostgresErrorCodes.ForeignKeyViolation => (
                ErrorCode.Conflict.Status(), ErrorCode.Conflict.Code(),
                "The operation violates a reference constraint.", null),
            PostgresErrorCodes.NotNullViolation or PostgresErrorCodes.StringDataRightTruncation => (
                ErrorCode.ValidationError.Status(), ErrorCode.ValidationError.Code(),
                "A required field is missing or too long.", null),
            _ => (
                ErrorCode.InternalError.Status(), ErrorCode.InternalError.Code(),
                "A database error occurred.", null),
        };

    private static string ToCamel(string name) =>
        string.Join('.', name.Split('.')
            .Select(part => part.Length == 0 ? part : char.ToLowerInvariant(part[0]) + part[1..]));
}
