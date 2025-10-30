import { useEffect } from 'react';
import LoginRegister from '../components/LoginRegister.tsx';
import LoginImage from '../resources/pictures/login.jpeg'

function LoginRegisterPage() {
    useEffect(() => {
        document.body.style.backgroundImage = `url(${LoginImage})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundColor = "var(--muted3)";
        document.body.style.backgroundBlendMode = "multiply";
        document.body.style.minHeight = "100vh";
        return() => 
            {
                document.body.classList.remove('style')
            };
    }, []);
    
    return (
        <div>
            <LoginRegister />
        </div>
    );
};
export default LoginRegisterPage;