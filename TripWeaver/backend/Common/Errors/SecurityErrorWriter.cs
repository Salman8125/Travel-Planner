using System.Text.Json;
using TripWeaver.Common.Web;

namespace TripWeaver.Common.Errors;

public static class SecurityErrorWriter
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public static async Task WriteAsync(HttpContext context, ErrorCode code, string message)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        var requestId = context.RequestId();
        context.Response.StatusCode = code.Status();
        context.Response.ContentType = "application/json";
        context.Response.Headers[RequestIdMiddleware.HeaderName] = requestId;
        await context.Response.WriteAsJsonAsync(
            ErrorResponse.Of(code.Code(), message, null, requestId), Json);
    }
}
