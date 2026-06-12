package httperr

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/travelplanner/weathervane/internal/domain"
)

type genericError struct{}

func (genericError) Error() string { return "boom" }

func TestWrite_mapping(t *testing.T) {
	cases := []struct {
		name       string
		err        error
		wantStatus int
		wantCode   string
	}{
		{"not found", domain.ErrNotFound, 404, "not_found"},
		{"conflict", domain.ErrConflict, 409, "conflict"},
		{"ambiguous", domain.ErrAmbiguous, 409, "conflict"},
		{"unauthorized", domain.ErrUnauthorized, 401, "unauthorized"},
		{"forbidden", domain.ErrForbidden, 403, "forbidden"},
		{"validation", domain.NewValidationError("bad", map[string]string{"x": "y"}), 400, "validation_error"},
		{"deadline", context.DeadlineExceeded, 503, "timeout"},
		{"canceled", context.Canceled, 503, "timeout"},
		{"unknown", genericError{}, 500, "internal_error"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			rec := httptest.NewRecorder()
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			Write(rec, req, c.err)
			assert.Equal(t, c.wantStatus, rec.Code)
			var body map[string]map[string]any
			require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &body))
			assert.Equal(t, c.wantCode, body["error"]["code"])
			_, hasReqID := body["error"]["requestId"]
			assert.True(t, hasReqID)
		})
	}
}
