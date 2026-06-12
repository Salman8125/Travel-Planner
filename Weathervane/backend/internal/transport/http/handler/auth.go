package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/travelplanner/weathervane/internal/auth"
	"github.com/travelplanner/weathervane/internal/domain"
	"github.com/travelplanner/weathervane/internal/transport/http/dto"
	"github.com/travelplanner/weathervane/internal/transport/http/httpctx"
	"github.com/travelplanner/weathervane/internal/transport/http/httperr"
	"github.com/travelplanner/weathervane/internal/transport/http/respond"
)

type AuthHandler struct {
	svc *auth.Service
}

func NewAuthHandler(svc *auth.Service) *AuthHandler {
	return &AuthHandler{svc: svc}
}

func (h *AuthHandler) MountPublic(r chi.Router) {
	r.Post("/auth/register", h.Register)
	r.Post("/auth/login", h.Login)
}

func (h *AuthHandler) MountAuthed(r chi.Router) {
	r.Get("/auth/me", h.Me)
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req dto.RegisterRequest
	if err := decode(r, &req); err != nil {
		httperr.Write(w, r, err)
		return
	}
	if err := dto.Validate(req); err != nil {
		httperr.Write(w, r, err)
		return
	}
	res, err := h.svc.Register(r.Context(), req.Email, req.Password)
	if err != nil {
		httperr.Write(w, r, err)
		return
	}
	respond.JSON(w, http.StatusCreated, authResponse(res))
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if err := decode(r, &req); err != nil {
		httperr.Write(w, r, err)
		return
	}
	if err := dto.Validate(req); err != nil {
		httperr.Write(w, r, err)
		return
	}
	res, err := h.svc.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		httperr.Write(w, r, err)
		return
	}
	respond.JSON(w, http.StatusOK, authResponse(res))
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	u, ok := httpctx.UserFrom(r.Context())
	if !ok {
		httperr.Write(w, r, domain.ErrUnauthorized)
		return
	}
	user, err := h.svc.Me(r.Context(), u.ID)
	if err != nil {
		httperr.Write(w, r, err)
		return
	}
	respond.JSON(w, http.StatusOK, user.Public())
}

func authResponse(res auth.Result) dto.AuthResponse {
	return dto.AuthResponse{Token: res.Token, User: res.User.Public()}
}
