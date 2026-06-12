//go:build integration

package integration

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestLocations_listAndGet(t *testing.T) {
	resp, data := doRequest(t, http.MethodGet, "/api/locations?q=Ist&pageSize=5", "", nil)
	require.Equal(t, http.StatusOK, resp.StatusCode, string(data))
	var out struct {
		Data []map[string]any `json:"data"`
		Meta map[string]any   `json:"meta"`
	}
	require.NoError(t, json.Unmarshal(data, &out))
	require.NotEmpty(t, out.Data)
	assert.Equal(t, "Istanbul", out.Data[0]["city"])
	require.NotNil(t, out.Meta["totalPages"])

	id := out.Data[0]["id"].(string)
	resp2, data2 := doRequest(t, http.MethodGet, "/api/locations/"+id, "", nil)
	assert.Equal(t, http.StatusOK, resp2.StatusCode, string(data2))
}

func TestLocations_getUnknown404(t *testing.T) {
	resp, _ := doRequest(t, http.MethodGet, "/api/locations/00000000-0000-0000-0000-000000000000", "", nil)
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestLocations_adminCreateThenAmbiguousCity(t *testing.T) {
	token := adminToken(t)
	resp, data := doRequest(t, http.MethodPost, "/api/locations", token, map[string]any{
		"name": "London", "city": "London", "country": "US",
		"latitude": 39.8, "longitude": -83.4, "timezone": "America/New_York",
	})
	require.Equal(t, http.StatusCreated, resp.StatusCode, string(data))

	resp2, data2 := doRequest(t, http.MethodGet, "/api/forecast?city=London", "", nil)
	assert.Equal(t, http.StatusConflict, resp2.StatusCode, string(data2))
}

func TestLocations_writeRequiresAdmin(t *testing.T) {
	resp, _ := doRequest(t, http.MethodPost, "/api/locations", "", map[string]any{"name": "x"})
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)

	resp2, data2 := doRequest(t, http.MethodPost, "/api/locations", userToken(t), map[string]any{
		"name": "Z", "city": "Z", "country": "ZZ", "latitude": 0.0, "longitude": 0.0, "timezone": "UTC",
	})
	assert.Equal(t, http.StatusForbidden, resp2.StatusCode, string(data2))
}

func TestLocations_createValidation400(t *testing.T) {
	resp, data := doRequest(t, http.MethodPost, "/api/locations", adminToken(t), map[string]any{
		"name": "Bad", "city": "Bad", "country": "BB", "latitude": 200.0, "longitude": 0.0, "timezone": "Not/Real",
	})
	require.Equal(t, http.StatusBadRequest, resp.StatusCode, string(data))
	var out struct {
		Error struct {
			Code    string            `json:"code"`
			Details map[string]string `json:"details"`
		} `json:"error"`
	}
	require.NoError(t, json.Unmarshal(data, &out))
	assert.Equal(t, "validation_error", out.Error.Code)
}
