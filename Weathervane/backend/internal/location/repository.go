package location

import (
	"context"

	"github.com/google/uuid"

	"github.com/travelplanner/weathervane/internal/domain"
	"github.com/travelplanner/weathervane/internal/platform/database"
	"github.com/travelplanner/weathervane/internal/platform/database/sqlc"
)

type ListParams struct {
	Q       *string
	Country *string
	Limit   int
	Offset  int
}

type UpdateInput struct {
	Name      *string
	City      *string
	Country   *string
	Timezone  *string
	Latitude  *float64
	Longitude *float64
}

type Repo interface {
	Search(ctx context.Context, p ListParams) ([]domain.Location, error)
	Count(ctx context.Context, q, country *string) (int, error)
	ByID(ctx context.Context, id string) (domain.Location, error)
	ByCity(ctx context.Context, city string, country *string) ([]domain.Location, error)
	Create(ctx context.Context, in domain.Location) (domain.Location, error)
	Update(ctx context.Context, id string, in UpdateInput) (domain.Location, error)
	Delete(ctx context.Context, id string) error
}

type pgRepo struct{ q sqlc.Querier }

func NewRepo(q sqlc.Querier) Repo { return &pgRepo{q: q} }

func (r *pgRepo) Search(ctx context.Context, p ListParams) ([]domain.Location, error) {
	rows, err := r.q.SearchLocations(ctx, sqlc.SearchLocationsParams{
		Q:       database.TextFromPtr(p.Q),
		Country: database.TextFromPtr(p.Country),
		Limit:   int32(p.Limit),
		Offset:  int32(p.Offset),
	})
	if err != nil {
		return nil, database.MapPgError(err)
	}
	out := make([]domain.Location, 0, len(rows))
	for _, row := range rows {
		out = append(out, toDomainLocation(row))
	}
	return out, nil
}

func (r *pgRepo) Count(ctx context.Context, q, country *string) (int, error) {
	n, err := r.q.CountLocations(ctx, sqlc.CountLocationsParams{
		Q:       database.TextFromPtr(q),
		Country: database.TextFromPtr(country),
	})
	if err != nil {
		return 0, database.MapPgError(err)
	}
	return int(n), nil
}

func (r *pgRepo) ByID(ctx context.Context, id string) (domain.Location, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return domain.Location{}, domain.ErrNotFound
	}
	row, err := r.q.GetLocationByID(ctx, uid)
	if err != nil {
		return domain.Location{}, database.MapPgError(err)
	}
	return toDomainLocation(row), nil
}

func (r *pgRepo) ByCity(ctx context.Context, city string, country *string) ([]domain.Location, error) {
	rows, err := r.q.FindLocationsByCity(ctx, sqlc.FindLocationsByCityParams{
		City:    city,
		Country: database.TextFromPtr(country),
	})
	if err != nil {
		return nil, database.MapPgError(err)
	}
	out := make([]domain.Location, 0, len(rows))
	for _, row := range rows {
		out = append(out, toDomainLocation(row))
	}
	return out, nil
}

func (r *pgRepo) Create(ctx context.Context, in domain.Location) (domain.Location, error) {
	row, err := r.q.InsertLocation(ctx, sqlc.InsertLocationParams{
		Name:      in.Name,
		City:      in.City,
		Country:   in.Country,
		Latitude:  in.Latitude,
		Longitude: in.Longitude,
		Timezone:  in.Timezone,
	})
	if err != nil {
		return domain.Location{}, database.MapPgError(err)
	}
	return toDomainLocation(row), nil
}

func (r *pgRepo) Update(ctx context.Context, id string, in UpdateInput) (domain.Location, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return domain.Location{}, domain.ErrNotFound
	}
	row, err := r.q.UpdateLocation(ctx, sqlc.UpdateLocationParams{
		ID:        uid,
		Name:      database.TextFromPtr(in.Name),
		City:      database.TextFromPtr(in.City),
		Country:   database.TextFromPtr(in.Country),
		Timezone:  database.TextFromPtr(in.Timezone),
		Latitude:  database.Float8FromPtr(in.Latitude),
		Longitude: database.Float8FromPtr(in.Longitude),
	})
	if err != nil {
		return domain.Location{}, database.MapPgError(err)
	}
	return toDomainLocation(row), nil
}

func (r *pgRepo) Delete(ctx context.Context, id string) error {
	uid, err := uuid.Parse(id)
	if err != nil {
		return domain.ErrNotFound
	}
	n, err := r.q.DeleteLocation(ctx, uid)
	if err != nil {
		return database.MapPgError(err)
	}
	if n == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func toDomainLocation(l sqlc.Location) domain.Location {
	return domain.Location{
		ID:        l.ID.String(),
		Name:      l.Name,
		City:      l.City,
		Country:   l.Country,
		Latitude:  l.Latitude,
		Longitude: l.Longitude,
		Timezone:  l.Timezone,
		CreatedAt: database.Time(l.CreatedAt),
		UpdatedAt: database.Time(l.UpdatedAt),
	}
}
