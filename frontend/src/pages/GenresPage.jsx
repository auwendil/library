import { Link, useOutletContext } from 'react-router-dom';
import BooksList from '../components/BooksList.jsx';
import styles from './GenresPage.module.scss';

import React, { useEffect, useState } from 'react';

function GenresPage() {
    const [books, setBooks] = useState([]);
    const [booksByGenre, setBooksByGenre] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);

    const { genres } = useOutletContext();

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
                setBooksByGenre(data);
            } catch (err) {
                console.log(err);
            }
        };

        const allGenresSelected = [];
        genres.forEach(g => allGenresSelected.push({ id: g.id, name: g.genre, selected: true }));
        setSelectedGenres(allGenresSelected);

        fetchBooks();
    }, []);

    useEffect(() => {
        const selectedGenreIds = selectedGenres.filter(g => g.selected).map(g => g.id);
        console.log(selectedGenreIds);
        const filteredBooks = books.filter(b => b.genres_array.some(el => selectedGenreIds.includes(el)));
        console.log('FILTERED BOOKS ');
        console.log(filteredBooks);
        setBooksByGenre(filteredBooks);
    }, [selectedGenres]);

    const handleGenreClick = (id) => (event) => {
        console.log(id);
        setSelectedGenres(prevState => {
            const newGenres = [...prevState];
            const editedGenreIndex = newGenres.findIndex(g => g.id === id);
            newGenres[editedGenreIndex] = {
                ...newGenres[editedGenreIndex],
                selected: !newGenres[editedGenreIndex].selected,
            };
            return newGenres;
        });
    };

    const handleClearGenres = () => {
        setSelectedGenres(prevState => {
            const newGenres = [];
            prevState.forEach(g => newGenres.push({ id: g.id, name: g.name, selected: false }));
            return newGenres;
        });
    };

    const handleSelectAllGenres = () => {
        setSelectedGenres(prevState => {
            const newGenres = [];
            prevState.forEach(g => newGenres.push({ id: g.id, name: g.name, selected: true }));
            return newGenres;
        });
    };

    return (
        <div>
            <h2>Genres</h2>

            <div className="container">
                <div>
                    {selectedGenres.map(genre => (
                        <span key={genre.id}
                              className={genre.selected ? 'badge bg-primary ' + styles.btn : 'badge bg-secondary ' + styles.btn}
                              onClick={handleGenreClick(genre.id)}>{genre.name}</span>
                    ))}
                </div>

                <div>
                    <span className={'badge bg-danger ' + styles.btn} onClick={handleSelectAllGenres}>
                        Select all
                    </span>
                    <span className={'badge bg-danger ' + styles.btn} onClick={handleClearGenres}>
                        Clear all
                    </span>
                </div>
            </div>

            <hr/>

            <BooksList books={booksByGenre} linkPrefix={'/library/'}/>

        </div>
    );
}

GenresPage.propTypes = {};

export default GenresPage;