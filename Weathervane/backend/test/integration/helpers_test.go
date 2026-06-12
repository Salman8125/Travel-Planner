//go:build integration

package integration

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"testing"

	"github.com/stretchr/testify/require"
)

func doRequest(t *testing.T, method, path, token string, body any) (*http.Response, []byte) {
	t.Helper()
	var reader io.Reader
	if body != nil {
		b, _ := json.Marshal(body)
		reader = bytes.NewReader(b)
	}
	req, err := http.NewRequest(method, server.URL+path, reader)
	require.NoError(t, err)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	data, _ := io.ReadAll(resp.Body)
	_ = resp.Body.Close()
	return resp, data
}

func loginToken(t *testing.T, email, password string) string {
	t.Helper()
	resp, data := doRequest(t, http.MethodPost, "/api/auth/login", "", map[string]string{"email": email, "password": password})
	require.Equal(t, http.StatusOK, resp.StatusCode, string(data))
	var out struct {
		Data struct {
			Token string `json:"token"`
		} `json:"data"`
	}
	require.NoError(t, json.Unmarshal(data, &out))
	require.NotEmpty(t, out.Data.Token)
	return out.Data.Token
}

func adminToken(t *testing.T) string { return loginToken(t, "admin@weathervane.dev", "admin12345") }
func userToken(t *testing.T) string  { return loginToken(t, "user@weathervane.dev", "user12345") }

func istanbulID(t *testing.T) string {
	t.Helper()
	resp, data := doRequest(t, http.MethodGet, "/api/locations?q=Istanbul", "", nil)
	require.Equal(t, http.StatusOK, resp.StatusCode)
	var out struct {
		Data []map[string]any `json:"data"`
	}
	require.NoError(t, json.Unmarshal(data, &out))
	require.NotEmpty(t, out.Data)
	return out.Data[0]["id"].(string)
}
