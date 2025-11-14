import { useEffect } from 'react';
import LoginRegister from '../components/LoginRegister.tsx';
import LoginImage from '../resources/pictures/login.jpeg';

function LoginRegisterPage() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Apply background and overflow handling to both <html> and <body>
    html.style.height = '100%';
    html.style.overflowX = 'hidden';
    html.style.overscrollBehavior = 'none';

    body.style.backgroundImage = `url(${LoginImage})`;
    body.style.backgroundRepeat = 'no-repeat';
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundColor = 'var(--muted3)';
    body.style.backgroundBlendMode = 'multiply';
    body.style.backgroundAttachment = 'fixed';
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
    <main>
      <LoginRegister />
    </main>
  );
}

export default LoginRegisterPage;
