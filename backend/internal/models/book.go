package models

import "time"

type Book struct {
	Id          int       `json:"id"`
	Title       string    `json:"title"`
	Author      string    `json:"author"`
	ReleaseDate time.Time `json:"releaseDate"`
	Description string    `json:"description"`
	Genres      []*Genre  `json:"genres"`
	GenresArray []int     `json:"genres_array"`
	CreatedAt   time.Time `json:"-"`
	UpdatedAt   time.Time `json:"-"`
}
