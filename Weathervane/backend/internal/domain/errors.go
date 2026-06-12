package domain

import "errors"

var (
	ErrNotFound     = errors.New("not found")
	ErrConflict     = errors.New("conflict")
	ErrUnauthorized = errors.New("unauthorized")
	ErrForbidden    = errors.New("forbidden")
	ErrAmbiguous    = errors.New("ambiguous location")
)

type ValidationError struct {
	Msg     string
	Details map[string]string
}

func (e *ValidationError) Error() string {
	if e.Msg == "" {
		return "validation failed"
	}
	return e.Msg
}

func NewValidationError(msg string, details map[string]string) *ValidationError {
	return &ValidationError{Msg: msg, Details: details}
}
