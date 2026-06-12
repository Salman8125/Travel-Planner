package httpctx

import "context"

type ctxKeyRequestID struct{}
type ctxKeyUser struct{}

type User struct {
	ID    string
	Email string
	Role  string
}

func WithRequestID(ctx context.Context, id string) context.Context {
	return context.WithValue(ctx, ctxKeyRequestID{}, id)
}

func RequestID(ctx context.Context) string {
	if v, ok := ctx.Value(ctxKeyRequestID{}).(string); ok {
		return v
	}
	return ""
}

func WithUser(ctx context.Context, u User) context.Context {
	return context.WithValue(ctx, ctxKeyUser{}, u)
}

func UserFrom(ctx context.Context) (User, bool) {
	u, ok := ctx.Value(ctxKeyUser{}).(User)
	return u, ok
}
