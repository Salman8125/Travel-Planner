//go:build integration

package integration

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestForecast_byCityReturnsArray(t *testing.T) {
	resp, data := doRequest(t, http.MethodGet, "/api/forecast?city=Istanbul", "", nil)
	require.Equal(t, http.StatusOK, resp.StatusCode, string(data))
	var out struct {
		Data []map[string]any `json:"data"`
	}
	require.NoError(t, json.Unmarshal(data, &out))
	assert.NotEmpty(t, out.Data)
}

func TestForecast_emptyRangeIsEmptyArray(t *testing.T) {
	id := istanbulID(t)
	resp, data := doRequest(t, http.MethodGet, "/api/forecast?locationId="+id+"&startDate=2000-01-01&endDate=2000-01-05", "", nil)
	require.Equal(t, http.StatusOK, resp.StatusCode, string(data))
	var out struct {
		Data []map[string]any `json:"data"`
	}
	require.NoError(t, json.Unmarshal(data, &out))
	assert.Empty(t, out.Data)
}

func TestForecast_unknownLocation404(t *testing.T) {
	resp, _ := doRequest(t, http.MethodGet, "/api/forecast?locationId=00000000-0000-0000-0000-000000000000", "", nil)
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestForecast_spanCap400(t *testing.T) {
	id := istanbulID(t)
	resp, _ := doRequest(t, http.MethodGet, "/api/forecast?locationId="+id+"&startDate=2026-01-01&endDate=2026-03-01", "", nil)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestForecast_adminUpsertIdempotentAndCacheInvalidated(t *testing.T) {
	id := istanbulID(t)
	token := adminToken(t)
	day := "2030-06-01"

	doRequest(t, http.MethodGet, "/api/forecast?locationId="+id+"&startDate="+day+"&endDate="+day, "", nil)

	body := map[string]any{"date": day, "high": 30.0, "low": 18.0, "condition": "SUNNY", "humidity": 40}
	resp, data := doRequest(t, http.MethodPut, "/api/locations/"+id+"/forecast", token, body)
	require.Equal(t, http.StatusOK, resp.StatusCode, string(data))

	body["high"] = 33.0
	resp2, data2 := doRequest(t, http.MethodPut, "/api/locations/"+id+"/forecast", token, body)
	require.Equal(t, http.StatusOK, resp2.StatusCode, string(data2))

	resp3, data3 := doRequest(t, http.MethodGet, "/api/forecast?locationId="+id+"&startDate="+day+"&endDate="+day, "", nil)
	require.Equal(t, http.StatusOK, resp3.StatusCode, string(data3))
	var out struct {
		Data []struct {
			Date string  `json:"date"`
			High float64 `json:"high"`
		} `json:"data"`
	}
	require.NoError(t, json.Unmarshal(data3, &out))
	require.Len(t, out.Data, 1)
	assert.Equal(t, day, out.Data[0].Date)
	assert.Equal(t, 33.0, out.Data[0].High)
}
