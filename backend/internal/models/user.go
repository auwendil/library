package models

import (
	"errors"
	"golang.org/x/crypto/bcrypt"
	"time"
)

type User struct {
	Id        int       `json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	Password  string    `json:"password"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}

func (u *User) ValidatePassword(plainTextPassword string) (bool, error) {
	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(plainTextPassword)); err != nil {
		switch {
		case errors.Is(err, bcrypt.ErrMismatchedHashAndPassword):
			return false, nil
		default:
			return false, err
		}
	}
	return true, nil
}
