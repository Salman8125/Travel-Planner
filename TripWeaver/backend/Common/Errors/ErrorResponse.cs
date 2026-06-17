using System.Text.Json.Serialization;

namespace TripWeaver.Common.Errors;

public sealed record ErrorResponse(ErrorBody Error)
{
    public static ErrorResponse Of(
        string code,
        string message,
        IReadOnlyDictionary<string, string>? details,
        string? requestId) =>
        new(new ErrorBody(code, message, details is { Count: > 0 } ? details : null, requestId));
}

public sealed record ErrorBody(
    string Code,
    string Message,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    IReadOnlyDictionary<string, string>? Details,
    string? RequestId);
