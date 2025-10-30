import LoginRegister from '../components/LoginRegister.tsx';

const LoginRegisterPage = () => {
    return (
        <div>
            <body className='!bg-[var(--muted3)] bg-[url(src/resources/pictures/login.jpeg)] bg-cover bg-center bg-blend-multiply'></body>
            <LoginRegister />
        </div>
    );
};
export default LoginRegisterPage;