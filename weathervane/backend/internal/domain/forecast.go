// Package domain holds pure business logic for the weather product.
// MUST NOT touch HTTP. A later A2A phase wraps GetForecast directly.
package domain

import "strings"

// DailyForecast is the domain output shape. Temperatures are in degrees Celsius.
type DailyForecast struct {
	Date      string  `json:"date"`      // YYYY-MM-DD
	High      float64 `json:"high"`      // °C
	Low       float64 `json:"low"`       // °C
	Condition string  `json:"condition"` // e.g. Sunny, Cloudy, Rain
}

// Hardcoded mock data per city. Zero external API calls.
var forecasts = map[string][]DailyForecast{
	"london": {
		{Date: "2026-07-01", High: 24, Low: 15, Condition: "Sunny"},
		{Date: "2026-07-02", High: 21, Low: 14, Condition: "Cloudy"},
		{Date: "2026-07-03", High: 19, Low: 13, Condition: "Rain"},
		{Date: "2026-07-04", High: 22, Low: 14, Condition: "Partly Cloudy"},
		{Date: "2026-07-05", High: 25, Low: 16, Condition: "Sunny"},
	},
	"tokyo": {
		{Date: "2026-07-01", High: 30, Low: 24, Condition: "Humid"},
		{Date: "2026-07-02", High: 31, Low: 25, Condition: "Thunderstorm"},
		{Date: "2026-07-03", High: 29, Low: 24, Condition: "Cloudy"},
		{Date: "2026-07-04", High: 32, Low: 26, Condition: "Sunny"},
		{Date: "2026-07-05", High: 30, Low: 25, Condition: "Rain"},
	},
}

const defaultCity = "london"

// GetForecast returns up to `days` forecast entries for a city.
// Empty city -> a default city. days < 1 -> 1; days is clamped to the available range.
func GetForecast(city string, days int) []DailyForecast {
	key := strings.ToLower(strings.TrimSpace(city))
	data, ok := forecasts[key]
	if !ok {
		data = forecasts[defaultCity]
	}
	if days < 1 {
		days = 1
	}
	if days > len(data) {
		days = len(data)
	}
	return data[:days]
}
