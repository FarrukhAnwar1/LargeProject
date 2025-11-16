import React, { useState } from 'react';
import { buildPath } from '../utils/Path';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
// import { storeToken } from '../utils/TokenStorage';
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

            setMessage('');
            navigate('/cars');
        } catch (err) {
            console.error(err);
            if (err instanceof AxiosError && err?.response?.data.message) {
                setMessage(err.response.data.message);
                return;
            }
            setMessage('An error occurred while logging in.');
        }
    };

    const goToRegister = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        navigate('/register');
    };

    const goToForgotPassword = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        navigate('/reset-password');;
    };


    return (
        <div className="card" id="loginDiv">
            <div className='text-center'>
                <strong className='text-2xl font-bold'>Log In</strong>
            </div>

            <div className="login-input pt-4">
                <p>Email:</p>
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

            <div className='text-right mt-1.5'>
                <a href={"#"} onClick={goToForgotPassword} className='font-medium text-[var(--primary)] hover:underline'>Forgot Password?</a>
            </div>

            <div className='pt-10'>
                <button
                    className='w-full bg-linear-65 from-[var(--primary)] to-[var(--muted)]'
                    type="submit"
                    id="loginButton"
                    value="Do It"
                    onClick={doLogin}
                >
                    Login
                </button>
            </div>

            <br />

            <div className='text-center'>
                <span id="loginResult" className='font-medium text-[var(--error-text)]'>{message}</span>
            </div>

            {/* Sign Up + Download App Section */}
            <div className='flex flex-col sm:flex-row justify-center items-center gap-8 pt-8'>
                {/* Sign Up Section */}
                <div className='flex flex-col items-center w-48'>
                    <p className='font-medium text-center mb-2'>Don't have an account?</p>
                    <button
                        className='w-full bg-linear-65 from-[var(--muted2)] to-[var(--muted)]'
                        type="submit"
                        id="signupLinkButton"
                        value="Do It"
                        onClick={goToRegister}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Download App Section */}
                <div className='flex flex-col items-center w-48'>
                    <p className='font-medium text-center mb-2'>On mobile?</p>
                    <button
                        className='w-full bg-linear-65 from-[var(--muted2)] to-[var(--muted)]'
                        onClick={() => window.open('https://drive.google.com/drive/folders/1qNT9l-qq3Bt2LJlFM_ufYQ1XsjS6vdxv', '_blank')}
                    >
                        Download the App
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginRegister;
