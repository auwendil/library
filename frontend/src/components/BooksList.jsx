import { Link } from 'react-router-dom';
import styles from './BooksList.module.scss';

import React from 'react';

function BooksList(props) {
    return (
        <table className="table table-dark table-striped table-hover">
            <thead>
            <tr>
                <th>Book</th>
                <th>Author</th>
                <th>Release date</th>
            </tr>
            </thead>
            <tbody>
            {props.books.map(el => (
                <tr key={el.id}>
                    <td>
                        <Link to={`${props.linkPrefix}${el.id}`}>{el.title}</Link>
                    </td>
                    <td>{el.author}</td>
                    <td>{el.releaseDate}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

BooksList.propTypes = {};

export default BooksList;