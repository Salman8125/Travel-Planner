package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/travelplanner/weathervane/internal/domain"
	"github.com/travelplanner/weathervane/internal/forecast"
	"github.com/travelplanner/weathervane/internal/transport/http/dto"
	"github.com/travelplanner/weathervane/internal/transport/http/httperr"
	"github.com/travelplanner/weathervane/internal/transport/http/respond"
)

type ForecastHandler struct {
	svc *forecast.Service
}

func NewForecastHandler(svc *forecast.Service) *ForecastHandler {
	return &ForecastHandler{svc: svc}
}

func (h *ForecastHandler) MountPublic(r chi.Router) {
	r.Get("/forecast", h.GetForecast)
	r.Get("/forecast/stream", h.StreamForecast)
	r.Get("/weather/current", h.GetCurrent)
}

func (h *ForecastHandler) MountAdmin(r chi.Router) {
	r.Put("/locations/{id}/forecast", h.UpsertForecast)
	r.Put("/locations/{id}/current", h.UpsertCurrent)
}

func (h *ForecastHandler) GetForecast(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	items, err := h.svc.GetRange(r.Context(), forecast.RangeQuery{
		LocationID: q.Get("locationId"),
		City:       q.Get("city"),
		Country:    queryPtr(r, "country"),
		Start:      q.Get("startDate"),
		End:        q.Get("endDate"),
	})
	if err != nil {
		httperr.Write(w, r, err)
		return
	}
	respond.JSON(w, http.StatusOK, items)
}

func (h *ForecastHandler) UpsertForecast(w http.ResponseWriter, r *http.Request) {
	var req dto.UpsertForecastRequest
	if err := decode(r, &req); err != nil {
		httperr.Write(w, r, err)
		return
	}
	if err := dto.Validate(req); err != nil {
		httperr.Write(w, r, err)
		return
	}
	out, err := h.svc.UpsertForecast(r.Context(), chi.URLParam(r, "id"), domain.DailyForecast{
		Date:                req.Date,
		High:                req.High,
		Low:                 req.Low,
		Condition:           domain.Condition(req.Condition),
		PrecipitationChance: req.PrecipitationChance,
		Humidity:            req.Humidity,
		WindKph:             req.WindKph,
	})
	if err != nil {
		httperr.Write(w, r, err)
		return
	}
	respond.JSON(w, http.StatusOK, out)
}

func (h *ForecastHandler) StreamForecast(w http.ResponseWriter, r *http.Request) {
	httperr.WriteCode(w, r, http.StatusNotImplemented, "not_implemented",
		"Streaming forecast is not implemented in the REST backend")
}

func (h *ForecastHandler) GetCurrent(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	cur, err := h.svc.GetCurrent(r.Context(), q.Get("locationId"), q.Get("city"), queryPtr(r, "country"))
	if err != nil {
		httperr.Write(w, r, err)
		return
	}
	respond.JSON(w, http.StatusOK, cur)
}

func (h *ForecastHandler) UpsertCurrent(w http.ResponseWriter, r *http.Request) {
	var req dto.UpsertCurrentRequest
	if err := decode(r, &req); err != nil {
		httperr.Write(w, r, err)
		return
	}
	if err := dto.Validate(req); err != nil {
		httperr.Write(w, r, err)
		return
	}
	out, err := h.svc.UpsertCurrent(r.Context(), chi.URLParam(r, "id"), domain.CurrentWeather{
		TempC:     req.TempC,
		Condition: domain.Condition(req.Condition),
		Humidity:  req.Humidity,
		WindKph:   req.WindKph,
	})
	if err != nil {
		httperr.Write(w, r, err)
		return
	}
	respond.JSON(w, http.StatusOK, out)
}
