import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/PlaylistDetail.css';

interface Song {
    _id: string;
    title: string;
    artist: string;
    url?: string;
}

interface Playlist {
    _id: string;
    name: string;
    songs: Song[];
    description?: string;
    coverImage?: string;
}

const PlaylistDetail: React.FC = () => {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedCoverUrl, setEditedCoverUrl] = useState('');
    const [message, setMessage] = useState('');

    // For song search and addition
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [selectedSongs, setSelectedSongs] = useState<string[]>([]);

    // Fetch playlist details
    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/api/playlists`, { withCredentials: true });
                const foundPlaylist = res.data.playlists.find((p: Playlist) => p._id === playlistId);

                if (foundPlaylist) {
                    setPlaylist(foundPlaylist);
                    setEditedName(foundPlaylist.name);
                    setEditedDescription(foundPlaylist.description || '');
                    setEditedCoverUrl(foundPlaylist.coverImage || '');
                } else {
                    setError('Playlist not found');
                }
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    setError(error.response?.data?.message || 'Failed to load playlist');
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        if (playlistId) {
            fetchPlaylist();
        }
    }, [playlistId]);

    // Update playlist details
    const handleUpdatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editedName.trim()) {
            setMessage('Playlist name is required');
            return;
        }

        try {
            const res = await axios.put(
                `/api/playlists/updatePlaylist/${playlistId}`,
                {
                    name: editedName,
                    description: editedDescription,
                    coverImageUrl: editedCoverUrl
                },
                { withCredentials: true }
            );

            setPlaylist(res.data.playlist);
            setEditMode(false);
            setMessage('Playlist updated successfully');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.message || 'Failed to update playlist');
            }
        }
    };

    // Remove song from playlist
    const handleRemoveSong = async (songId: string) => {
        try {
            await axios.post(
                '/api/playlists/removeSongsFromPlaylist',
                {
                    playlistId,
                    songIds: [songId]
                },
                { withCredentials: true }
            );

            if (playlist) {
                const updatedSongs = playlist.songs.filter(song => song._id !== songId);
                setPlaylist({ ...playlist, songs: updatedSongs });
                setMessage('Song removed from playlist');
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.message || 'Failed to remove song');
            }
        }
    };

    // Search songs
    const handleSearchSongs = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            const res = await axios.get(`/api/songs/search?q=${encodeURIComponent(searchQuery)}`, {
                withCredentials: true,
            });

            // Filter out songs that are already in the playlist
            const existingSongIds = playlist?.songs.map(song => song._id) || [];
            const filteredResults = res.data.songs.filter((song: Song) => !existingSongIds.includes(song._id));

            setSearchResults(filteredResults);
            setMessage('');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.message || 'Search failed');
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
    const handleAddSelectedSongs = async () => {
        if (selectedSongs.length === 0) {
            setMessage('No songs selected');
            return;
        }

        try {
            const res = await axios.post(
                '/api/playlists/addSongsToPlaylist',
                {
                    playlistId,
                    songIds: selectedSongs
                },
                { withCredentials: true }
            );

            setPlaylist(res.data.playlist);
            setSelectedSongs([]);
            setSearchResults([]);
            setSearchQuery('');
            setMessage('Songs added to playlist successfully');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.message || 'Failed to add songs');
            }
        }
    };

    // Move song up in playlist order
    const moveSongUp = (index: number) => {
        if (!playlist || index <= 0) return;
        const updatedSongs = [...playlist.songs];
        [updatedSongs[index], updatedSongs[index - 1]] = [updatedSongs[index - 1], updatedSongs[index]];
        console.log('New song order:', updatedSongs.map(song => song._id)); // Debug
        setPlaylist({ ...playlist, songs: updatedSongs });
    };

    // Move song down in playlist order
    const moveSongDown = (index: number) => {
        if (!playlist || index >= playlist.songs.length - 1) return;
        const updatedSongs = [...playlist.songs];
        [updatedSongs[index], updatedSongs[index + 1]] = [updatedSongs[index + 1], updatedSongs[index]];
        console.log('New song order:', updatedSongs.map(song => song._id)); // Debug
        setPlaylist({ ...playlist, songs: updatedSongs });
    };

    // Save the reordered playlist to the backend
    const saveReorderedPlaylist = async () => {
        if (!playlist) return;
        try {
            const songIds = playlist.songs.map(song => song._id);
            console.log('Sending songIds:', songIds); // Debug
            await axios.post(
                `/api/playlists/${playlistId}/reorder`,
                { songIds },
                { withCredentials: true }
            );
            setMessage('Playlist order saved successfully');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.log('Reorder error:', error.response?.data); // Debug
                setMessage(error.response?.data?.message || 'Failed to save playlist order');
            }
        }
    };

    // Play a song
    const playSong = (songId: string) => {
        window.dispatchEvent(new CustomEvent('playSong', { detail: songId }));
    };

    if (loading) return <div className="playlist-loading">Loading playlist...</div>;
    if (error) return <div className="playlist-error">Error: {error}</div>;
    if (!playlist) return <div className="playlist-not-found">Playlist not found</div>;

    return (
        <div className="playlist-container">
            <button
                className="playlist-back-button"
                onClick={() => navigate('/home')}
            >
                Back to Home
            </button>

            {editMode ? (
                <form className="playlist-edit-form" onSubmit={handleUpdatePlaylist}>
                    <h2 className="playlist-edit-title">Edit Playlist</h2>
                    <div className="playlist-edit-field">
                        <label htmlFor="name" className="playlist-edit-label">Name:</label>
                        <input
                            id="name"
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="playlist-edit-input"
                            required
                        />
                    </div>
                    <div className="playlist-edit-field">
                        <label htmlFor="description" className="playlist-edit-label">Description:</label>
                        <textarea
                            id="description"
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            className="playlist-edit-textarea"
                        />
                    </div>
                    <div className="playlist-edit-field">
                        <label htmlFor="coverUrl" className="playlist-edit-label">Cover Image URL:</label>
                        <input
                            id="coverUrl"
                            type="text"
                            value={editedCoverUrl}
                            onChange={(e) => setEditedCoverUrl(e.target.value)}
                            className="playlist-edit-input"
                        />
                    </div>
                    <div className="playlist-edit-actions">
                        <button type="submit" className="playlist-save-button">Save Changes</button>
                        <button type="button" className="playlist-cancel-button" onClick={() => setEditMode(false)}>Cancel</button>
                    </div>
                </form>
            ) : (
                <div className="playlist-details">
                    <div className="playlist-header">
                        {playlist.coverImage && (
                            <img
                                src={playlist.coverImage}
                                alt={`${playlist.name} cover`}
                                className="playlist-cover-image"
                            />
                        )}
                        <div className="playlist-info">
                            <h1 className="playlist-title">{playlist.name}</h1>
                            {playlist.description && <p className="playlist-description">{playlist.description}</p>}
                            <p className="playlist-song-count">{playlist.songs.length} songs</p>
                            <button
                                className="playlist-edit-button"
                                onClick={() => setEditMode(true)}
                            >
                                Edit Playlist
                            </button>
                        </div>
                    </div>

                    {/* Song Search and Add Section */}
                    <section className="playlist-search-section">
                        <h2 className="playlist-search-title">Add Songs</h2>
                        <form className="playlist-search-form" onSubmit={handleSearchSongs}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for songs to add..."
                                className="playlist-search-input"
                            />
                            <button type="submit" className="playlist-search-button">Search Songs</button>
                        </form>

                        {searchResults.length > 0 && (
                            <div className="playlist-search-results">
                                <h3 className="playlist-search-results-title">Search Results</h3>
                                <ul className="playlist-search-results-list">
                                    {searchResults.map((song) => (
                                        <li
                                            key={song._id}
                                            className="playlist-search-result-item"
                                        >
                                            <div>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSongs.includes(song._id)}
                                                    onChange={() => toggleSongSelection(song._id)}
                                                    className="playlist-search-checkbox"
                                                />
                                                <strong onClick={() => playSong(song._id)} className="playlist-search-song-title">{song.title}</strong> by {song.artist}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={handleAddSelectedSongs}
                                    disabled={selectedSongs.length === 0}
                                    className="playlist-add-songs-button"
                                >
                                    Add Selected Songs
                                </button>
                            </div>
                        )}
                    </section>

                    <h2 className="playlist-songs-title">Songs in Playlist</h2>
                    {playlist.songs.length > 0 ? (
                        <div className="playlist-songs-container">
                            <ul className="playlist-songs-list">
                                {playlist.songs.map((song, index) => (
                                    <li
                                        key={song._id}
                                        className="playlist-song-item"
                                    >
                                        <div className="playlist-song-info">
                                            <strong onClick={() => playSong(song._id)} className="playlist-song-title">{song.title}</strong> by {song.artist}
                                        </div>
                                        <div className="playlist-song-actions">
                                            <button
                                                onClick={() => moveSongUp(index)}
                                                disabled={index === 0}
                                                className="playlist-move-up-button"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                onClick={() => moveSongDown(index)}
                                                disabled={index === playlist.songs.length - 1}
                                                className="playlist-move-down-button"
                                            >
                                                ↓
                                            </button>
                                            <button
                                                onClick={() => handleRemoveSong(song._id)}
                                                className="playlist-remove-button"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={saveReorderedPlaylist}
                                className="playlist-save-order-button"
                            >
                                Save Playlist Order
                            </button>
                        </div>
                    ) : (
                        <p className="playlist-no-songs">No songs in this playlist yet. Search for songs above to add them.</p>
                    )}
                </div>
            )}

            {message && (
                <div className="playlist-message">
                    {message}
                </div>
            )}
        </div>
    );
};

export default PlaylistDetail;