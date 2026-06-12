package database

import (
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/stretchr/testify/assert"

	"github.com/travelplanner/weathervane/internal/domain"
)

func TestMapPgError(t *testing.T) {
	assert.Nil(t, MapPgError(nil))
	assert.ErrorIs(t, MapPgError(pgx.ErrNoRows), domain.ErrNotFound)
	assert.ErrorIs(t, MapPgError(&pgconn.PgError{Code: "23505"}), domain.ErrConflict)
	assert.ErrorIs(t, MapPgError(&pgconn.PgError{Code: "23503"}), domain.ErrConflict)

	var ve *domain.ValidationError
	assert.ErrorAs(t, MapPgError(&pgconn.PgError{Code: "23514", ConstraintName: "chk_high_low"}), &ve)
	assert.ErrorAs(t, MapPgError(&pgconn.PgError{Code: "22P02"}), &ve)
}
