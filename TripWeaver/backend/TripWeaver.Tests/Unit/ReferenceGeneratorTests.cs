using FluentAssertions;
using TripWeaver.Features.Itineraries;

namespace TripWeaver.Tests.Unit;

public sealed class ReferenceGeneratorTests
{
    private const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    [Fact]
    public void Produces_six_character_codes_from_the_unambiguous_alphabet()
    {
        var generator = new ReferenceGenerator();

        for (var i = 0; i < 500; i++)
        {
            var reference = generator.Next();
            reference.Should().HaveLength(6);
            reference.ToCharArray().Should().OnlyContain(c => Alphabet.Contains(c));
        }
    }

    [Fact]
    public void Is_highly_likely_to_be_unique()
    {
        var generator = new ReferenceGenerator();
        var seen = Enumerable.Range(0, 1000).Select(_ => generator.Next()).ToHashSet();

        seen.Count.Should().BeGreaterThan(990);
    }
}
