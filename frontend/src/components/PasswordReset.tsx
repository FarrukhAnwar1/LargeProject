import React from "react";
import { Card } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

function PasswordReset() {
    const navigate = useNavigate();
    const goToLogin = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        navigate('/');
    }

  return (
    <div>
        <Card>
            <div className='text-center'>
                <strong className='text-2xl font-bold'>Reset Password</strong>
            </div>

            <div className="login-input pt-5">
                <p>Resetting password for:</p>
                <p className="text-xl font-bol">Debug: Email Here</p>
            </div>
            <div className="login-input pt-4">
                <p>New Password:</p>
                <input
                    className='p-2'
                    type="text"
                    id="new-password"
                    name="new-password"
                    placeholder="New Password"
                />
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
    </div>
  );
}
export default PasswordReset;