import './App.css';
import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Alert from './components/Alert.jsx';
import Navigation from './components/Navigation.jsx';
import styles from './App.module.scss';

const TEN_MINUTES_INTERVAL = 10 * 60 * 1 * 1000;

function App(props) {
    const [jwtToken, setJwtToken] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertClassName, setAlertClassName] = useState('d-none');
    const [genres, setGenres] = useState([]);

    const [tickIntervalId, setTickIntervalId] = useState(-1);

    const toggleRefresh = useCallback(
        (status) => {
            if (status) {
                const intervalId = setInterval(() => {
                    refreshToken(() => {
                    });
                }, TEN_MINUTES_INTERVAL);
                setTickIntervalId(intervalId);
            } else {
                clearInterval(tickIntervalId);
                setTickIntervalId(-1);
            }
        },
        [tickIntervalId],
    );

    useEffect(() => {
        if (jwtToken === '') {
            refreshToken(() => toggleRefresh(true));
        }
    }, [jwtToken, toggleRefresh]);

    useEffect(() => {
        const fetchGenres = async () => {
            const response = await fetch('/genres', {
                method: 'GET',
            });
            const data = await response.json();
            console.log(data);
            setGenres(data);
        };

        fetchGenres();
    }, []);


    const refreshToken = async (onSuccess) => {
        try {
            const response = await fetch('/refresh', {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();

            if (data.access_token) {
                setJwtToken(data.access_token);
                onSuccess();
            }
        } catch (err) {
            console.log('user is logged out');
        }
    };

    const logout = () => {
        const fetchLogout = async () => {
            try {
                await fetch(`/logout`, {
                    method: 'GET',
                    credentials: 'include',
                });
            } catch (err) {
                console.log('Error occurred while logging out', err);
            } finally {
                setJwtToken('');
                toggleRefresh(false);
            }
        };

        fetchLogout();
    };

    return (
        <div className="container">
            <div className={'row ' + styles.topBar}>
                <div className="col">
                    <Link to="/" className={styles.homeLink}><h1>LIBRARY</h1></Link>
                </div>
                <div className="col text-end">
                    {jwtToken === ''
                        ? <Link to="/login">
                            <button className={'btn btn-success ' + styles.btn}>Login</button>
                        </Link>
                        : <button onClick={logout} className={'btn btn-danger ' + styles.btn}>Logout</button>
                    }
                </div>
                <hr className="mb-3"/>
            </div>

            <div className="row">
                <Navigation
                    jwtToken={jwtToken}
                />
            </div>

            <div className="row">
                <hr/>
            </div>

            <div className="row">
                <Alert className={alertClassName}>
                    {alertMessage}
                </Alert>

                <Outlet context={{
                    jwtToken,
                    setJwtToken,
                    genres,
                    setAlertMessage,
                    setAlertClassName,
                    toggleRefresh,
                }}/>
            </div>
        </div>
    );
}

export default App;
