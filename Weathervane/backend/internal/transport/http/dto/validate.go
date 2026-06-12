package dto

import (
	"errors"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"

	"github.com/travelplanner/weathervane/internal/domain"
)

var validate = newValidator()

func newValidator() *validator.Validate {
	v := validator.New()
	v.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})
	return v
}

func Validate(s any) error {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}
	var verrs validator.ValidationErrors
	if errors.As(err, &verrs) {
		details := map[string]string{}
		for _, fe := range verrs {
			details[fe.Field()] = messageFor(fe)
		}
		return domain.NewValidationError("validation failed", details)
	}
	return domain.NewValidationError("validation failed", nil)
}

func messageFor(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "is required"
	case "email":
		return "must be a valid email"
	case "min":
		return "must be at least " + fe.Param() + " characters"
	case "max":
		return "must be at most " + fe.Param()
	case "gte":
		return "must be >= " + fe.Param()
	case "lte":
		return "must be <= " + fe.Param()
	default:
		return "is invalid"
	}
}
