package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/travelplanner/weathervane/internal/transport/http/respond"
)

type OpsHandler struct {
	ready   Pinger
	openapi []byte
}

func NewOpsHandler(ready Pinger, openapi []byte) *OpsHandler {
	return &OpsHandler{ready: ready, openapi: openapi}
}

func (h *OpsHandler) Mount(r chi.Router) {
	r.Get("/health", h.Health)
	r.Get("/ready", h.Ready)
	r.Get("/docs", h.Docs)
	r.Get("/openapi.yaml", h.OpenAPISpec)
}

func (h *OpsHandler) Health(w http.ResponseWriter, r *http.Request) {
	respond.Raw(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *OpsHandler) Ready(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := h.ready.Ping(ctx); err != nil {
		respond.Raw(w, http.StatusServiceUnavailable, map[string]string{"status": "unavailable", "db": "down"})
		return
	}
	respond.Raw(w, http.StatusOK, map[string]string{"status": "ready", "db": "up"})
}

func (h *OpsHandler) OpenAPISpec(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/yaml")
	_, _ = w.Write(h.openapi)
}

func (h *OpsHandler) Docs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = w.Write([]byte(docsHTML))
}

const docsHTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Weathervane API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function () {
      window.ui = SwaggerUIBundle({ url: '/openapi.yaml', dom_id: '#swagger-ui' });
    };
  </script>
</body>
</html>`
