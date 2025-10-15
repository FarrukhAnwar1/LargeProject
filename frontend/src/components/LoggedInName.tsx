import { deleteToken } from "../tokenStorage";
import { useNavigate } from 'react-router-dom';

function LoggedInName() {
    const navigate = useNavigate();
    function getCurrentUserName() {
        const data = JSON.parse(localStorage.getItem('user_data') || '');
        return data.firstName + ' ' + data.lastName;
    }
    function doLogout(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();
        localStorage.removeItem('user_data');
        deleteToken();
        navigate('/');
    };
    return (
        <div id="loggedInDiv">
            <span id="userName">Logged In As {getCurrentUserName()} </span><br />
            <button type="button" id="logoutButton" className="buttons"
                onClick={doLogout}> Log Out </button>
        </div>
    );
};
export default LoggedInName;