import React, { useState } from 'react';
import { buildPath } from '../Path';
import { storeToken } from '../TokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MD5 from 'crypto-js/md5';
import { type TokenPayload } from '../Types';

function LoginRegister() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        loginName: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const doLogin = async (event: React.MouseEvent<HTMLInputElement>) => {
        event.preventDefault();

        try {
            const payload = {
                login: form.loginName,
                password: MD5(form.password).toString(),
            };

            const response = await axios.post(buildPath('api/login'), payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            const res = response.data;
            if (res.error) return setMessage(res.error);

            const accessToken = res.accessToken;
            if (!accessToken || typeof accessToken !== 'string')
                return setMessage('Login failed: invalid token from server');

            storeToken(res);

            const decoded = jwtDecode<TokenPayload>(accessToken);
            const userId = decoded?.userId ?? decoded?.iat;
            const firstName = decoded?.firstName ?? '';
            const lastName = decoded?.lastName ?? '';

            if (!userId || userId <= 0) {
                return setMessage('User/Password combination incorrect');
            }

            const user = { firstName, lastName, userId };
            localStorage.setItem('user_data', JSON.stringify(user));
            setMessage('');
            navigate('/cars');
        } catch (err) {
            console.error(err);
            setMessage('An error occurred while logging in.');
        }
    };

    return (
        <div id="loginDiv">
            <span id="inner-title">PLEASE LOG IN</span><br />
            Login:
            <input
                type="text"
                id="loginName"
                name="loginName"
                placeholder="Username"
                value={form.loginName}
                onChange={handleChange}
            /><br />
            Password:
            <input
                type="password"
                id="loginPassword"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
            />
            <input
                type="submit"
                id="loginButton"
                value="Do It"
                onClick={doLogin}
            />
            <span id="loginResult">{message}</span>
        </div>
    );
}

export default LoginRegister;
