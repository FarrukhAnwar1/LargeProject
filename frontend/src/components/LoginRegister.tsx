import React, { useState } from 'react';
import { buildPath } from '../Path';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
// Currently commented out since JWT is not returned to frontend and is only stored as a cookie
// import { storeToken } from '../TokenStorage';
// import { jwtDecode } from 'jwt-decode';
// import { type TokenPayload } from '../Types';

function LoginRegister() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const doLogin = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        try {
            const payload = {
                email: form.email,
                password: form.password
            };

            const response = await axios.post(buildPath('api/auth/login'), payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            const res = response.data;
            if (!res.success) return setMessage(res.message);
            
            // Currently commented out since JWT is not returned to frontend and is only stored as a cookie
            // const accessToken = res.accessToken;
            // if (!accessToken || typeof accessToken !== 'string')
            //     return setMessage('Login failed: invalid token from server');

            // storeToken(res);

            // const decoded = jwtDecode<TokenPayload>(accessToken);
            // const userId = decoded?.userId ?? decoded?.iat;
            // const firstName = decoded?.firstName ?? '';
            // const lastName = decoded?.lastName ?? '';

            // if (!userId || userId <= 0) {
            //     return setMessage('Email/Password combination incorrect');
            // }

            // const user = { firstName, lastName, userId };
            // localStorage.setItem('user_data', JSON.stringify(user));
            setMessage('');
            navigate('/cars');
        } catch (err) {
            console.error(err);
            if (err instanceof AxiosError && err?.response?.data.message ) {
                setMessage(err.response.data.message);
                return;
            }
            setMessage('An error occurred while logging in.');
        }
    };

    return (
        <div className="card" id="loginDiv">
            <div className='text-center'>
                <strong className='text-2xl font-bold'>Log In</strong>
            </div>
            <div className="login-input pt-4">
                <p className=''>Email:</p>
                <input
                    className='p-2'
                    type="text"
                    id="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    />
            </div>
            <br />
            <div className="login-input !pb-0">
            Password:
            <br />
            <input
                className="p-2"
                type="password"
                id="loginPassword"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                />
            </div>
            <div className='text-right'>
                <a href='' className='font-medium text-[var(--primary)] hover:underline'>Forgot Password?</a>
            </div>

            <div className='pt-10'>
                <button
                    className='w-full bg-linear-65 from-[var(--primary)] to-[var(--muted)]'
                    type="submit"
                    id="loginButton"
                    value="Do It"
                    onClick={doLogin}
                >Login</button>
            </div>
            <br/>
            <div className='text-center'>
                <span id="loginResult" className='font-medium text-[var(--error-text)]'>{message}</span>
            </div>
            <div className='text-center pt-4'>
                <p className='font-medium'>Don't have an account?</p>
                <button
                    className='!px-20 bg-linear-65 from-[var(--muted2)] to-[var(--muted)]'
                    type="submit"
                    id="signupLinkButton"
                    value="Do It"
                >Sign Up</button>
            </div>
        </div>
    );
}

export default LoginRegister;
