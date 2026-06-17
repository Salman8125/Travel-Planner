using FluentValidation;
using TripWeaver.Features.Itineraries.Dtos;

namespace TripWeaver.Features.Itineraries.Validators;

public sealed class FlightInputValidator : AbstractValidator<FlightInput>
{
    public FlightInputValidator()
    {
        RuleFor(x => x.FlightId).NotEmpty();
        RuleFor(x => x.Airline).NotEmpty();
        RuleFor(x => x.Origin).NotEmpty();
        RuleFor(x => x.Destination).NotEmpty();
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.Stops).GreaterThanOrEqualTo(0);
    }
}

public sealed class HotelInputValidator : AbstractValidator<HotelInput>
{
    public HotelInputValidator()
    {
        RuleFor(x => x.HotelId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.StarRating).InclusiveBetween(1, 5);
        RuleFor(x => x.PricePerNight).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TotalPrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
    }
}

public sealed class BudgetInputValidator : AbstractValidator<BudgetInput>
{
    public BudgetInputValidator()
    {
        RuleFor(x => x.TotalBudget).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Spent).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
    }
}

public sealed class ForecastInputValidator : AbstractValidator<ForecastInput>
{
    public ForecastInputValidator()
    {
        RuleFor(x => x.Condition).NotEmpty().MaximumLength(32);
    }
}

public sealed class BuildItineraryRequestValidator : AbstractValidator<BuildItineraryRequest>
{
    public BuildItineraryRequestValidator()
    {
        RuleFor(x => x.Title).MaximumLength(200);
        RuleFor(x => x.Destination).MaximumLength(200);

        RuleFor(x => x.Flight).NotNull();
        When(x => x.Flight is not null, () => RuleFor(x => x.Flight).SetValidator(new FlightInputValidator()));

        RuleFor(x => x.Hotel).NotNull();
        When(x => x.Hotel is not null, () => RuleFor(x => x.Hotel).SetValidator(new HotelInputValidator()));

        RuleFor(x => x.Budget).NotNull();
        When(x => x.Budget is not null, () => RuleFor(x => x.Budget).SetValidator(new BudgetInputValidator()));

        RuleFor(x => x.Weather).NotNull();
        RuleForEach(x => x.Weather).SetValidator(new ForecastInputValidator());
    }
}

public sealed class UpdateActivityInputValidator : AbstractValidator<UpdateActivityInput>
{
    public UpdateActivityInputValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.EstimatedCost).GreaterThanOrEqualTo(0).When(x => x.EstimatedCost.HasValue);
    }
}

public sealed class UpdateDayInputValidator : AbstractValidator<UpdateDayInput>
{
    public UpdateDayInputValidator()
    {
        RuleFor(x => x.DayNumber).GreaterThan(0);
        RuleForEach(x => x.Activities).SetValidator(new UpdateActivityInputValidator())
            .When(x => x.Activities is not null);
    }
}

public sealed class UpdateItineraryRequestValidator : AbstractValidator<UpdateItineraryRequest>
{
    public UpdateItineraryRequestValidator()
    {
        RuleFor(x => x.Title).MaximumLength(200);
        RuleForEach(x => x.Days).SetValidator(new UpdateDayInputValidator()).When(x => x.Days is not null);
    }
}
