import LoginRegister from '../components/LoginRegister.tsx';
import LoginImage from '../resources/pictures/login.jpeg'

const LoginRegisterPage = () => {
    return (
        <div>
            <body style={{backgroundImage: `url(${LoginImage})`}} className='!bg-[var(--muted3)] bg-[url(src/resources/pictures/login.jpeg)] bg-cover bg-center bg-blend-multiply'></body>
            <LoginRegister />
        </div>
    );
};
export default LoginRegisterPage;