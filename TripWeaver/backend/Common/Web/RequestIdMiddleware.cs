namespace TripWeaver.Common.Web;

public sealed class RequestIdMiddleware(RequestDelegate next, ILogger<RequestIdMiddleware> logger)
{
    public const string HeaderName = "X-Request-Id";
    public const string ItemKey = "RequestId";

    public async Task InvokeAsync(HttpContext context)
    {
        var incoming = context.Request.Headers[HeaderName].ToString();
        var requestId = string.IsNullOrWhiteSpace(incoming) ? Guid.NewGuid().ToString() : incoming;
        context.Items[ItemKey] = requestId;

        context.Response.OnStarting(() =>
        {
            context.Response.Headers[HeaderName] = requestId;
            return Task.CompletedTask;
        });

        using (logger.BeginScope(new Dictionary<string, object> { ["requestId"] = requestId }))
        {
            await next(context);
        }
    }
}

public static class RequestIdHttpContextExtensions
{
    public static string RequestId(this HttpContext context) =>
        context.Items.TryGetValue(RequestIdMiddleware.ItemKey, out var value) && value is string id
            ? id
            : string.Empty;
}
