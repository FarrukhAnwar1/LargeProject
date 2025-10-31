import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { buildPath } from '../Path';

function Signup(){
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<string[]>([]);

    const goToLogin = (event?: React.MouseEvent<HTMLButtonElement>) => {
            event?.preventDefault();
            navigate('/');
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setMessage('');
        setErrors([]);

        const errs: string[] = [];
        if (!firstName.trim()) errs.push('First name is required.');
        if (!lastName.trim()) errs.push('Last name is required.');
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.push('Valid email is required.');
        if (!password || password.length < 6) errs.push('Password must be at least 6 characters.');

        if (errs.length) {
            setErrors(errs);
            return;
        }

        setLoading(true);
        try {
            const payload = { email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim(), companyName: 'N/A', password };
            const res = await axios.post(buildPath('api/auth/signup'), payload, { headers: { 'Content-Type': 'application/json' } });
            if (res?.status === 201 || res?.data?.success) {
                setMessage('Registration successful. Check your email for verification. Redirecting to login...');
                setTimeout(() => navigate('/'), 1500);
            } else {
                setMessage(res?.data?.message || 'Registration completed.');
            }
        } catch (err: unknown) {
            console.error(err);
            let msg = 'Registration failed.';
            if (axios.isAxiosError(err)) {
                type RespShape = { data?: { message?: string } };
                msg = (err.response as RespShape)?.data?.message || err.message || msg;
            } else if (err instanceof Error) {
                msg = err.message;
            }
            setMessage(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="card" id="loginDiv" onSubmit={handleSubmit}>
            <div className='text-center'>
                <strong className='text-2xl font-bold'>Sign Up</strong>
            </div>
            <div className="flex">
                <div className="login-input !w-[50%] mr-1 pt-4">
                    <label className=''>First Name:</label>
                    <input
                        className='p-2'
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="First Name"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        />
                </div>
                <div className="login-input !w-[50%] ml-1 pt-4">
                    <label className=''>Last Name:</label>
                    <input
                        className='p-2'
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        />
                </div>
            </div>
            <div className="pt-4">
                <div className="login-input !pb-0">
                <label>Email:</label>
                <br />
                <input
                    className="p-2"
                    type="email"
                    id="signupEmail"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    />
                </div>
            </div>
            <div className="pt-4">
                <div className="login-input !pb-0">
                <label>Password:</label>
                <br />
                <input
                    className="p-2"
                    type="password"
                    id="signupPassword"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    />
                </div>
            </div>

            {errors.length > 0 && (
                <div className='text-left text-sm text-[var(--error-text)] pt-4'>
                    <ul>
                        {errors.map((e, i) => <li key={i}>• {e}</li>)}
                    </ul>
                </div>
            )}

            <div className='pt-6'>
                <button
                    className='w-full bg-linear-65 from-[var(--primary)] to-[var(--muted)]'
                    type="submit"
                    id="registerButton"
                    disabled={loading}
                >{loading ? 'Registering...' : 'Register Account'}</button>
            </div>
            <br/>
            <div className='text-center '>
                <span id="registerResult" className='font-medium text-[var(--error-text)]'>{message}</span>
            </div>
            <div className='text-center pt-4'>
                <p className='font-medium'>Already have an account?</p>
                <button
                    className='!px-20 bg-linear-65 from-[var(--muted2)] to-[var(--muted)]'
                    type="button"
                    id="signupLinkButton"
                    onClick={goToLogin}
                >Log In</button>
            </div>
        </form>
    );
}

export default Signup;