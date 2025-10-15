import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import CardPage from './pages/CardPage';
import Navbar from './components/Navbar';
function App() {
    return (
        <div>
            <Navbar />
            <Router >
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/cards" element={<CardPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </div>
    );
}
export default App;