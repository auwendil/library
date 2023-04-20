import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import BooksList from '../components/BooksList.jsx';
import styles from './ManagePage.module.scss';

import React, { useEffect, useState } from 'react';

function ManagePage() {
    const [books, setBooks] = useState([]);
    const { jwtToken } = useOutletContext();

    const navigate = useNavigate();

    useEffect(() => {
        if (jwtToken === '') {
            navigate('/login');
            return;
        }

        const fetchBooks = async () => {
            try {
                const response = await fetch(`/admin/library`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwtToken,
                    },
                });
                const data = await response.json();
                setBooks(data);
            } catch (err) {
                console.log(err);
            }
        };

        fetchBooks();
    }, [jwtToken, navigate]);

    return (
        <div>
            <h2>Books Library</h2>

            <BooksList books={books} linkPrefix={'/admin/library/'}/>
            {/*<table className="table table-dark table-striped table-hover">*/}
            {/*    <thead>*/}
            {/*    <tr>*/}
            {/*        <th>Book</th>*/}
            {/*        <th>Author</th>*/}
            {/*        <th>Release date</th>*/}
            {/*    </tr>*/}
            {/*    </thead>*/}
            {/*    <tbody>*/}
            {/*    {books.map(el => (*/}
            {/*        <tr key={el.id}>*/}
            {/*            <td>*/}
            {/*                <Link to={`/admin/library/${el.id}`}>{el.title}</Link>*/}
            {/*            </td>*/}
            {/*            <td>{el.author}</td>*/}
            {/*            <td>{el.releaseDate}</td>*/}
            {/*        </tr>*/}
            {/*    ))}*/}
            {/*    </tbody>*/}
            {/*</table>*/}
        </div>
    );
}

ManagePage.propTypes = {};

export default ManagePage;