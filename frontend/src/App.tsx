import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import './App.css';
import LoginRegisterPage from './pages/LoginRegisterPage';
import CarsPage from './pages/CarsPage';
import Navbar from './components/Navbar';
import VerificationPage from './pages/VerificationPage';
import MobileDownloadPage from './pages/MobileDownloadPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
function App() {
    return (
        <div>
            <Navbar />
            <Router >
                <Routes>
                    <Route path="/" element={<LoginRegisterPage />} />
                    <Route path="/cars" element={<CarsPage />} />
                    <Route path="/verify" element={<VerificationPage />} />
                    <Route path="/mobile" element={<MobileDownloadPage />} />
                    <Route path="/reset" element={<ResetPasswordPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </div>
    );
}
export default App;