import { Link } from 'react-router-dom';

/**
 * Home page component
 * Displays a welcome message and buttons to navigate to login/register
 * Serves as the landing page for Sonore
 */
function Home() {
    return (
        <div className="home-container">
            <h1>Welcome to Sonore</h1>
            <p>Your music streaming journey starts here!</p>
            <div className="button-group">
            </div>
        </div>
    );
}

export default Home;

/**
 * How to extend this component:
 * 1. **Hero Section**: Add a banner image or carousel for featured songs.
 * 2. **Content**: Display trending songs or playlists (fetch from /api/songs).
 * 3. **Styling**: Customize buttons with hover effects or icons.
 * 4. **Auth Check**: Redirect to /dashboard if user is logged in.
 *    Example: Use useEffect to check auth token.
 */
