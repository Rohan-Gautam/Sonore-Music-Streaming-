import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
import { MdPlayCircleFilled } from 'react-icons/md';

interface Song {
    _id: string;
    title: string;
    artist: string;
    url?: string;
    duration?: number;
    album?: string;
    releaseYear?: number;
    genre?: string[];
    language?: string;
    isExplicit?: boolean;
}

interface Playlist {
    _id: string;
    name: string;
    songs: Song[];
    description?: string;
    coverImage?: string;
    category?: string;
    createdAt?: string;
    updatedAt?: string;
}

const Home: React.FC = () => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [publicPlaylists, setPublicPlaylists] = useState<Playlist[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [user, setUser] = useState<{ username: string; email: string } | null>(null);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
    const [newPlaylistCoverUrl, setNewPlaylistCoverUrl] = useState('');
    const [message, setMessage] = useState('');
    const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const navigate = useNavigate();

    // Fetch user, playlists, and public playlists
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [homeRes, playlistsRes, publicPlaylistsRes] = await Promise.all([
                    axios.get('/api/home', { withCredentials: true }),
                    axios.get('/api/playlists', { withCredentials: true }),
                    axios.get('/api/public-playlists', { withCredentials: true }),
                ]);
                setUser(homeRes.data.user);
                setPlaylists(playlistsRes.data.playlists);
                setPublicPlaylists(publicPlaylistsRes.data.playlists);
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    console.error('Fetch error:', error.message);
                }
                navigate('/login');
            }
        };
        fetchData();
    }, [navigate]);

    // Fetch public playlists by category
    useEffect(() => {
        const fetchPublicPlaylists = async () => {
            try {
                const url = categoryFilter
                    ? `/api/public-playlists?category=${encodeURIComponent(categoryFilter)}`
                    : '/api/public-playlists';
                const response = await axios.get(url, { withCredentials: true });
                setPublicPlaylists(response.data.playlists);
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    setMessage(error.response?.data?.message || 'Failed to fetch public playlists');
                }
            }
        };
        fetchPublicPlaylists();
    }, [categoryFilter]);

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
                '/api/playlists/createPlaylist',
                {
                    name: newPlaylistName,
                    description: newPlaylistDescription,
                    coverImageUrl: newPlaylistCoverUrl,
                },
                { withCredentials: true }
            );
            setPlaylists([...playlists, res.data.playlist]);
            setNewPlaylistName('');
            setNewPlaylistDescription('');
            setNewPlaylistCoverUrl('');
            setMessage('Playlist created successfully');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.message || 'Failed to create playlist');
            }
        }
    };

    // Delete playlist
    const handleDeletePlaylist = async (playlistId: string) => {
        try {
            await axios.delete(`/api/playlists/deletePlaylist/${playlistId}`, { withCredentials: true });
            setPlaylists(playlists.filter(playlist => playlist._id !== playlistId));
            setMessage('Playlist deleted successfully');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.message || 'Failed to delete playlist');
            }
        }
    };

    // Toggle song selection
    const toggleSongSelection = (songId: string) => {
        if (selectedSongs.includes(songId)) {
            setSelectedSongs(selectedSongs.filter(id => id !== songId));
        } else {
            setSelectedSongs([...selectedSongs, songId]);
        }
    };

    // Add selected songs to playlist
    const handleAddSongsToPlaylist = async () => {
        if (!selectedPlaylist || selectedSongs.length === 0) {
            setMessage('Please select a playlist and at least one song');
            return;
        }

        try {
            const res = await axios.post(
                '/api/playlists/addSongsToPlaylist',
                {
                    playlistId: selectedPlaylist,
                    songIds: selectedSongs,
                },
                { withCredentials: true }
            );

            const updatedPlaylists = playlists.map(playlist =>
                playlist._id === selectedPlaylist ? res.data.playlist : playlist
            );

            setPlaylists(updatedPlaylists);
            setSelectedSongs([]);
            setMessage('Songs added to playlist successfully');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.message || 'Failed to add songs to playlist');
            }
        }
    };

    // Play a song
    const playSong = (songId: string) => {
        window.dispatchEvent(new CustomEvent('playSong', { detail: songId }));
    };

    // View playlist details
    const navigateToPlaylist = (playlistId: string) => {
        navigate(`/playlist/${playlistId}`);
    };

    // Logout
    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="pb-20" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
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
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {searchResults.map((song) => (
                                <li
                                    key={song._id}
                                    style={{
                                        margin: '10px 0',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <div style={{display: 'flex', alignItems: 'center', flex: 1}}>
                                        <MdPlayCircleFilled
                                            onClick={() => playSong(song._id)}
                                            style={{
                                                color: '#1DB954',
                                                fontSize: '32px',
                                                marginRight: '10px',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s ease-in-out',
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                        <span style={{flex: 1}}>{song.title} by {song.artist}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedSongs.includes(song._id)}
                                        onChange={() => toggleSongSelection(song._id)}
                                    />
                                </li>
                            ))}
                        </ul>

                        {searchResults.length > 0 && (
                            <div style={{marginTop: '15px'}}>
                                <select
                                    value={selectedPlaylist}
                                    onChange={(e) => setSelectedPlaylist(e.target.value)}
                                    style={{padding: '8px', marginRight: '10px'}}
                                >
                                <option value="">Select a playlist</option>
                                    {playlists.map((playlist) => (
                                        <option key={playlist._id} value={playlist._id}>
                                            {playlist.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAddSongsToPlaylist}
                                    disabled={selectedSongs.length === 0 || !selectedPlaylist}
                                >
                                    Add Selected to Playlist
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </section>

            <section style={{ margin: '20px 0' }}>
                <h2>Public Playlists</h2>
                <div style={{ marginBottom: '20px' }}>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{ padding: '8px' }}
                    >
                        <option value="">All Categories</option>
                        <option value="Pop">Pop</option>
                        <option value="Rock">Rock</option>
                        <option value="Jazz">Jazz</option>
                        <option value="Classical">Classical</option>
                        <option value="Hip-Hop">Hip-Hop</option>
                        <option value="Electronic">Electronic</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                {publicPlaylists.length > 0 ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '20px',
                        }}
                    >
                        {publicPlaylists.map((playlist) => (
                            <div
                                key={playlist._id}
                                style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px' }}
                            >
                                {playlist.coverImage && (
                                    <img
                                        src={playlist.coverImage}
                                        alt={`${playlist.name} cover`}
                                        style={{
                                            width: '100%',
                                            height: '150px',
                                            objectFit: 'cover',
                                            marginBottom: '10px',
                                            borderRadius: '3px',
                                        }}
                                    />
                                )}
                                <h3>{playlist.name}</h3>
                                {playlist.description && <p>{playlist.description}</p>}
                                <p>Category: {playlist.category}</p>
                                <p>{playlist.songs.length} songs</p>
                                <div style={{ marginTop: '10px' }}>
                                    {playlist.songs.map((song) => (
                                        <div
                                            key={song._id}
                                            onClick={() => playSong(song._id)}
                                            style={{
                                                cursor: 'pointer',
                                                padding: '5px',
                                                borderBottom: '1px solid #eee',
                                            }}
                                        >
                                            {song.title} by {song.artist}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No public playlists found.</p>
                )}
            </section>

            <section style={{ margin: '20px 0' }}>
                <h2>Your Playlists</h2>
                <form onSubmit={handleCreatePlaylist} style={{ marginBottom: '20px' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            placeholder="New playlist name"
                            style={{ padding: '8px', marginRight: '10px', width: '300px' }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            value={newPlaylistDescription}
                            onChange={(e) => setNewPlaylistDescription(e.target.value)}
                            placeholder="Description (optional)"
                            style={{ padding: '8px', marginRight: '10px', width: '300px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            value={newPlaylistCoverUrl}
                            onChange={(e) => setNewPlaylistCoverUrl(e.target.value)}
                            placeholder="Cover image URL (optional)"
                            style={{ padding: '8px', marginRight: '10px', width: '300px' }}
                        />
                    </div>
                    <button type="submit">Create Playlist</button>
                </form>

                {playlists.length > 0 ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '20px',
                        }}
                    >
                        {playlists.map((playlist) => (
                            <div
                                key={playlist._id}
                                style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px' }}
                            >
                                {playlist.coverImage && (
                                    <img
                                        src={playlist.coverImage}
                                        alt={`${playlist.name} cover`}
                                        style={{
                                            width: '100%',
                                            height: '150px',
                                            objectFit: 'cover',
                                            marginBottom: '10px',
                                            borderRadius: '3px',
                                        }}
                                    />
                                )}
                                <h3>{playlist.name}</h3>
                                {playlist.description && <p>{playlist.description}</p>}
                                <p>{playlist.songs.length} songs</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                    <button onClick={() => navigateToPlaylist(playlist._id)}>View</button>
                                    <button
                                        onClick={() => handleDeletePlaylist(playlist._id)}
                                        style={{ backgroundColor: '#f44336' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No playlists yet. Create one!</p>
                )}
            </section>


            {message && (
                <div
                    style={{
                        padding: '10px',
                        backgroundColor: message.includes('failed') || message.includes('Failed') ? '#ffcccc' : '#ccffcc',
                        borderRadius: '5px',
                        margin: '20px 0',
                    }}
                >
                    {message}
                </div>
            )}
        </div>
    );
};

export default Home;