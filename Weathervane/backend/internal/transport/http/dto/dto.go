package dto

import "github.com/travelplanner/weathervane/internal/domain"

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type AuthResponse struct {
	Token string            `json:"token"`
	User  domain.PublicUser `json:"user"`
}

type CreateLocationRequest struct {
	Name      string  `json:"name" validate:"required"`
	City      string  `json:"city" validate:"required"`
	Country   string  `json:"country" validate:"required"`
	Latitude  float64 `json:"latitude" validate:"gte=-90,lte=90"`
	Longitude float64 `json:"longitude" validate:"gte=-180,lte=180"`
	Timezone  string  `json:"timezone" validate:"required"`
}

type UpdateLocationRequest struct {
	Name      *string  `json:"name"`
	City      *string  `json:"city"`
	Country   *string  `json:"country"`
	Latitude  *float64 `json:"latitude" validate:"omitempty,gte=-90,lte=90"`
	Longitude *float64 `json:"longitude" validate:"omitempty,gte=-180,lte=180"`
	Timezone  *string  `json:"timezone"`
}

type UpsertForecastRequest struct {
	Date                string   `json:"date" validate:"required"`
	High                float64  `json:"high"`
	Low                 float64  `json:"low"`
	Condition           string   `json:"condition" validate:"required"`
	PrecipitationChance *int     `json:"precipitationChance" validate:"omitempty,gte=0,lte=100"`
	Humidity            *int     `json:"humidity" validate:"omitempty,gte=0,lte=100"`
	WindKph             *float64 `json:"windKph" validate:"omitempty,gte=0"`
}

type UpsertCurrentRequest struct {
	TempC     float64  `json:"tempC"`
	Condition string   `json:"condition" validate:"required"`
	Humidity  *int     `json:"humidity" validate:"omitempty,gte=0,lte=100"`
	WindKph   *float64 `json:"windKph" validate:"omitempty,gte=0"`
}
