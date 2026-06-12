package auth

import (
	"context"
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"github.com/travelplanner/weathervane/internal/domain"
)

type Service struct {
	repo       UserRepo
	tokens     *TokenManager
	bcryptCost int
	dummyHash  []byte
}

func NewService(repo UserRepo, tokens *TokenManager, bcryptCost int) *Service {
	dummy, _ := bcrypt.GenerateFromPassword([]byte("weathervane-dummy-password"), bcryptCost)
	return &Service{repo: repo, tokens: tokens, bcryptCost: bcryptCost, dummyHash: dummy}
}

type Result struct {
	Token string
	User  domain.User
}

func (s *Service) Register(ctx context.Context, email, password string) (Result, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	hash, err := bcrypt.GenerateFromPassword([]byte(password), s.bcryptCost)
	if err != nil {
		return Result{}, err
	}
	user, err := s.repo.Create(ctx, email, string(hash), domain.RoleUser)
	if err != nil {
		return Result{}, err
	}
	token, err := s.tokens.Generate(user)
	if err != nil {
		return Result{}, err
	}
	return Result{Token: token, User: user}, nil
}

func (s *Service) Login(ctx context.Context, email, password string) (Result, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	user, err := s.repo.ByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			_ = bcrypt.CompareHashAndPassword(s.dummyHash, []byte(password))
			return Result{}, domain.ErrUnauthorized
		}
		return Result{}, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return Result{}, domain.ErrUnauthorized
	}
	token, err := s.tokens.Generate(user)
	if err != nil {
		return Result{}, err
	}
	return Result{Token: token, User: user}, nil
}

func (s *Service) Me(ctx context.Context, userID string) (domain.User, error) {
	return s.repo.ByID(ctx, userID)
}
