import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
import './index.css';
import Landing from "./components/LandingPage.tsx";


/**
 * Main App component
 * Sets up client-side routing with React Router
 * Renders different pages based on URL path
 */
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

/**
 * How to extend this component:
 * 1. **Add Pages**: Create new pages in src/pages/ (e.g., Songs.tsx, Playlists.tsx).
 *    Add routes like <Route path="/songs" element={<Songs />} />.
 * 2. **Navigation**: Add a navbar component for consistent navigation.
 *    Example: <nav> with Links to /, /login, /register.
 * 3. **State Management**: Use Redux or Context for user auth state.
 * 4. **API Calls**: Fetch data from backend (e.g., /api/songs) in useEffect.
 * 5. **Styling**: Use a CSS framework like Tailwind or Material-UI for better UI.
 */