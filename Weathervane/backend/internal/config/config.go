package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Server      ServerConfig
	DB          DBConfig
	Auth        AuthConfig
	Cache       CacheConfig
	RateLimit   RateLimitConfig
	CORS        CORSConfig
	LogLevel    string
	SeedOnStart bool
}

type ServerConfig struct {
	Addr           string
	RequestTimeout time.Duration
}

type DBConfig struct {
	URL string
}

type AuthConfig struct {
	JWTSecret  string
	JWTTTL     time.Duration
	BcryptCost int
}

type CacheConfig struct {
	TTL time.Duration
}

type RateLimitConfig struct {
	GlobalPerMin int
	AuthPerMin   int
	TrustProxy   bool
}

type CORSConfig struct {
	Origins []string
}

func Load() (Config, error) {
	cfg := Config{
		Server: ServerConfig{
			Addr:           getEnv("ADDR", ":8080"),
			RequestTimeout: getDuration("REQUEST_TIMEOUT", 15*time.Second),
		},
		DB: DBConfig{URL: os.Getenv("DATABASE_URL")},
		Auth: AuthConfig{
			JWTSecret:  os.Getenv("JWT_SECRET"),
			JWTTTL:     getDuration("JWT_TTL", time.Hour),
			BcryptCost: getInt("BCRYPT_COST", 12),
		},
		Cache: CacheConfig{TTL: getDuration("CACHE_TTL", 60*time.Second)},
		RateLimit: RateLimitConfig{
			GlobalPerMin: getInt("RATE_GLOBAL_PER_MIN", 120),
			AuthPerMin:   getInt("RATE_AUTH_PER_MIN", 20),
			TrustProxy:   getBool("TRUST_PROXY_HEADERS", false),
		},
		CORS:        CORSConfig{Origins: getCSV("CORS_ORIGINS")},
		LogLevel:    getEnv("LOG_LEVEL", "info"),
		SeedOnStart: getBool("SEED_ON_START", false),
	}
	if cfg.DB.URL == "" {
		return Config{}, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.Auth.JWTSecret == "" {
		return Config{}, fmt.Errorf("JWT_SECRET is required")
	}
	if cfg.Auth.BcryptCost < 4 || cfg.Auth.BcryptCost > 31 {
		return Config{}, fmt.Errorf("BCRYPT_COST must be between 4 and 31")
	}
	return cfg, nil
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return def
}

func getBool(key string, def bool) bool {
	if v := os.Getenv(key); v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			return b
		}
	}
	return def
}

func getDuration(key string, def time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return def
}

func getCSV(key string) []string {
	v := os.Getenv(key)
	if v == "" {
		return nil
	}
	parts := strings.Split(v, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if s := strings.TrimSpace(p); s != "" {
			out = append(out, s)
		}
	}
	return out
}
