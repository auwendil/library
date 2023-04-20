import { useNavigate, useOutletContext } from 'react-router-dom';
import Input from '../components/form/Input.jsx';
import styles from './LoginPage.module.scss';

import React, { useState } from 'react';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { setJwtToken, setAlertClassName, setAlertMessage, toggleRefresh } = useOutletContext();
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();

        const fetchAuth = async () => {
            const payload = {
                email: email,
                password: password,
            };

            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            };

            try {
                const response = await fetch(`/auth`, requestOptions);
                const data = await response.json();

                if (data.error) {
                    setAlertClassName('alert-danger');
                    setAlertMessage(data.message);
                } else {
                    setJwtToken(data.access_token);
                    setAlertClassName('d-none');
                    setAlertMessage('');
                    toggleRefresh(true);
                    navigate('/');
                }
            } catch (err) {
                console.log(err.toString());
                setAlertClassName('alert-danger');
                setAlertMessage(err.toString());
            }
        };

        fetchAuth();
    };

    return (
        <div className="col-md-6 offset-md-3">
            <h2>Login</h2>
            <hr/>

            <form onSubmit={handleSubmit}>
                <Input
                    name="email"
                    className="form-control"
                    title="Email"
                    type="email"
                    autoComplete="email-new"
                    onChange={(event) => setEmail(event.target.value)}
                />

                <Input
                    name="password"
                    className="form-control"
                    title="Password"
                    type="password"
                    autoComplete="password-new"
                    onChange={(event) => setPassword(event.target.value)}
                />

                <input
                    type="submit"
                    className={'btn btn-primary ' + styles.btn}
                    value="Login"
                />
            </form>
        </div>
    );
}

LoginPage.propTypes = {};

export default LoginPage;