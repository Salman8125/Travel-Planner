package middleware

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"

	"github.com/travelplanner/weathervane/internal/transport/http/httperr"
)

const (
	limiterIdleTTL  = 10 * time.Minute
	limiterSweepInt = time.Minute
)

type limiterEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type ipLimiter struct {
	mu      sync.Mutex
	entries map[string]*limiterEntry
	limit   rate.Limit
	burst   int
}

func newIPLimiter(perMinute int) *ipLimiter {
	l := &ipLimiter{
		entries: make(map[string]*limiterEntry),
		limit:   rate.Limit(float64(perMinute) / 60.0),
		burst:   perMinute,
	}
	go l.janitor()
	return l
}

func (l *ipLimiter) get(ip string) *rate.Limiter {
	l.mu.Lock()
	defer l.mu.Unlock()
	e, ok := l.entries[ip]
	if !ok {
		e = &limiterEntry{limiter: rate.NewLimiter(l.limit, l.burst)}
		l.entries[ip] = e
	}
	e.lastSeen = time.Now()
	return e.limiter
}

func (l *ipLimiter) size() int {
	l.mu.Lock()
	defer l.mu.Unlock()
	return len(l.entries)
}

func (l *ipLimiter) sweep(now time.Time, idle time.Duration) {
	l.mu.Lock()
	for ip, e := range l.entries {
		if now.Sub(e.lastSeen) > idle {
			delete(l.entries, ip)
		}
	}
	l.mu.Unlock()
}

func (l *ipLimiter) janitor() {
	t := time.NewTicker(limiterSweepInt)
	defer t.Stop()
	for range t.C {
		l.sweep(time.Now(), limiterIdleTTL)
	}
}

func RateLimit(perMinute int, trustProxy bool) func(http.Handler) http.Handler {
	limiter := newIPLimiter(perMinute)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !limiter.get(clientIP(r, trustProxy)).Allow() {
				httperr.WriteCode(w, r, http.StatusTooManyRequests, "throttled", "Too many requests")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func clientIP(r *http.Request, trustProxy bool) string {
	if trustProxy {
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			if i := strings.IndexByte(xff, ','); i >= 0 {
				return strings.TrimSpace(xff[:i])
			}
			return strings.TrimSpace(xff)
		}
		if xrip := r.Header.Get("X-Real-IP"); xrip != "" {
			return strings.TrimSpace(xrip)
		}
	}
	if host, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
		return host
	}
	return r.RemoteAddr
}
