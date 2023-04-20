package dbrepo

import (
	"backend/internal/models"
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type PostgresDBRepo struct {
	DB *sql.DB
}

const timeout = time.Second * 3

func (repo *PostgresDBRepo) Connection() *sql.DB {
	return repo.DB
}

func (repo *PostgresDBRepo) GetAllBooks() ([]*models.Book, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	query := `
		SELECT id, title, author, release_date, description, created_at, updated_at
		FROM books
		ORDER BY title;
	`

	rows, err := repo.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var books []*models.Book

	for rows.Next() {
		var book models.Book
		err := rows.Scan(
			&book.Id,
			&book.Title,
			&book.Author,
			&book.ReleaseDate,
			&book.Description,
			&book.CreatedAt,
			&book.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		genres, genresArray, err := repo.GetBookGenres(book.Id)
		if err != nil {
			return nil, err
		}

		if len(genres) == 0 {
			genres = []*models.Genre{}
			genresArray = []int{}
		}

		book.Genres = genres
		book.GenresArray = genresArray

		books = append(books, &book)
	}

	return books, nil
}

func (repo *PostgresDBRepo) FindUserById(id int) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	query := `
		SELECT id, email, first_name, last_name, password, created_at, updated_at
		FROM users
		WHERE id=$1;
	`

	var user models.User
	row := repo.DB.QueryRowContext(ctx, query, id)
	err := row.Scan(
		&user.Id,
		&user.Email,
		&user.FirstName,
		&user.LastName,
		&user.Password,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (repo *PostgresDBRepo) FindUserByEmail(email string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	query := `
		SELECT id, email, first_name, last_name, password, created_at, updated_at
		FROM users
		WHERE email=$1;
	`

	var user models.User
	row := repo.DB.QueryRowContext(ctx, query, email)
	err := row.Scan(
		&user.Id,
		&user.Email,
		&user.FirstName,
		&user.LastName,
		&user.Password,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (repo *PostgresDBRepo) FindBookById(id int) (*models.Book, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	query := `
		SELECT id, title, author, release_date, description, created_at, updated_at
		FROM books
		WHERE id=$1;
	`
	row := repo.DB.QueryRowContext(ctx, query, id)

	var book models.Book
	err := row.Scan(
		&book.Id,
		&book.Title,
		&book.Author,
		&book.ReleaseDate,
		&book.Description,
		&book.CreatedAt,
		&book.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	genres, genresArray, err := repo.GetBookGenres(book.Id)
	if err != nil {
		return nil, err
	}

	book.Genres = genres
	book.GenresArray = genresArray
	return &book, nil
}

func (repo *PostgresDBRepo) GetBookGenres(bookId int) ([]*models.Genre, []int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	query := `
		SELECT g.id, g.genre 
		FROM book_genres bg
		LEFT JOIN genres g ON bg.genre_id = g.id
		WHERE bg.book_id=$1
		ORDER BY g.genre;
	`

	rows, err := repo.DB.QueryContext(ctx, query, bookId)
	if err != nil && err != sql.ErrNoRows {
		return nil, nil, err
	}
	defer rows.Close()

	var genres []*models.Genre
	var genresArray []int
	for rows.Next() {
		var g models.Genre
		err = rows.Scan(
			&g.Id,
			&g.Genre,
		)
		if err != nil {
			return nil, nil, err
		}
		genres = append(genres, &g)
		genresArray = append(genresArray, g.Id)
	}

	return genres, genresArray, nil
}

func (repo *PostgresDBRepo) GetAllGenres() ([]*models.Genre, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	query := `
		SELECT id, genre 
		FROM genres
		ORDER BY genre;
	`

	rows, err := repo.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var genres []*models.Genre
	for rows.Next() {
		var g models.Genre
		err := rows.Scan(
			&g.Id,
			&g.Genre,
		)
		if err != nil {
			return nil, err
		}
		genres = append(genres, &g)
	}

	return genres, nil
}

func (repo *PostgresDBRepo) AddBook(book models.Book) (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	query := `
		INSERT INTO books (title, author, release_date, description) 
		VALUES ($1, $2, $3, $4)
		RETURNING id;
	`

	var newId int
	err := repo.DB.QueryRowContext(ctx, query, book.Title, book.Author, book.ReleaseDate, book.Description).Scan(&newId)
	if err != nil {
		return 0, err
	}

	return newId, nil
}

func (repo *PostgresDBRepo) EditBook(book models.Book) error {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	query := `
		UPDATE books
		SET title = $2, author = $3, release_date = $4, description = $5
		WHERE id = $1;
	`

	_ = repo.DB.QueryRowContext(ctx, query, book.Id, book.Title, book.Author, book.ReleaseDate, book.Description)

	return nil
}

func (repo *PostgresDBRepo) AddBookGenres(bookId int, genreIds []int) error {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	query := `
		DELETE FROM book_genres WHERE book_id=$1;
	`

	_, err := repo.DB.ExecContext(ctx, query, bookId)
	if err != nil {
		return err
	}

	var genres strings.Builder
	for i, genreId := range genreIds {
		genres.WriteString(fmt.Sprintf("(%d, %d)", bookId, genreId))
		if i < len(genreIds)-1 {
			genres.WriteString(",")
		}
	}

	query = `
		INSERT INTO book_genres (book_id, genre_id) 
		VALUES 
	`

	_, err = repo.DB.ExecContext(ctx, fmt.Sprintf("%s %s;", query, genres.String()))
	if err != nil {
		return err
	}

	return nil
}

func (repo *PostgresDBRepo) DeleteBook(bookId int) error {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	query := `
		DELETE FROM books WHERE id=$1;
	`
	_, err := repo.DB.ExecContext(ctx, query, bookId)
	if err != nil {
		return err
	}

	query = `
		DELETE FROM book_genres WHERE book_id=$1;
	`
	_, err = repo.DB.ExecContext(ctx, query, bookId)
	if err != nil {
		return err
	}

	return nil
}
