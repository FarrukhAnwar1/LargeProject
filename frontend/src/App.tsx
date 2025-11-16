import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import LoginRegisterPage from './pages/LoginRegisterPage';
import CarsPage from './pages/CarsPage';
import Navbar from './components/Navbar';
import VerificationPage from './pages/VerificationPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ModifyCarPage from './pages/ModifyCarPage';
import ViewCar from './components/ViewCar';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
function App() {
    return (
        <div>
            <Navbar />
            <Router >
                <Routes>
                    <Route path="/" element={<LoginRegisterPage />} />
                    <Route path="/register" element={<SignupPage />} />
                    <Route path="/cars" element={<CarsPage />} />
                    <Route path="/cars/view/:carId" element={<ViewCar />} />
                    <Route path="/cars/:carId" element={<ModifyCarPage />} />
                    <Route path="/verify/:verificationToken" element={<VerificationPage />} />
                    <Route path="/verify/:verificationToken/:type" element={<VerificationPage />} />
                    <Route path="/reset-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:passwordToken" element={<ResetPasswordPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </div>
    );
}
export default App;