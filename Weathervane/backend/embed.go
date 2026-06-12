package weathervane

import "embed"

//go:embed db/migrations/*.sql
var MigrationsFS embed.FS

//go:embed api/openapi.yaml
var OpenAPISpec []byte
