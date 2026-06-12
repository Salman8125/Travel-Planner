//go:build integration

package integration

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMetrics_exposed(t *testing.T) {
	doRequest(t, http.MethodGet, "/health", "", nil)
	doRequest(t, http.MethodGet, "/api/locations?q=Istanbul", "", nil)

	resp, data := doRequest(t, http.MethodGet, "/metrics", "", nil)
	require.Equal(t, http.StatusOK, resp.StatusCode)
	body := string(data)
	assert.Contains(t, body, "http_requests_total")
	assert.Contains(t, body, "http_request_duration_seconds")
}
