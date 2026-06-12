package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/travelplanner/weathervane/internal/domain"
	"github.com/travelplanner/weathervane/internal/location"
	"github.com/travelplanner/weathervane/internal/transport/http/dto"
	"github.com/travelplanner/weathervane/internal/transport/http/httperr"
	"github.com/travelplanner/weathervane/internal/transport/http/respond"
)

type LocationHandler struct {
	svc *location.Service
}

func NewLocationHandler(svc *location.Service) *LocationHandler {
	return &LocationHandler{svc: svc}
}

func (h *LocationHandler) MountPublic(r chi.Router) {
	r.Get("/locations", h.List)
	r.Get("/locations/{id}", h.Get)
}

func (h *LocationHandler) MountAdmin(r chi.Router) {
	r.Post("/locations", h.Create)
	r.Patch("/locations/{id}", h.Update)
	r.Delete("/locations/{id}", h.Delete)
}

func (h *LocationHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	res, err := h.svc.List(
		r.Context(),
		queryPtr(r, "q"),
		queryPtr(r, "country"),
		atoiDefault(q.Get("page"), 1),
		atoiDefault(q.Get("pageSize"), 20),
	)
	if err != nil {
		httperr.Write(w, r, err)
		return
	}
	respond.List(w, http.StatusOK, res.Items, res.Meta)
}

func (h *LocationHandler) Get(w http.ResponseWriter, r *http.Request) {
	loc, err := h.svc.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		httperr.Write(w, r, err)
		return
	}
	respond.JSON(w, http.StatusOK, loc)
}

func (h *LocationHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateLocationRequest
	if err := decode(r, &req); err != nil {
		httperr.Write(w, r, err)
		return
	}
	if err := dto.Validate(req); err != nil {
		httperr.Write(w, r, err)
		return
	}
	loc, err := h.svc.Create(r.Context(), domain.Location{
		Name:      req.Name,
		City:      req.City,
		Country:   req.Country,
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
		Timezone:  req.Timezone,
	})
	if err != nil {
		httperr.Write(w, r, err)
		return
	}
	respond.JSON(w, http.StatusCreated, loc)
}

func (h *LocationHandler) Update(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateLocationRequest
	if err := decode(r, &req); err != nil {
		httperr.Write(w, r, err)
		return
	}
	if err := dto.Validate(req); err != nil {
		httperr.Write(w, r, err)
		return
	}
	loc, err := h.svc.Update(r.Context(), chi.URLParam(r, "id"), location.UpdateInput{
		Name:      req.Name,
		City:      req.City,
		Country:   req.Country,
		Timezone:  req.Timezone,
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
	})
	if err != nil {
		httperr.Write(w, r, err)
		return
	}
	respond.JSON(w, http.StatusOK, loc)
}

func (h *LocationHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		httperr.Write(w, r, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
