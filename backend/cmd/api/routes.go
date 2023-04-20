package main

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"net/http"
)

func (app *application) routes() http.Handler {
	mux := chi.NewRouter()
	mux.Use(middleware.Recoverer)
	mux.Use(app.enableCORS)

	mux.Get("/", app.Home)
	mux.Get("/library", app.GetAllBooks)
	mux.Get("/library/{id}", app.GetBook)
	mux.Get("/genres", app.GetAllGenres)

	mux.Get("/refresh", app.RefreshToken)
	mux.Get("/logout", app.Logout)

	mux.Post("/auth", app.Authenticate)

	mux.Post("/graphql", app.HandleGraphQL)

	mux.Route("/admin", func(m chi.Router) {
		m.Use(app.authorizedRequired)

		m.Get("/library", app.GetBookLibrary)
		m.Put("/library/0", app.AddBook)
		m.Get("/library/{id}", app.GetBook)
		m.Patch("/library/{id}", app.EditBook)
		m.Delete("/library/{id}", app.RemoveBook)
	})

	return mux
}
