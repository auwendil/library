package main

import (
	"backend/internal/repository"
	"backend/internal/repository/dbrepo"
	"flag"
	"fmt"
	"log"
	"net/http"
	"time"
)

type application struct {
	Domain         string
	DataSourceName string
	DB             repository.DatabaseRepo
	Auth           auth
	JWTSecretKey   string
	JWTIssuer      string
	JWTAudience    string
	CookieDomain   string
}

const (
	port = 8080
)

func handleCommandLine(app *application) {
	flag.StringVar(&app.Domain, "domain", "admin.com", "domain")
	flag.StringVar(&app.DataSourceName, "dsn", "host=localhost port=32768 user=postgres password=postgrespw dbname=books sslmode=disable timezone=UTC connect_timeout=10", "Postgres connection URL")
	flag.StringVar(&app.JWTSecretKey, "key", "secretValue", "jwt signing secret key")
	flag.StringVar(&app.JWTIssuer, "issuer", "admin.com", "jwt signing issuer")
	flag.StringVar(&app.JWTIssuer, "audience", "admin.com", "jwt signing audience")
	flag.StringVar(&app.CookieDomain, "cookie-domain", "localhost", "cookie domain")
	flag.Parse()
}

func handleDBConnection(app *application) {
	conn, err := app.connectToDB()
	if err != nil {
		log.Fatal(err)
	}
	app.DB = &dbrepo.PostgresDBRepo{DB: conn}
}

func setupAuthorization(app *application) {
	app.Auth = auth{
		Issuer:            app.JWTIssuer,
		Audience:          app.JWTAudience,
		SecretKey:         app.JWTSecretKey,
		TokenExpire:       time.Minute * 15,
		RefreshExpireDate: time.Hour * 24,
		Cookie: cookie{
			Path:   "/",
			Name:   "__Host-refresh_token",
			Domain: app.CookieDomain,
		},
	}
}

func startServer(app *application) {
	addr := fmt.Sprintf(":%d", port)

	log.Println("Listening on ", addr)
	err := http.ListenAndServe(addr, app.routes())
	if err != nil {
		log.Fatal("Could not start server:", err)
	}
}

func main() {
	// test connection string postgresql://postgres:postgrespw@localhost:32768/postgres

	var app application
	handleCommandLine(&app)
	handleDBConnection(&app)
	defer app.DB.Connection().Close()

	setupAuthorization(&app)
	startServer(&app)
}
