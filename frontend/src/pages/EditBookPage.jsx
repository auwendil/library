import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import CheckBox from '../components/form/CheckBox.jsx';
import Input from '../components/form/Input.jsx';
import TextArea from '../components/form/TextArea.jsx';
import styles from './EditBookPage.module.scss';

import React, { useEffect, useState } from 'react';

const BOOK_TEMPLATE = {
    id: 0,
    title: '',
    author: '',
    releaseDate: '',
    description: '',
    genres_array: [],
};

function EditBookPage() {
    const [networkError, setNetworkError] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [book, setBook] = useState(BOOK_TEMPLATE);

    const { jwtToken, genres } = useOutletContext();
    let { id } = useParams();
    const navigate = useNavigate();

    if (id === undefined) {
        id = 0;
    }

    useEffect(() => {
        if (jwtToken === '') {
            navigate('/login');
            return;
        }
    }, [jwtToken, navigate]);

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

            if (data.error) {
                return;
            }

            if (!data.hasOwnProperty('genres')) {
                data.genres_array = [];
            }
            setBook(data);
        };

        if (isInInsertMode()) {
            setBook(BOOK_TEMPLATE);
        } else {
            fetchBook(id);
        }
    }, [id]);

    const isInInsertMode = () => {
        return id === undefined || id === 0;
    };

    const handleCheck = (event, genreId) => {
        let newGenresArray = [];
        if (event.target.checked && !book.genres_array.includes(genreId)) {
            newGenresArray = book.genres_array.concat(genreId);
        } else if (!event.target.checked && book.genres_array.includes(genreId)) {
            newGenresArray = book.genres_array.filter(id => id !== genreId);
        }
        setBook((prevState) => {
            return {
                ...book,
                genres_array: newGenresArray,
            };
        });
    };

    const handleChange = () => (event) => {
        const value = event.target.value;
        const name = event.target.name;
        setBook({
            ...book,
            [name]: value,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    const handleSave = (event) => {
        const fetchAddBook = async (book) => {
            let method = 'PATCH';
            if (isInInsertMode()) {
                method = 'PUT';
            }

            const requestBody = {
                ...book,
                releaseDate: new Date(book.releaseDate),
            };

            try {
                const response = await fetch(`/admin/library/${book.id}`, {
                    method: method,
                    body: JSON.stringify(requestBody),
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwtToken,
                    },
                });
                const data = await response.json();
                if (data.error) {
                    console.log(data.error);
                    console.log(data.message);
                    setNetworkError(data.error);
                } else {
                    navigate('/admin/library');
                }
            } catch (err) {
                console.log(err);
                setNetworkError(err);
            }
        };

        const errors = [];
        const requiredFields = [
            { fieldValue: book.title, name: 'title' },
            { fieldValue: book.author, name: 'author' },
            { fieldValue: book.releaseDate, name: 'releaseDate' },
            { fieldValue: book.description, name: 'description' },
        ];

        requiredFields.forEach((obj) => {
            if (obj.fieldValue === '') {
                errors.push(obj.name);
            }
        });
        if (book.genres_array.length <= 0) {
            errors.push('genre');
        }
        setValidationErrors(errors);

        if (errors.length > 0) {
            return false;
        }

        fetchAddBook(book);
    };

    const handleDelete = (event) => {
        const fetchDeleteBook = async (bookId) => {
            try {
                const response = await fetch(`/admin/library/${bookId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Authorization': 'Bearer ' + jwtToken,
                    },
                });
                const data = await response.json();
                if (data.error) {
                    console.log(data.error);
                    console.log(data.message);
                    setNetworkError(data.error);
                } else {
                    navigate('/admin/library');
                }
            } catch (err) {
                console.log(err);
                setNetworkError(err);
            }
        };

        fetchDeleteBook(book.id);
    };

    const hasError = (key) => {
        return validationErrors.indexOf(key) !== -1;
    };

    return (
        <div className="col-md-10 offset-md-1">
            <h2>Add/Edit Book</h2>

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-9">
                        <input type="hidden" id="id" name="id" value={book.id}/>
                        <Input
                            className="form-control"
                            type="text"
                            name="title"
                            title="Title"
                            value={book.title}
                            onChange={handleChange('title')}
                            errorDiv={hasError('title') ? 'text-danger' : 'd-none'}
                            errorMsg={'Please enter a title'}
                        />
                        <Input
                            className="form-control"
                            type="text"
                            name="author"
                            title="Author"
                            value={book.author}
                            onChange={handleChange('author')}
                            errorDiv={hasError('author') ? 'text-danger' : 'd-none'}
                            errorMsg={'Please enter an author'}
                        />
                        <Input
                            className="form-control"
                            type="date"
                            name="releaseDate"
                            title="Release Date"
                            value={book.releaseDate}
                            onChange={handleChange('releaseDate')}
                            errorDiv={hasError('releaseDate') ? 'text-danger' : 'd-none'}
                            errorMsg={'Please enter a release date'}
                        />
                        <TextArea
                            className="form-control"
                            name="description"
                            title="Description"
                            value={book.description}
                            rows={3}
                            onChange={handleChange('description')}
                            errorDiv={hasError('description') ? 'text-danger' : 'd-none'}
                            errorMsg={'Please enter a description'}
                        />
                    </div>
                    <div className="col-md-3">
                        <p>Genres:</p>
                        {genres && genres.length > 1 && genres.map(genre => (
                            <CheckBox
                                key={genre.id}
                                name={genre.id}
                                title={genre.genre}
                                value={genre.genre}
                                checked={book.genres_array.includes(genre.id)}
                                onCheck={(event) => handleCheck(event, genre.id)}
                            />
                        ))}
                        {hasError('genre') &&
                            <div className={hasError('genre') ? 'text-danger' : 'd-none'}>
                                <p>Please set at least one genre</p>
                            </div>
                        }
                    </div>
                </div>
                <button className={'btn btn-primary ' + styles.btn} name="save" onClick={handleSave}>Save</button>
                {!isInInsertMode() &&
                    <button className={'btn btn-danger ms-3 ' + styles.btn} name="delete"
                            onClick={handleDelete}>Delete</button>
                }
            </form>
        </div>
    );
}

EditBookPage.propTypes = {};

export default EditBookPage;
