import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';


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

    if (loading) return <div>Loading playlist...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!playlist) return <div>Playlist not found</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <button
                onClick={() => navigate('/home')}
                style={{ marginBottom: '20px' }}
            >
                Back to Home
            </button>

            {editMode ? (
                <form onSubmit={handleUpdatePlaylist}>
                    <h2>Edit Playlist</h2>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
                        <input
                            id="name"
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            style={{ padding: '8px', width: '100%', maxWidth: '400px' }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
                        <textarea
                            id="description"
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            style={{ padding: '8px', width: '100%', maxWidth: '400px', minHeight: '100px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="coverUrl" style={{ display: 'block', marginBottom: '5px' }}>Cover Image URL:</label>
                        <input
                            id="coverUrl"
                            type="text"
                            value={editedCoverUrl}
                            onChange={(e) => setEditedCoverUrl(e.target.value)}
                            style={{ padding: '8px', width: '100%', maxWidth: '400px' }}
                        />
                    </div>
                    <div>
                        <button type="submit" style={{ marginRight: '10px' }}>Save Changes</button>
                        <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
                    </div>
                </form>
            ) : (
                <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
                        {playlist.coverImage && (
                            <img
                                src={playlist.coverImage}
                                alt={`${playlist.name} cover`}
                                style={{ width: '200px', height: '200px', objectFit: 'cover', marginRight: '20px', borderRadius: '5px' }}
                            />
                        )}
                        <div>
                            <h1>{playlist.name}</h1>
                            {playlist.description && <p>{playlist.description}</p>}
                            <p>{playlist.songs.length} songs</p>
                            <button
                                onClick={() => setEditMode(true)}
                                style={{ marginRight: '10px' }}
                            >
                                Edit Playlist
                            </button>
                        </div>
                    </div>

                    {/* Song Search and Add Section */}
                    <section style={{ margin: '20px 0', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                        <h2>Add Songs</h2>
                        <form onSubmit={handleSearchSongs}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for songs to add..."
                                style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '10px' }}
                            />
                            <button type="submit">Search Songs</button>
                        </form>

                        {searchResults.length > 0 && (
                            <div style={{ marginTop: '15px' }}>
                                <h3>Search Results</h3>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {searchResults.map((song) => (
                                        <li
                                            key={song._id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '10px',
                                                marginBottom: '5px',
                                                border: '1px solid #ddd',
                                                backgroundColor: 'white',
                                                borderRadius: '5px'
                                            }}
                                        >
                                            <div>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSongs.includes(song._id)}
                                                    onChange={() => toggleSongSelection(song._id)}
                                                    style={{ marginRight: '10px' }}
                                                />
                                                <strong>{song.title}</strong> by {song.artist}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={handleAddSelectedSongs}
                                    disabled={selectedSongs.length === 0}
                                    style={{ marginTop: '10px' }}
                                >
                                    Add Selected Songs
                                </button>
                            </div>
                        )}
                    </section>

                    <h2>Songs in Playlist</h2>
                    {playlist.songs.length > 0 ? (
                        <div>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {playlist.songs.map((song, index) => (
                                    <li
                                        key={song._id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '10px',
                                            marginBottom: '5px',
                                            border: '1px solid #ddd',
                                            borderRadius: '5px'
                                        }}
                                    >
                                        <div>
                                            <strong onClick={() => playSong(song._id)}
                                                    style={{ cursor: 'pointer', flex: 1 }}
                                            >{song.title} </strong> by {song.artist}
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => moveSongUp(index)}
                                                disabled={index === 0}
                                                style={{ marginRight: '5px' }}
                                            >
                                                ↑
                                            </button>
                                            <button
                                                onClick={() => moveSongDown(index)}
                                                disabled={index === playlist.songs.length - 1}
                                                style={{ marginRight: '5px' }}
                                            >
                                                ↓
                                            </button>
                                            <button
                                                onClick={() => handleRemoveSong(song._id)}
                                                style={{ backgroundColor: '#f44336', marginLeft: '10px' }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={saveReorderedPlaylist}
                                style={{ marginTop: '15px' }}
                            >
                                Save Playlist Order
                            </button>
                        </div>
                    ) : (
                        <p>No songs in this playlist yet. Search for songs above to add them.</p>
                    )}
                </div>
            )}

            {message && (
                <div style={{
                    padding: '10px',
                    backgroundColor: message.includes('failed') || message.includes('Failed') ? '#ffcccc' : '#ccffcc',
                    borderRadius: '5px',
                    margin: '20px 0'
                }}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default PlaylistDetail;