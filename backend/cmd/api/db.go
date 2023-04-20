package main

import (
	"database/sql"
	_ "github.com/jackc/pgconn"
	_ "github.com/jackc/pgx/v5"
	_ "github.com/jackc/pgx/v5/stdlib"
	"log"
)

func openDB(dataStringName string) (*sql.DB, error) {
	db, err := sql.Open("pgx", dataStringName)
	if err != nil {
		return nil, err
	}

	err = db.Ping()
	if err != nil {
		return nil, err
	}

	return db, nil
}

func (app *application) connectToDB() (*sql.DB, error) {
	conn, err := openDB(app.DataSourceName)
	if err != nil {
		return nil, err
	}

	log.Println("Connected to database")
	return conn, nil
}
