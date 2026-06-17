namespace TripWeaver.Common.Errors;

public enum ErrorCode
{
    ValidationError,
    Unauthorized,
    Forbidden,
    NotFound,
    Conflict,
    Throttled,
    InternalError,
}

public static class ErrorCodeExtensions
{
    public static string Code(this ErrorCode code) => code switch
    {
        ErrorCode.ValidationError => "validation_error",
        ErrorCode.Unauthorized => "unauthorized",
        ErrorCode.Forbidden => "forbidden",
        ErrorCode.NotFound => "not_found",
        ErrorCode.Conflict => "conflict",
        ErrorCode.Throttled => "throttled",
        _ => "internal_error",
    };

    public static int Status(this ErrorCode code) => code switch
    {
        ErrorCode.ValidationError => StatusCodes.Status400BadRequest,
        ErrorCode.Unauthorized => StatusCodes.Status401Unauthorized,
        ErrorCode.Forbidden => StatusCodes.Status403Forbidden,
        ErrorCode.NotFound => StatusCodes.Status404NotFound,
        ErrorCode.Conflict => StatusCodes.Status409Conflict,
        ErrorCode.Throttled => StatusCodes.Status429TooManyRequests,
        _ => StatusCodes.Status500InternalServerError,
    };
}
