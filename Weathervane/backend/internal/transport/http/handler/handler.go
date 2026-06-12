package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/travelplanner/weathervane/internal/domain"
)

type Pinger interface {
	Ping(ctx context.Context) error
}

func decode(r *http.Request, dst any) error {
	if err := json.NewDecoder(r.Body).Decode(dst); err != nil {
		return domain.NewValidationError("invalid JSON body", nil)
	}
	return nil
}

func queryPtr(r *http.Request, key string) *string {
	v := r.URL.Query().Get(key)
	if v == "" {
		return nil
	}
	return &v
}

func atoiDefault(s string, def int) int {
	if s == "" {
		return def
	}
	if n, err := strconv.Atoi(s); err == nil {
		return n
	}
	return def
}
