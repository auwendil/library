/**
 * Created by antares on 13.04.2023
 */

import {useRouteError} from 'react-router-dom';
import styles from './ErrorPage.module.scss';

import React from 'react';

function ErrorPage() {
    const error = useRouteError();

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <h1 className="mt-3">Error occurred.</h1>
                    <p>Sorry, something goes wrong here.</p>
                    <p>{error.statusText || error.message}</p>
                </div>
            </div>
        </div>
    );
}

ErrorPage.propTypes = {};

export default ErrorPage;