import { Link, useOutletContext } from 'react-router-dom';
import BooksList from '../components/BooksList.jsx';
import styles from './BooksPage.module.scss';

import React, { useEffect, useState } from 'react';

function BooksPage() {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch(`/library`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setBooks(data);
            } catch (err) {
                console.log(err);
            }
        };

        fetchBooks();
    }, []);

    return (
        <div>
            <h2>Your library</h2>
            <BooksList books={books} linkPrefix={'/library/'}/>
        </div>
    );
}

BooksPage.propTypes = {};

export default BooksPage;