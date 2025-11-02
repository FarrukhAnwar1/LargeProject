import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { buildPath } from '../Path';

type VerificationProps = {
    verificationToken?: string;
};

const Verification = ({ verificationToken }: VerificationProps) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState<string>('Verifying...');
    const [loading, setLoading] = useState<boolean>(true);
    const [verified, setVerified] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(5);

    const tokenFromQuery = searchParams.get('code') || searchParams.get('token');
    const token = verificationToken || tokenFromQuery;

    useEffect(() => {
        if (!token) {
            setMessage('No verification token provided.');
            setLoading(false);
            return;
        }

        let intervalId: ReturnType<typeof setInterval> | null = null;

        (async () => {
            setLoading(true);
            setMessage('Verifying your email...');
            try {
                const res = await axios.post(buildPath('api/auth/verify-email'), { code: token }, { headers: { 'Content-Type': 'application/json' } });
                if (res?.data?.success) {
                    setMessage(res.data.message || 'Email verified successfully.');
                    setVerified(true);
                    setCountdown(5);
                    // start countdown to redirect
                    let t = 5;
                    intervalId = setInterval(() => {
                        t -= 1;
                        setCountdown(t);
                        if (t <= 0) {
                            if (intervalId) clearInterval(intervalId);
                            navigate('/');
                        }
                    }, 1000);
                } else {
                    setMessage(res?.data?.message || 'Verification failed.');
                }
            } catch (err: unknown) {
                console.error('Verification error:', err);
                let errMsg = 'Verification failed due to an error.';
                if (axios.isAxiosError(err)) {
                    type Resp = { data?: { message?: string } };
                    errMsg = (err.response as Resp)?.data?.message || err.message || errMsg;
                } else if (err instanceof Error) {
                    errMsg = err.message;
                }
                setMessage(errMsg);
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [token, navigate]);

    const msgClass = !loading ? (verified ? 'text-[var(--success)]' : 'text-[var(--error-text)]') : '';
    const buttonLabel = verified ? 'Go to Login' : 'Go to Register';
    const buttonAction = () => navigate(verified ? '/' : '/register');

    return (
        <div className="card" id="verifyDiv">
            <div className='text-center'>
                <strong className='text-2xl font-bold'>Email Verification</strong>
            </div>

            <div className='pt-6 text-center'>
                <div className={`text-md ${msgClass}`}>{loading ? 'Please wait...' : message}</div>
                {verified && (
                    <div className='text-sm text-[var(--muted-text)] pt-2'>Redirecting to login in {countdown}s...</div>
                )}
            </div>

            <div className='pt-6'>
                <button
                    className={`w-full bg-linear-65 from-[var(--primary)] to-[var(--muted)]`}
                    type='button'
                    onClick={buttonAction}
                >{buttonLabel}</button>
            </div>
        </div>
    );
};

export default Verification;