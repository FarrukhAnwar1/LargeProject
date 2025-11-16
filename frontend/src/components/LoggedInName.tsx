import { useState } from "react";

import { deleteToken } from "../utils/TokenStorage";
import { useNavigate } from 'react-router-dom';

function LoggedInName() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    
    function doLogout(event: React.MouseEvent<HTMLDivElement>): void {
        event.preventDefault();
        localStorage.removeItem('user_data');
        deleteToken();
        navigate('/');
    };
    return (
        <div className="relative w-full inline-block text-left m-4">
            <div className="absolute right-8 -top-2 ">
            {/* Profile Picture */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border-2 bg-gray-100 border-gray-300 hover:border-gray-500 focus:outline-none cursor-pointer"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-6 h-6 text-red-600"
                        >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                        />
                    </svg>

                </div>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div
                        onClick={doLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                        Log Out
                    </div>
                    </div>
                )}
            </div>
        </div>
        
    );
};
export default LoggedInName;