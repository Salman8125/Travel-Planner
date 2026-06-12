package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRateLimiter_evictsIdle(t *testing.T) {
	l := newIPLimiter(60)
	l.get("1.2.3.4")
	require.Equal(t, 1, l.size())

	l.sweep(time.Now().Add(20*time.Minute), 10*time.Minute)
	assert.Equal(t, 0, l.size())
}

func TestRateLimiter_keepsRecent(t *testing.T) {
	l := newIPLimiter(60)
	l.get("1.2.3.4")
	l.sweep(time.Now(), 10*time.Minute)
	assert.Equal(t, 1, l.size())
}

func TestClientIP(t *testing.T) {
	r := httptest.NewRequest(http.MethodGet, "/", nil)
	r.RemoteAddr = "10.0.0.1:5555"
	assert.Equal(t, "10.0.0.1", clientIP(r, false))

	r.Header.Set("X-Forwarded-For", "203.0.113.7, 10.0.0.1")
	assert.Equal(t, "203.0.113.7", clientIP(r, true))
	assert.Equal(t, "10.0.0.1", clientIP(r, false))
}

func TestCORS_allowlist(t *testing.T) {
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) })
	h := CORS([]string{"https://app.example.com"})(next)

	allowed := httptest.NewRequest(http.MethodGet, "/", nil)
	allowed.Header.Set("Origin", "https://app.example.com")
	w := httptest.NewRecorder()
	h.ServeHTTP(w, allowed)
	assert.Equal(t, "https://app.example.com", w.Header().Get("Access-Control-Allow-Origin"))

	disallowed := httptest.NewRequest(http.MethodGet, "/", nil)
	disallowed.Header.Set("Origin", "https://evil.example.com")
	w2 := httptest.NewRecorder()
	h.ServeHTTP(w2, disallowed)
	assert.Empty(t, w2.Header().Get("Access-Control-Allow-Origin"))
}

func TestCORS_allowAllWhenUnset(t *testing.T) {
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})
	h := CORS(nil)(next)
	r := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	assert.Equal(t, "*", w.Header().Get("Access-Control-Allow-Origin"))
}
