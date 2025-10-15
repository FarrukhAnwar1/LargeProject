import React, { useState } from 'react';
import { buildPath } from '../Path';
import { storeToken } from '../TokenStorage';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
function Login() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [loginName, setLoginName] = React.useState('');
    const [loginPassword, setPassword] = React.useState('');
    async function doLogin(event: React.MouseEvent<HTMLInputElement>): Promise<void> {
        event.preventDefault();
        const obj = { login: loginName, password: loginPassword };
        const js = JSON.stringify(obj);
        const config = {
            method: 'post',
            url: buildPath('api/login'),
            headers:
            {
                'Content-Type': 'application/json'
            },
            data: js
        };
        axios(config).then(function (response) {
            const res = response.data;
            // If server returned an error (e.g. incorrect credentials), show it and stop.
            if (res.error) {
                setMessage(res.error);
                return;
            }

            const accessToken = res.accessToken;
            if (!accessToken || typeof accessToken !== 'string') {
                setMessage('Login failed: invalid token from server');
                return;
            }

            storeToken(res);

            interface MyTokenPayload extends JwtPayload {
                firstName: string;
                lastName: string;
                userId?: number;
            }

            let decoded: MyTokenPayload | null = null;
            try {
                decoded = jwtDecode<MyTokenPayload>(accessToken);
            }
            catch (e) {
                console.log(e);
                setMessage('Failed to decode token');
                return;
            }

            const ud = decoded;
            const userId = ud?.userId ?? ud?.iat;
            const firstName = ud?.firstName ?? '';
            const lastName = ud?.lastName ?? '';

            if (!userId || userId <= 0) {
                setMessage('User/Password combination incorrect');
            }
            else {
                const user = { firstName: firstName, lastName: lastName, id: userId }
                localStorage.setItem('user_data', JSON.stringify(user));
                setMessage('');
                navigate("/cards");
            }
        }).catch(function (error) {
            console.log(error);
        });
    };
    function handleSetLoginName(e: React.ChangeEvent<HTMLInputElement>): void {
        setLoginName(e.target.value);
    }
    function handleSetPassword(e: React.ChangeEvent<HTMLInputElement>): void {
        setPassword(e.target.value);
    }
    return (
        <div id="loginDiv">
            <span id="inner-title">PLEASE LOG IN</span><br />
            Login: <input type="text" id="loginName" placeholder="Username"
                onChange={handleSetLoginName} /><br />
            Password: <input type="password" id="loginPassword" placeholder="Password"
                onChange={handleSetPassword} />
            <input type="submit" id="loginButton" className="buttons" value="Do It"
                onClick={doLogin} />
            <span id="loginResult">{message}</span>
        </div>
    );
};
export default Login;