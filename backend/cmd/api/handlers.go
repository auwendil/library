package main

import (
	"backend/internal/graph"
	"backend/internal/models"
	"errors"
	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"io"
	"log"
	"net/http"
	"strconv"
)

func (app *application) Home(w http.ResponseWriter, _ *http.Request) {
	var payload = struct {
		Status  string `json:"status"`
		Message string `json:"message"`
		Version string `json:"version"`
	}{
		Status:  "active",
		Message: "Up and running",
		Version: "1.0.0",
	}

	_ = app.writeJSON(w, payload, http.StatusOK)
}

func (app *application) GetAllBooks(w http.ResponseWriter, _ *http.Request) {
	books, err := app.DB.GetAllBooks()
	if err != nil {
		_ = app.handleErrorJSON(w, err)
		return
	}
	err = app.writeJSON(w, books, http.StatusOK)
	if err != nil {
		_ = app.handleErrorJSON(w, err, http.StatusInternalServerError)
		return
	}
}

func (app *application) GetBook(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		_ = app.handleErrorJSON(w, err)
		return
	}

	book, err := app.DB.FindBookById(id)
	if err != nil {
		_ = app.handleErrorJSON(w, err)
		return
	}

	_ = app.writeJSON(w, book, http.StatusOK)
}

func (app *application) GetAllGenres(w http.ResponseWriter, _ *http.Request) {
	genres, err := app.DB.GetAllGenres()
	if err != nil {
		_ = app.handleErrorJSON(w, err)
		return
	}

	_ = app.writeJSON(w, genres, http.StatusOK)
}

func (app *application) AddBook(w http.ResponseWriter, r *http.Request) {
	var book models.Book
	if err := app.readJSON(w, r, &book); err != nil {
		_ = app.handleErrorJSON(w, err)
		return
	}

	newId, err := app.DB.AddBook(book)
	if err != nil {
		_ = app.handleErrorJSON(w, err)
		return
	}

	err = app.DB.AddBookGenres(newId, book.GenresArray)
	if err != nil {
		_ = app.handleErrorJSON(w, err)
		return
	}

	resp := JSONResponse{
		Error:   false,
		Message: "success",
	}
	_ = app.writeJSON(w, resp, http.StatusAccepted)
}

func (app *application) EditBook(w http.ResponseWriter, r *http.Request) {
	var book models.Book
	if err := app.readJSON(w, r, &book); err != nil {
		_ = app.handleErrorJSON(w, err)
		return
	}

	err := app.DB.EditBook(book)
	if err != nil {
		_ = app.handleErrorJSON(w, err)
		return
	}

	err = app.DB.AddBookGenres(book.Id, book.GenresArray)
	if err != nil {
		_ = app.handleErrorJSON(w, err)
		return
	}

	resp := JSONResponse{
		Error:   false,
		Message: "success",
	}
	_ = app.writeJSON(w, resp, http.StatusAccepted)
}

func (app *application) RemoveBook(w http.ResponseWriter, r *http.Request) {
	bookId, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		_ = app.handleErrorJSON(w, err)
		return
	}

	err = app.DB.DeleteBook(bookId)
	if err != nil {
		_ = app.handleErrorJSON(w, err)
		return
	}

	resp := JSONResponse{
		Error:   false,
		Message: "success",
	}
	_ = app.writeJSON(w, resp, http.StatusAccepted)
}

func (app *application) GetBookLibrary(w http.ResponseWriter, r *http.Request) {
	app.GetAllBooks(w, r)
}

func (app *application) Authenticate(w http.ResponseWriter, r *http.Request) {
	var requestPayload struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := app.readJSON(w, r, &requestPayload); err != nil {
		_ = app.handleErrorJSON(w, err, http.StatusBadRequest)
		log.Println(err)
		return
	}

	user, err := app.DB.FindUserByEmail(requestPayload.Email)
	if err != nil {
		log.Println(err)
		_ = app.handleErrorJSON(w, errors.New("invalid credentials"), http.StatusBadRequest)
		return
	}

	valid, err := user.ValidatePassword(requestPayload.Password)
	if err != nil || !valid {
		_ = app.handleErrorJSON(w, errors.New("invalid credentials"), http.StatusBadRequest)
		return
	}

	u := jwtUser{
		Id:        user.Id,
		FirstName: user.FirstName,
		LastName:  user.LastName,
	}

	tokens, err := app.Auth.GenerateTokens(&u)
	if err != nil {
		_ = app.handleErrorJSON(w, err, http.StatusForbidden)
		return
	}

	refreshCookie := app.Auth.GetRefreshCookie(tokens.RefreshToken)
	http.SetCookie(w, refreshCookie)

	_ = app.writeJSON(w, tokens, http.StatusAccepted)
}

func (app *application) RefreshToken(w http.ResponseWriter, r *http.Request) {
	for _, cookie := range r.Cookies() {
		if cookie.Name == app.Auth.Cookie.Name {
			claims := &claims{}
			refreshToken := cookie.Value

			_, err := jwt.ParseWithClaims(refreshToken, claims, func(token *jwt.Token) (interface{}, error) {
				return []byte(app.JWTSecretKey), nil
			})
			if err != nil {
				_ = app.handleErrorJSON(w, errors.New("unautorized"), http.StatusUnauthorized)
				return
			}

			userId, err := strconv.Atoi(claims.Subject)
			if err != nil {
				_ = app.handleErrorJSON(w, errors.New("unknown user"), http.StatusUnauthorized)
				return
			}

			user, err := app.DB.FindUserById(userId)
			if err != nil {
				_ = app.handleErrorJSON(w, errors.New("unknown user"), http.StatusUnauthorized)
				return
			}

			u := jwtUser{
				Id:        user.Id,
				FirstName: user.FirstName,
				LastName:  user.LastName,
			}

			tokens, err := app.Auth.GenerateTokens(&u)
			if err != nil {
				_ = app.handleErrorJSON(w, errors.New("generating tokens failed"), http.StatusUnauthorized)
				return
			}

			http.SetCookie(w, app.Auth.GetRefreshCookie(tokens.RefreshToken))

			if err := app.writeJSON(w, tokens, http.StatusOK); err != nil {
				log.Println(err)
			}
		}
	}
}

func (app *application) Logout(w http.ResponseWriter, _ *http.Request) {
	http.SetCookie(w, app.Auth.GetExpiredRefreshCookie())
	w.WriteHeader(http.StatusAccepted)
}

func (app *application) HandleGraphQL(w http.ResponseWriter, r *http.Request) {
	books, err := app.DB.GetAllBooks()
	if err != nil {
		_ = app.handleErrorJSON(w, err)
		return
	}

	queryBytes, err := io.ReadAll(r.Body)
	query := string(queryBytes)

	g := graph.New(books, query)

	resp, err := g.Query()
	if err != nil {
		_ = app.handleErrorJSON(w, err)
		return
	}

	_ = app.writeJSON(w, resp, http.StatusOK)
}
