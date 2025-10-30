import { useEffect } from 'react';
import Signup from '../components/Signup.tsx';
import SignupImage from '../resources/pictures/register.jpg'
const SignupPage = () => {
    useEffect(() => {
        document.body.style.backgroundImage = `url(${SignupImage})`;
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
            <Signup />
        </div>
    );
};
export default SignupPage;