package domain

import "time"

type Role string

const (
	RoleUser  Role = "USER"
	RoleAdmin Role = "ADMIN"
)

func (r Role) Valid() bool {
	return r == RoleUser || r == RoleAdmin
}

type User struct {
	ID           string
	Email        string
	PasswordHash string
	Role         Role
	CreatedAt    time.Time
}

type PublicUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Role  Role   `json:"role"`
}

func (u User) Public() PublicUser {
	return PublicUser{ID: u.ID, Email: u.Email, Role: u.Role}
}
