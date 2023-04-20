import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import './index.scss';
import BookPage from './pages/BookPage.jsx';
import BooksPage from './pages/BooksPage.jsx';
import EditBookPage from './pages/EditBookPage.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import GenresPage from './pages/GenresPage.jsx';
import GraphQLPage from './pages/GraphQLPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ManagePage from './pages/ManagePage.jsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>,
        errorElement: <ErrorPage/>,
        children: [
            { index: true, element: <BooksPage/> },
            { path: '/library', element: <BooksPage/> },
            { path: '/library/:id', element: <BookPage/> },
            { path: '/genres', element: <GenresPage/> },
            { path: '/graphql', element: <GraphQLPage/> },
            {
                path: '/admin',
                children: [
                    { path: 'library/0', element: <EditBookPage/> },
                    { path: 'library/:id', element: <EditBookPage/> },
                    { path: 'library', element: <ManagePage/> },
                ],
            },
            { path: '/login', element: <LoginPage/> },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router}></RouterProvider>
    </React.StrictMode>,
);
