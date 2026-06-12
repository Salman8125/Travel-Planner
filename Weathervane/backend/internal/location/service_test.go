package location

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/travelplanner/weathervane/internal/domain"
)

type mockRepo struct {
	items  []domain.Location
	total  int
	byCity []domain.Location
}

func (m *mockRepo) Search(ctx context.Context, p ListParams) ([]domain.Location, error) {
	return m.items, nil
}
func (m *mockRepo) Count(ctx context.Context, q, country *string) (int, error) { return m.total, nil }
func (m *mockRepo) ByID(ctx context.Context, id string) (domain.Location, error) {
	return domain.Location{}, domain.ErrNotFound
}
func (m *mockRepo) ByCity(ctx context.Context, city string, country *string) ([]domain.Location, error) {
	return m.byCity, nil
}
func (m *mockRepo) Create(ctx context.Context, in domain.Location) (domain.Location, error) {
	return in, nil
}
func (m *mockRepo) Update(ctx context.Context, id string, in UpdateInput) (domain.Location, error) {
	return domain.Location{}, nil
}
func (m *mockRepo) Delete(ctx context.Context, id string) error { return nil }

func TestList_pagination(t *testing.T) {
	repo := &mockRepo{items: make([]domain.Location, 5), total: 45}
	res, err := NewService(repo).List(context.Background(), nil, nil, 2, 20)
	require.NoError(t, err)
	assert.Equal(t, 2, res.Meta.Page)
	assert.Equal(t, 20, res.Meta.PageSize)
	assert.Equal(t, 45, res.Meta.Total)
	assert.Equal(t, 3, res.Meta.TotalPages)
}

func TestList_capsPageSizeAndPage(t *testing.T) {
	res, _ := NewService(&mockRepo{}).List(context.Background(), nil, nil, 0, 999)
	assert.Equal(t, 1, res.Meta.Page)
	assert.Equal(t, 100, res.Meta.PageSize)
}

func TestResolve_ambiguous(t *testing.T) {
	repo := &mockRepo{byCity: []domain.Location{{ID: "a"}, {ID: "b"}}}
	_, err := NewService(repo).Resolve(context.Background(), "London", nil)
	assert.ErrorIs(t, err, domain.ErrAmbiguous)
}

func TestResolve_notFound(t *testing.T) {
	_, err := NewService(&mockRepo{byCity: nil}).Resolve(context.Background(), "Nowhere", nil)
	assert.ErrorIs(t, err, domain.ErrNotFound)
}

func TestCreate_validation(t *testing.T) {
	_, err := NewService(&mockRepo{}).Create(context.Background(), domain.Location{
		Name: "X", City: "", Country: "PK", Latitude: 200, Longitude: 0, Timezone: "Bad/Zone",
	})
	var ve *domain.ValidationError
	require.ErrorAs(t, err, &ve)
	assert.Contains(t, ve.Details, "city")
	assert.Contains(t, ve.Details, "latitude")
	assert.Contains(t, ve.Details, "timezone")
}
