//go:build integration

package integration

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAuth_registerLoginMe(t *testing.T) {
	email := "newuser@example.com"
	resp, data := doRequest(t, http.MethodPost, "/api/auth/register", "", map[string]string{"email": email, "password": "password123"})
	require.Equal(t, http.StatusCreated, resp.StatusCode, string(data))

	tok := loginToken(t, email, "password123")
	resp2, data2 := doRequest(t, http.MethodGet, "/api/auth/me", tok, nil)
	require.Equal(t, http.StatusOK, resp2.StatusCode, string(data2))
}

func TestAuth_badCredentialsNoLeak(t *testing.T) {
	resp, _ := doRequest(t, http.MethodPost, "/api/auth/login", "", map[string]string{"email": "admin@weathervane.dev", "password": "wrong"})
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)

	resp2, _ := doRequest(t, http.MethodPost, "/api/auth/login", "", map[string]string{"email": "ghost@example.com", "password": "whatever"})
	assert.Equal(t, http.StatusUnauthorized, resp2.StatusCode)
}

func TestAuth_meRequiresToken401(t *testing.T) {
	resp, _ := doRequest(t, http.MethodGet, "/api/auth/me", "", nil)
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}
