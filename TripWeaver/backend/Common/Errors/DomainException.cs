namespace TripWeaver.Common.Errors;

public abstract class DomainException : Exception
{
    public ErrorCode Code { get; }
    public IReadOnlyDictionary<string, string>? Details { get; }

    protected DomainException(ErrorCode code, string message, IReadOnlyDictionary<string, string>? details = null)
        : base(message)
    {
        Code = code;
        Details = details;
    }
}

public sealed class NotFoundException(string message) : DomainException(ErrorCode.NotFound, message);

public sealed class ConflictException(string message, IReadOnlyDictionary<string, string>? details = null)
    : DomainException(ErrorCode.Conflict, message, details);

public sealed class ValidationException(string message, IReadOnlyDictionary<string, string>? details = null)
    : DomainException(ErrorCode.ValidationError, message, details)
{
    public ValidationException(string field, string error)
        : this("Request validation failed", new Dictionary<string, string> { [field] = error })
    {
    }
}

public sealed class UnauthorizedException(string message = "Authentication required or invalid credentials")
    : DomainException(ErrorCode.Unauthorized, message);

public sealed class ForbiddenException(string message = "You do not have permission to perform this action")
    : DomainException(ErrorCode.Forbidden, message);
