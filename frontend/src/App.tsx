import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/LandingPage';
import Account from './pages/Account';
import PlaylistDetail from './pages/PlaylistDetail';
import MediaPlayer from './components/MediaPlayer';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import './index.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axios.get('/api/home', { withCredentials: true });
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);

    return (
        <BrowserRouter>
            <div className="app-container">
                <div className="page-content">
                    <Routes>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/" element={<Landing/>}/>
                        <Route
                            path="/home"
                            element={
                                <ProtectedRoute>
                                    <Home/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/account"
                            element={
                                <ProtectedRoute>
                                    <Account/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/playlist/:playlistId"
                            element={
                                <ProtectedRoute>
                                    <PlaylistDetail/>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
                    <MediaPlayer isAuthenticated={isAuthenticated}/>
            </div>
        </BrowserRouter>
);
}

export default App;