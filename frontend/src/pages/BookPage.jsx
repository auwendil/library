import { useOutletContext, useParams } from 'react-router-dom';
import styles from './BookPage.module.scss';

import React, { useEffect, useState } from 'react';

function BookPage(props) {
    const [book, setBook] = useState({
        genres_array: [],
    });
    const { id } = useParams();
    const { genres } = useOutletContext();

    useEffect(() => {
        const fetchBook = async (id) => {
            const response = await fetch(`/library/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            data.releaseDate = new Date(data.releaseDate).toISOString().split('T')[0];

            if (!data.hasOwnProperty('genres_array')) {
                data.genres_array = [];
            }
            setBook(data);
        };

        fetchBook(id);
    }, [id]);

    return (
        <div className="container">
            <div className={styles.titleBox}>
                <h2 className={styles.title}>{book.title}</h2>
                <small><em>{book.author} {book.releaseDate}</em></small>
                <br/>
                <small>
                    {genres.map(genre => {
                        if (book.genres_array.includes(genre.id)) {
                            return (
                                <span key={genre.id} className="badge bg-primary me-3">{genre.genre}</span>
                            );
                        }
                    })}
                </small>
            </div>
            <hr/>
            <div className={styles.descBox}>
                <p>{book.description}</p>
            </div>
        </div>
    );
}

BookPage.propTypes = {};

export default BookPage;