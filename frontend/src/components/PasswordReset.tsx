import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { buildPath } from '../utils/Path';
import { Card } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

type PasswordResetProps = {
    passwordResetToken?: string;
};


function PasswordReset({passwordResetToken} : PasswordResetProps) {
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [countdown, setCountdown] = useState<number>(10);
    const [resetSuccess, setResetSuccess] = useState<boolean>(false);
    const redirectIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            if (redirectIntervalRef.current) clearInterval(redirectIntervalRef.current);
        };
    }, []);

    const goToLogin = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        navigate('/');
    }
    const submitPasswordReset = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setMessage('');
        setErrors([]);

        const errs: string[] = [];
        if (!password || password.length < 6) errs.push('Password must be at least 6 characters.');
        if (errs.length) {
            setErrors(errs);
            return;
        }
        try {
            const payload = { 
                token: passwordResetToken, 
                password: password,
            };
            const res = await axios.post(buildPath(`api/auth/reset-Password/${passwordResetToken}`), payload, { 
                headers: { 'Content-Type': 'application/json' } 
            });
            if (res?.status === 200 || res?.data?.success) {
                setResetSuccess(true);
                setMessage(res?.data?.message || "Password reset successfully. Please return to login.");
                setCountdown(10);
                // start 10s countdown then redirect to login
                let t = 10;
                if (redirectIntervalRef.current) clearInterval(redirectIntervalRef.current);
                redirectIntervalRef.current = setInterval(() => {
                    t -= 1;
                    setCountdown(t);
                    if (t <= 0) {
                        if (redirectIntervalRef.current) clearInterval(redirectIntervalRef.current);
                        navigate('/');
                    }
                }, 1000);
                
            } else {
                setResetSuccess(false);
                setMessage(res?.data?.message || 'Password failed to reset.');
            }
        } catch (err: unknown) {
            console.error(err);
            let msg = 'Password failed to reset.';
            if (axios.isAxiosError(err)) {
                type RespShape = { data?: { message?: string } };
                msg = (err.response as RespShape)?.data?.message || err.message || msg;
            } else if (err instanceof Error) {
                msg = err.message;
            }
            setResetSuccess(false);
            setMessage(msg);
        }

    }

  return (
    <form onSubmit={submitPasswordReset}>
        <Card>
            <div className='text-center'>
                <strong className='text-2xl font-bold'>Reset Password</strong>
            </div>

            <div className="login-input pt-4">
                <p>New Password:</p>
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
            {errors.length > 0 && (
                <div className='text-left text-sm text-[var(--error-text)] pt-4'>
                    <ul>
                        {errors.map((e, i) => <li key={i}>• {e}</li>)}
                    </ul>
                </div>
            )}
            <div className='text-center'>
                <span id="loginResult" className='font-medium text-[var(--error-text)]'>{message}</span>
                {resetSuccess && (
                    <div className='text-sm text-[var(--muted-text)] pt-2'>Redirecting to login in {countdown}s...</div>
                )}
            </div>
            <div className='pt-10'>
                <button
                    className='w-full bg-linear-65 from-[var(--primary)] to-[var(--muted)]'
                    type="submit"
                    id="resetPasswordButton"
                    value="Do It"
                >
                    Reset Password
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
            
        </Card>
    </form>
  );
}
export default PasswordReset;