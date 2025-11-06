import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { buildPath } from '../utils/Path';

type VerificationProps = {
    verificationToken?: string;
    type?: string;
};

// Module-level cache to prevent duplicate requests across component remounts
type VerificationResponse = {
    data?: {
        success?: boolean;
        message?: string;
    };
};

const verificationCache = new Map<string, Promise<VerificationResponse>>();

const Verification = ({ verificationToken, type = 'email' }: VerificationProps) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [message, setMessage] = useState('Verifying...');
    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const [countdown, setCountdown] = useState(5);

    // Derive token/type from query or props
    const tokenFromQuery = searchParams.get('code') || searchParams.get('token');
    const typeFromQuery = searchParams.get('type');
    const token = verificationToken || tokenFromQuery || '';
    const verificationType = typeFromQuery || type;

    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        if (!token) {
            setMessage('No verification token provided.');
            setLoading(false);
            return;
        }

        const cacheKey = `${token}-${verificationType}`;

        const verifyEmail = async () => {
            setLoading(true);
            setMessage(
                verificationType === 'admin'
                    ? 'Verifying company member...'
                    : 'Verifying your email...'
            );

            try {
                // Check if we already have a pending request for this token
                let requestPromise = verificationCache.get(cacheKey);

                if (!requestPromise) {
                    // Create new request and cache it
                    requestPromise = axios.get(
                        buildPath(`api/auth/verify/${token}?type=${verificationType}`),
                        {
                            headers: { 'Content-Type': 'application/json' },
                        }
                    );
                    verificationCache.set(cacheKey, requestPromise);

                    // Clear cache after request completes (success or failure)
                    requestPromise.finally(() => {
                        // Small delay to allow second mount to reuse the promise
                        setTimeout(() => verificationCache.delete(cacheKey), 100);
                    });
                }

                // Await the cached promise
                const res = await requestPromise;

                // Don't update state if component unmounted
                if (!mountedRef.current) return;

                if (res?.data?.success) {
                    setMessage(res.data.message || 'Email verified successfully.');
                    setVerified(true);
                    setLoading(false);
                } else {
                    setMessage(res?.data?.message || 'Verification failed.');
                    setLoading(false);
                }
            } catch (err: unknown) {
                // Don't update state if component unmounted
                if (!mountedRef.current) return;

                console.error('Verification error:', err);
                let errMsg = 'Verification failed due to an error.';

                if (axios.isAxiosError(err)) {
                    errMsg = err.response?.data?.message || err.message || errMsg;
                } else if (err instanceof Error) {
                    errMsg = err.message;
                }

                setMessage(errMsg);
                setLoading(false);
            }
        };

        verifyEmail();

        return () => {
            mountedRef.current = false;
        };
    }, [token, verificationType]);

    // Separate effect for countdown and redirect
    useEffect(() => {
        if (!verified) return;

        setCountdown(5);
        let timeLeft = 5;

        const intervalId = setInterval(() => {
            timeLeft -= 1;
            setCountdown(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(intervalId);
                navigate('/');
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [verified, navigate]);

    const msgClass = !loading
        ? (verified ? 'text-[var(--success)]' : 'text-[var(--error-text)]')
        : '';
    const buttonLabel = verified ? 'Go to Login' : 'Go to Register';
    const buttonAction = () => navigate(verified ? '/' : '/register');

    return (
        <div className="card" id="verifyDiv">
            <div className="text-center">
                <strong className="text-2xl font-bold">Email Verification</strong>
            </div>

            <div className="pt-6 text-center">
                <div className={`text-md ${msgClass}`}>
                    {loading ? 'Please wait...' : message}
                </div>
                {verified && (
                    <div className="text-sm text-[var(--muted-text)] pt-2">
                        Redirecting to login in {countdown}s...
                    </div>
                )}
            </div>

            <div className="pt-6">
                <button
                    className="w-full bg-linear-65 from-[var(--primary)] to-[var(--muted)]"
                    type="button"
                    onClick={buttonAction}
                >
                    {buttonLabel}
                </button>
            </div>
        </div>
    );
};

export default Verification;