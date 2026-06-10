package main

import (
	"log"
	"net/http"

	"github.com/travelplanner/weathervane/internal/httpapi"
)

func main() {
	mux := httpapi.NewMux()
	// ":4004" binds all interfaces (0.0.0.0) — reachable from outside the container.
	addr := ":4004"
	log.Printf("Weathervane backend listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
