package respond

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

func encode(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(body); err != nil {
		slog.Error("failed to encode response", "error", err)
	}
}

func JSON(w http.ResponseWriter, status int, data any) {
	encode(w, status, map[string]any{"data": data})
}

func List(w http.ResponseWriter, status int, data any, meta any) {
	encode(w, status, map[string]any{"data": data, "meta": meta})
}

func Raw(w http.ResponseWriter, status int, body any) {
	encode(w, status, body)
}
