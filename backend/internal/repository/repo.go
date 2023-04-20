package repository

import (
	"backend/internal/models"
	"database/sql"
)

type DatabaseRepo interface {
	Connection() *sql.DB
	FindUserById(id int) (*models.User, error)
	FindUserByEmail(email string) (*models.User, error)
	FindBookById(bookId int) (*models.Book, error)
	GetBookGenres(bookId int) ([]*models.Genre, []int, error)
	GetAllBooks() ([]*models.Book, error)
	GetAllGenres() ([]*models.Genre, error)
	AddBook(book models.Book) (int, error)
	AddBookGenres(bookId int, genreIds []int) error
	EditBook(book models.Book) error
	DeleteBook(bookId int) error
}
