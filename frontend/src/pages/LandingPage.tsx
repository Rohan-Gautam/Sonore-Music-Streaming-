import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import '../styles/LandingPage.css';

/**
 * Home page component
 * Displays a welcome message, login/register buttons, and featured songs
 * Serves as the landing page for Sonore with song playback capabilities
 */
function Landing() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { playSong, currentSong, isPlaying, pauseSong, resumeSong } = useAudio();
    
    // Fetch songs from the backend
    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await fetch('/api/songs');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch songs');
                }
                
                const data = await response.json();
                setSongs(data);
            } catch (err) {
                setError('Error loading songs. Please try again later.');
                console.error('Error fetching songs:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSongs();
    }, []);

    // Handle song playback
    const handleSongClick = (song) => {
        if (currentSong && currentSong._id === song._id) {
            // Toggle play/pause if clicking on the current song
            isPlaying ? pauseSong() : resumeSong();
        } else {
            // Play a new song
            playSong(song);
        }
    };
    
    // Format duration from seconds to MM:SS
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="landing-container">
            <div className="hero-section">
                <h1>Welcome to Sonore</h1>
                <p>Your music streaming journey starts here!</p>
                <div className="button-group">
                    <Link to="/login">
                        <button className="btn login-btn">Login</button>
                    </Link>
                    <Link to="/register">
                        <button className="btn register-btn">Register</button>
                    </Link>
                </div>
            </div>
            
            <div className="featured-songs-section">
                <h2>Featured Songs</h2>
                {loading ? (
                    <div className="loading-indicator">Loading songs...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : songs.length === 0 ? (
                    <p className="no-songs-message">No songs available. Check back later!</p>
                ) : (
                    <div className="songs-grid">
                        {songs.map((song) => (
                            <div 
                                key={song._id}
                                className={`song-card ${currentSong && currentSong._id === song._id ? 'playing' : ''}`}
                                onClick={() => handleSongClick(song)}
                            >
                                <div className="song-artwork">
                                    {/* Play/Pause icon overlay */}
                                    <div className="play-indicator">
                                        {currentSong && currentSong._id === song._id && isPlaying ? (
                                            <span className="pause-icon">❚❚</span>
                                        ) : (
                                            <span className="play-icon">▶</span>
                                        )}
                                    </div>
                                </div>
                                <div className="song-info">
                                    <h3 className="song-title">{song.title}</h3>
                                    <p className="song-artist">{song.artist}</p>
                                    <p className="song-duration">{formatDuration(song.duration)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Now Playing bar will appear when a song is playing */}
            {currentSong && (
                <div className="now-playing-bar">
                    <div className="song-details">
                        <div className="song-thumbnail"></div>
                        <div className="now-playing-info">
                            <p className="now-playing-title">{currentSong.title}</p>
                            <p className="now-playing-artist">{currentSong.artist}</p>
                        </div>
                    </div>
                    <div className="playback-controls">
                        <button className="control-btn" onClick={isPlaying ? pauseSong : resumeSong}>
                            {isPlaying ? '❚❚' : '▶'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Landing;