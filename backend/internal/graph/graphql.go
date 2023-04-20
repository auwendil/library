package graph

import (
	"backend/internal/models"
	"errors"
	"github.com/graphql-go/graphql"
	"strings"
)

type Graph struct {
	Books       []*models.Book
	QueryString string
	Config      graphql.SchemaConfig
	fields      graphql.Fields
	bookType    *graphql.Object
}

func New(books []*models.Book, queryString string) *Graph {
	var bookType = graphql.NewObject(
		graphql.ObjectConfig{
			Name: "Book",
			Fields: graphql.Fields{
				"id": &graphql.Field{
					Type: graphql.Int,
				},
				"title": &graphql.Field{
					Type: graphql.String,
				},
				"author": &graphql.Field{
					Type: graphql.String,
				},
				"release_date": &graphql.Field{
					Type: graphql.DateTime,
				},
				"description": &graphql.Field{
					Type: graphql.String,
				},
				"created_at": &graphql.Field{
					Type: graphql.DateTime,
				},
				"updated_at": &graphql.Field{
					Type: graphql.DateTime,
				},
			},
		},
	)

	var fields = graphql.Fields{
		"list": &graphql.Field{
			Type:        graphql.NewList(bookType),
			Description: "Get all books",
			Resolve: func(params graphql.ResolveParams) (interface{}, error) {
				return books, nil
			},
		},
		"search": &graphql.Field{
			Type:        graphql.NewList(bookType),
			Description: "Search for book by title",
			Args: graphql.FieldConfigArgument{
				"title": &graphql.ArgumentConfig{
					Type: graphql.String,
				},
			},
			Resolve: func(params graphql.ResolveParams) (interface{}, error) {
				var bookList []*models.Book
				titleToSearch, ok := params.Args["title"].(string)
				if ok {
					for _, book := range books {
						if strings.Contains(strings.ToLower(book.Title), strings.ToLower(titleToSearch)) {
							bookList = append(bookList, book)
						}
					}
				}

				return bookList, nil
			},
		},
		"get": &graphql.Field{
			Type:        bookType,
			Description: "Get book by id",
			Args: graphql.FieldConfigArgument{
				"bookId": &graphql.ArgumentConfig{
					Type: graphql.String,
				},
			},
			Resolve: func(params graphql.ResolveParams) (interface{}, error) {
				idToSearch, ok := params.Args["id"].(int)
				if ok {
					for _, book := range books {
						if book.Id == idToSearch {
							return book, nil
						}
					}
				}

				return nil, nil
			},
		},
	}

	return &Graph{
		Books:       books,
		QueryString: queryString,
		fields:      fields,
		bookType:    bookType,
	}
}

func (g *Graph) Query() (*graphql.Result, error) {
	rootQuery := graphql.ObjectConfig{Name: "RootQuery", Fields: g.fields}
	schemaConfig := graphql.SchemaConfig{Query: graphql.NewObject(rootQuery)}
	schema, err := graphql.NewSchema(schemaConfig)
	if err != nil {
		return nil, err
	}

	params := graphql.Params{Schema: schema, RequestString: g.QueryString}
	resp := graphql.Do(params)
	if len(resp.Errors) > 0 {
		return nil, errors.New("error while executing query")
	}

	return resp, nil
}
