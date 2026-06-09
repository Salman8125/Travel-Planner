// Package httpapi is the thin HTTP layer: parse body -> call domain -> return JSON.
// Permissive CORS (dev only) so browser frontends on localhost can call cross-origin.
package httpapi

import (
	"encoding/json"
	"net/http"

	"github.com/travelplanner/weathervane/internal/domain"
)

type forecastRequest struct {
	City string `json:"city"`
	Days int    `json:"days"`
}

// NewMux wires the routes.
func NewMux() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/get_forecast", withCORS(getForecast))
	mux.HandleFunc("/health", withCORS(func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, map[string]string{"status": "ok"})
	}))
	return mux
}

// skill: get_forecast -> DailyForecast[] (plain array; no streaming).
func getForecast(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req forecastRequest
	if r.Body != nil {
		// Tolerate empty/missing body — defaults apply.
		_ = json.NewDecoder(r.Body).Decode(&req)
	}
	if req.Days == 0 {
		req.Days = 5
	}
	writeJSON(w, domain.GetForecast(req.City, req.Days))
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(v)
}

// withCORS adds permissive CORS headers and short-circuits the OPTIONS preflight.
func withCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next(w, r)
	}
}
