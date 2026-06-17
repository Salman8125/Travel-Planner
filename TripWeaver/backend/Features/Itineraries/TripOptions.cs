namespace TripWeaver.Features.Itineraries;

public sealed class TripOptions
{
    public const string SectionName = "Trip";
    public int MaxTripDays { get; set; } = 30;
    public string DefaultCurrency { get; set; } = "USD";
}
