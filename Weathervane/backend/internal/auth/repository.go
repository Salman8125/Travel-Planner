package auth

import (
	"context"

	"github.com/google/uuid"

	"github.com/travelplanner/weathervane/internal/domain"
	"github.com/travelplanner/weathervane/internal/platform/database"
	"github.com/travelplanner/weathervane/internal/platform/database/sqlc"
)

type UserRepo interface {
	Create(ctx context.Context, email, passwordHash string, role domain.Role) (domain.User, error)
	ByEmail(ctx context.Context, email string) (domain.User, error)
	ByID(ctx context.Context, id string) (domain.User, error)
}

type pgUserRepo struct{ q sqlc.Querier }

func NewUserRepo(q sqlc.Querier) UserRepo { return &pgUserRepo{q: q} }

func (r *pgUserRepo) Create(ctx context.Context, email, passwordHash string, role domain.Role) (domain.User, error) {
	row, err := r.q.InsertUser(ctx, sqlc.InsertUserParams{
		Email:        email,
		PasswordHash: passwordHash,
		Role:         sqlc.UserRole(role),
	})
	if err != nil {
		return domain.User{}, database.MapPgError(err)
	}
	return toDomainUser(row), nil
}

func (r *pgUserRepo) ByEmail(ctx context.Context, email string) (domain.User, error) {
	row, err := r.q.GetUserByEmail(ctx, email)
	if err != nil {
		return domain.User{}, database.MapPgError(err)
	}
	return toDomainUser(row), nil
}

func (r *pgUserRepo) ByID(ctx context.Context, id string) (domain.User, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return domain.User{}, domain.ErrNotFound
	}
	row, err := r.q.GetUserByID(ctx, uid)
	if err != nil {
		return domain.User{}, database.MapPgError(err)
	}
	return toDomainUser(row), nil
}

func toDomainUser(u sqlc.User) domain.User {
	return domain.User{
		ID:           u.ID.String(),
		Email:        u.Email,
		PasswordHash: u.PasswordHash,
		Role:         domain.Role(u.Role),
		CreatedAt:    database.Time(u.CreatedAt),
	}
}
