import React, { useState } from 'react';
import axios from 'axios';
import { buildPath } from '../utils/Path';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState<boolean>(false);
    

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setMessage('');
        setErrors([]);

        const errs: string[] = [];
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.push('Valid email is required.');
        if (errs.length) {
            setErrors(errs);
            return;
        }

        setLoading(true);
        try {
            const payload = { 
                email: email.trim(), 
            };
            const res = await axios.post(buildPath('api/auth/forgot-password'), payload, { 
                headers: { 'Content-Type': 'application/json' } 
            });
            if (res?.status === 200 || res?.data?.success) {
                setEmailSent(true);
                setMessage(res?.data?.message || "Password reset email sent successfully. Check your email to reset your password.");
                
            } else {
                setEmailSent(false);
                setMessage(res?.data?.message || 'Password reset email failed to send.');
            }
        } catch (err: unknown) {
            console.error(err);
            let msg = 'Password reset email failed to send.';
            if (axios.isAxiosError(err)) {
                type RespShape = { data?: { message?: string } };
                msg = (err.response as RespShape)?.data?.message || err.message || msg;
            } else if (err instanceof Error) {
                msg = err.message;
            }
            setEmailSent(false);
            setMessage(msg);
        } finally {
            setLoading(false);
        }
    }

    const goToLogin = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        navigate('/');
    }

  return (
    <form className="card" id="forgotPasswordDiv" onSubmit={handleSubmit}>
            <div className='text-center'>
                <strong className='text-2xl font-bold'>Forgot Password?</strong>
            </div>

            <div className="login-input pt-4">
                <p>Email:</p>
                <input
                    className='p-2'
                    type="text"
                    id="forgotPasswordEmail"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </div>

            {errors.length > 0 && (
                <div className='text-left text-sm text-[var(--error-text)] pt-4'>
                    <ul>
                        {errors.map((e, i) => <li key={i}>• {e}</li>)}
                    </ul>
                </div>
            )}
            <div className='text-center'>
                <span id="loginResult" className='font-medium text-[var(--error-text)]'>{message}</span>
            </div>

            <div className='pt-10'>
                <button
                    className='w-full bg-linear-65 from-[var(--primary)] to-[var(--muted)]'
                    type="submit"
                    value="Submit"
                    id="resetPasswordButton"
                >
                    Send Password Reset to Email
                </button>
            </div>

            <div className='flex flex-col sm:flex-row justify-center items-center gap-8 pt-8'>
                {/* Back to Login */}
                <div className='flex flex-col items-center w-48'>
                    <p className='font-medium text-center mb-2'>Remember Password?</p>
                    <button
                        className='w-full bg-linear-65 from-[var(--muted2)] to-[var(--muted)]'
                        onClick={goToLogin}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
            
    </form>
  );
}
export default ForgotPassword;