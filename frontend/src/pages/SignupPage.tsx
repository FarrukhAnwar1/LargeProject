import Signup from '../components/Signup.tsx';
import SignupImage from '../resources/pictures/register.jpg'
const SignupPage = () => {
    return (
        <div>
            <body style={{backgroundImage: `url(${SignupImage})`}} className='!bg-[var(--muted3)] bg-[url(src/resources/pictures/login.jpeg)] bg-cover bg-center bg-blend-multiply'></body>
            <Signup />
        </div>
    );
};
export default SignupPage;