package database

import (
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"github.com/travelplanner/weathervane/internal/domain"
)

func MapPgError(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.ErrNotFound
	}
	var pg *pgconn.PgError
	if errors.As(err, &pg) {
		switch pg.Code {
		case "23505":
			return domain.ErrConflict
		case "23503":
			return domain.ErrConflict
		case "23514":
			return domain.NewValidationError("constraint violation", map[string]string{"constraint": pg.ConstraintName})
		case "22P02":
			return domain.NewValidationError("invalid input syntax", nil)
		case "22007", "22008":
			return domain.NewValidationError("invalid date or time", nil)
		}
	}
	return err
}
