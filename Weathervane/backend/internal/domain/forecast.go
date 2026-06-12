package domain

import "time"

const MaxForecastSpanDays = 16

type Condition string

const (
	ConditionSunny        Condition = "SUNNY"
	ConditionCloudy       Condition = "CLOUDY"
	ConditionPartlyCloudy Condition = "PARTLY_CLOUDY"
	ConditionRainy        Condition = "RAINY"
	ConditionSnowy        Condition = "SNOWY"
	ConditionWindy        Condition = "WINDY"
	ConditionFoggy        Condition = "FOGGY"
	ConditionStormy       Condition = "STORMY"
)

var validConditions = map[Condition]bool{
	ConditionSunny:        true,
	ConditionCloudy:       true,
	ConditionPartlyCloudy: true,
	ConditionRainy:        true,
	ConditionSnowy:        true,
	ConditionWindy:        true,
	ConditionFoggy:        true,
	ConditionStormy:       true,
}

func (c Condition) Valid() bool { return validConditions[c] }

type DailyForecast struct {
	Date                string    `json:"date"`
	High                float64   `json:"high"`
	Low                 float64   `json:"low"`
	Condition           Condition `json:"condition"`
	PrecipitationChance *int      `json:"precipitationChance,omitempty"`
	Humidity            *int      `json:"humidity,omitempty"`
	WindKph             *float64  `json:"windKph,omitempty"`
}

type CurrentWeather struct {
	LocationID string    `json:"locationId"`
	TempC      float64   `json:"tempC"`
	Condition  Condition `json:"condition"`
	Humidity   *int      `json:"humidity,omitempty"`
	WindKph    *float64  `json:"windKph,omitempty"`
	ObservedAt time.Time `json:"observedAt"`
}
