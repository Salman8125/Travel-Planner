package location

import (
	"context"
	"strings"
	"time"

	"github.com/travelplanner/weathervane/internal/domain"
)

type Service struct{ repo Repo }

func NewService(repo Repo) *Service { return &Service{repo: repo} }

type ListResult struct {
	Items []domain.Location
	Meta  domain.PageMeta
}

func (s *Service) List(ctx context.Context, q, country *string, page, pageSize int) (ListResult, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 100 {
		pageSize = 100
	}
	total, err := s.repo.Count(ctx, q, country)
	if err != nil {
		return ListResult{}, err
	}
	items, err := s.repo.Search(ctx, ListParams{
		Q:       q,
		Country: country,
		Limit:   pageSize,
		Offset:  (page - 1) * pageSize,
	})
	if err != nil {
		return ListResult{}, err
	}
	return ListResult{Items: items, Meta: domain.NewPageMeta(page, pageSize, total)}, nil
}

func (s *Service) Get(ctx context.Context, id string) (domain.Location, error) {
	return s.repo.ByID(ctx, id)
}

func (s *Service) Resolve(ctx context.Context, city string, country *string) (domain.Location, error) {
	matches, err := s.repo.ByCity(ctx, city, country)
	if err != nil {
		return domain.Location{}, err
	}
	switch len(matches) {
	case 0:
		return domain.Location{}, domain.ErrNotFound
	case 1:
		return matches[0], nil
	default:
		return domain.Location{}, domain.ErrAmbiguous
	}
}

func (s *Service) Create(ctx context.Context, in domain.Location) (domain.Location, error) {
	if err := validateLocation(in); err != nil {
		return domain.Location{}, err
	}
	in.City = strings.TrimSpace(in.City)
	in.Country = strings.TrimSpace(in.Country)
	return s.repo.Create(ctx, in)
}

func (s *Service) Update(ctx context.Context, id string, in UpdateInput) (domain.Location, error) {
	if err := validateUpdate(in); err != nil {
		return domain.Location{}, err
	}
	return s.repo.Update(ctx, id, in)
}

func (s *Service) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func validateLocation(l domain.Location) error {
	details := map[string]string{}
	if strings.TrimSpace(l.Name) == "" {
		details["name"] = "is required"
	}
	if strings.TrimSpace(l.City) == "" {
		details["city"] = "is required"
	}
	if strings.TrimSpace(l.Country) == "" {
		details["country"] = "is required"
	}
	if l.Latitude < -90 || l.Latitude > 90 {
		details["latitude"] = "must be between -90 and 90"
	}
	if l.Longitude < -180 || l.Longitude > 180 {
		details["longitude"] = "must be between -180 and 180"
	}
	if _, err := time.LoadLocation(l.Timezone); err != nil {
		details["timezone"] = "must be a valid IANA timezone"
	}
	if len(details) > 0 {
		return domain.NewValidationError("invalid location", details)
	}
	return nil
}

func validateUpdate(in UpdateInput) error {
	details := map[string]string{}
	if in.Name != nil && strings.TrimSpace(*in.Name) == "" {
		details["name"] = "cannot be empty"
	}
	if in.City != nil && strings.TrimSpace(*in.City) == "" {
		details["city"] = "cannot be empty"
	}
	if in.Country != nil && strings.TrimSpace(*in.Country) == "" {
		details["country"] = "cannot be empty"
	}
	if in.Latitude != nil && (*in.Latitude < -90 || *in.Latitude > 90) {
		details["latitude"] = "must be between -90 and 90"
	}
	if in.Longitude != nil && (*in.Longitude < -180 || *in.Longitude > 180) {
		details["longitude"] = "must be between -180 and 180"
	}
	if in.Timezone != nil {
		if _, err := time.LoadLocation(*in.Timezone); err != nil {
			details["timezone"] = "must be a valid IANA timezone"
		}
	}
	if len(details) > 0 {
		return domain.NewValidationError("invalid location update", details)
	}
	return nil
}
