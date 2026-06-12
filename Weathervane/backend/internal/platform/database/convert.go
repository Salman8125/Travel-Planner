package database

import (
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

func Date(t time.Time) pgtype.Date {
	return pgtype.Date{Time: t, Valid: true}
}

func DateString(d pgtype.Date) string {
	if !d.Valid {
		return ""
	}
	return d.Time.Format("2006-01-02")
}

func Int4FromPtr(p *int) pgtype.Int4 {
	if p == nil {
		return pgtype.Int4{Valid: false}
	}
	return pgtype.Int4{Int32: int32(*p), Valid: true}
}

func Int4ToPtr(i pgtype.Int4) *int {
	if !i.Valid {
		return nil
	}
	v := int(i.Int32)
	return &v
}

func Float8FromPtr(p *float64) pgtype.Float8 {
	if p == nil {
		return pgtype.Float8{Valid: false}
	}
	return pgtype.Float8{Float64: *p, Valid: true}
}

func Float8ToPtr(f pgtype.Float8) *float64 {
	if !f.Valid {
		return nil
	}
	v := f.Float64
	return &v
}

func TextFromPtr(p *string) pgtype.Text {
	if p == nil {
		return pgtype.Text{Valid: false}
	}
	return pgtype.Text{String: *p, Valid: true}
}

func Time(t pgtype.Timestamptz) time.Time {
	if !t.Valid {
		return time.Time{}
	}
	return t.Time
}
