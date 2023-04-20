import { Link } from 'react-router-dom';
import BooksList from '../components/BooksList.jsx';
import Input from '../components/form/Input.jsx';
import styles from './GraphQLPage.module.scss';

import React, { useEffect, useState } from 'react';

function GraphQLPage() {
    const [books, setBooks] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const payload = `
                {
                    list {
                        id
                        title
                        author
                        release_date
                        description
                    }
                }`;

                const response = await fetch(`/graphql`, {
                    method: 'POST',
                    body: payload,
                    headers: {
                        'Content-Type': 'application/graphql',
                    },
                });
                const data = await response.json();
                console.log(data);
                const booksList = Object.values(data.data.list);
                setBooks(booksList);
                setAllBooks(booksList);
            } catch (err) {
                console.log(err);
            }
        };

        fetchBooks();
    }, []);

    const performSearch = () => {
        const fetchFilteredBooks = async () => {
            try {
                const payload = `
                {
                    search(title: "${searchTerm}")
                    {
                        id
                        title
                        author
                        release_date
                        description
                    }
                }`;

                const response = await fetch(`/graphql`, {
                    method: 'POST',
                    body: payload,
                    headers: {
                        'Content-Type': 'application/graphql',
                    },
                });
                const data = await response.json();
                const booksList = Object.values(data.data.search);
                setBooks(booksList);
            } catch (err) {
                console.log(err);
            }
        };

        fetchFilteredBooks();
    };

    const handleChange = (event) => {
        event.preventDefault();

        const value = event.target.value;
        setSearchTerm(value);

        if (value.length > 2) {
            performSearch();
        } else {
            setBooks(allBooks);
        }
    };

    return (
        <div>
            <h2>GraphQL</h2>
            <hr/>
            <form onSubmit={handleChange}>
                <Input
                    title="Search"
                    type="search"
                    name="search"
                    className="form-control"
                    value={searchTerm}
                    onChange={handleChange}
                />
            </form>

            {books ?
                <>
                    <BooksList books={books} linkPrefix={'/library/'}/>
                </>
                : <p>There are no books</p>
            }
        </div>
    );
}

GraphQLPage.propTypes = {};

export default GraphQLPage;