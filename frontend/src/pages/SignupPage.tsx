import { useEffect } from 'react';
import Signup from '../components/Signup.tsx';
import SignupImage from '../resources/pictures/register.jpg';

const SignupPage = () => {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Apply styles to both html and body for full coverage
    html.style.height = '100%';
    html.style.overflowX = 'hidden';
    html.style.overscrollBehavior = 'none';

    body.style.backgroundImage = `url(${SignupImage})`;
    body.style.backgroundRepeat = 'no-repeat';
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundColor = 'var(--muted3)';
    body.style.backgroundBlendMode = 'multiply';
    body.style.backgroundAttachment = 'fixed'; // keeps background anchored
    body.style.overflowX = 'hidden';
    body.style.minHeight = '100vh';
    body.style.margin = '0';

    // Cleanup on component unmount
    return () => {
      body.removeAttribute('style');
      html.removeAttribute('style');
    };
  }, []);

  return (
    <div>
      <Signup />
    </div>
  );
};

export default SignupPage;
