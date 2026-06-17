using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;
using DomainValidationException = TripWeaver.Common.Errors.ValidationException;

namespace TripWeaver.Common.Web;

public sealed class ValidationFilter(IServiceProvider services) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument is null)
            {
                continue;
            }

            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            if (services.GetService(validatorType) is not IValidator validator)
            {
                continue;
            }

            var result = await validator.ValidateAsync(new ValidationContext<object>(argument));
            if (!result.IsValid)
            {
                var details = result.Errors
                    .GroupBy(e => ToCamel(e.PropertyName))
                    .ToDictionary(g => g.Key, g => g.First().ErrorMessage);
                throw new DomainValidationException("Request validation failed", details);
            }
        }

        await next();
    }

    private static string ToCamel(string name) =>
        string.Join('.', name.Split('.')
            .Select(part => part.Length == 0 ? part : char.ToLowerInvariant(part[0]) + part[1..]));
}
