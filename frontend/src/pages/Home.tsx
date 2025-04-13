import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';


interface Song {
    _id: string;
    title: string;
    artist: string;
}

interface Playlist {
    _id: string;
    name: string;
    songs: Song[];
}

const Home: React.FC = () => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [user, setUser] = useState<{ username: string; email: string } | null>(null);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Fetch user and playlists
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [homeRes, playlistsRes] = await Promise.all([
                    axios.get('/api/home', { withCredentials: true }),
                    axios.get('/api/playlists', { withCredentials: true }),
                ]);
                setUser(homeRes.data.user);
                setPlaylists(playlistsRes.data.playlists);
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    console.error('Fetch error:', error.message);
                }
                navigate('/login');
            }
        };
        fetchData();
    }, [navigate]);

    // Search songs
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;
        try {
            const res = await axios.get(`/api/songs/search?q=${encodeURIComponent(searchQuery)}`, {
                withCredentials: true,
            });
            setSearchResults(res.data.songs);
            setMessage('');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.message || 'Search failed');
            }
        }
    };

    // Create playlist
    const handleCreatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlaylistName) return;
        try {
            const res = await axios.post(
                '/api/playlists',
                { name: newPlaylistName },
                { withCredentials: true }
            );
            setPlaylists([...playlists, res.data.playlist]);
            setNewPlaylistName('');
            setMessage('Playlist created');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.message || 'Failed to create playlist');
            }
        }
    };

    // Logout
    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                // Only navigate after successful logout
                navigate('/login');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Sonore</h1>
                <div>
                    {user && (
                        <span style={{ marginRight: '20px' }}>
              Welcome, {user.username || user.email}
            </span>
                    )}
                    <button onClick={() => navigate('/account')} style={{ marginRight: '10px' }}>
                        Account
                    </button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </header>

            <section style={{ margin: '20px 0' }}>
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search songs or artists..."
                        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                    />
                    <button type="submit" style={{ padding: '10px 20px', marginTop: '10px' }}>
                        Search
                    </button>
                </form>
                {searchResults.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <h3>Search Results</h3>
                        <ul>
                            {searchResults.map((song) => (
                                <li key={song._id}>
                                    {song.title} by {song.artist}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            <section style={{ margin: '20px 0' }}>
                <h2>Your Playlists</h2>
                <form onSubmit={handleCreatePlaylist} style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        placeholder="New playlist name"
                        style={{ padding: '8px', marginRight: '10px' }}
                    />
                    <button type="submit">Create Playlist</button>
                </form>
                {playlists.length > 0 ? (
                    <ul>
                        {playlists.map((playlist) => (
                            <li key={playlist._id}>
                                {playlist.name} ({playlist.songs.length} songs)
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No playlists yet. Create one!</p>
                )}
            </section>

            {message && <p>{message}</p>}
        </div>
    );
};

export default Home;