import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, List } from 'lucide-react';
import '../styles/MediaPlayer.css';

interface Song {
    _id: string;
    url: string;
    title: string;
    artist: string;
    duration: number;
    album?: string;
    releaseYear?: number;
    genre?: string[];
    language?: string;
    isExplicit?: boolean;
    imageUrl?: string;
}

interface MediaPlayerProps {
    isAuthenticated: boolean;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ isAuthenticated }) => {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [isImageLarge, setIsImageLarge] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [queue, setQueue] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const fetchSong = async (songId: string) => {
        if (!isAuthenticated) return;
        try {
            const response = await axios.get(`/api/songs/${songId}`, { withCredentials: true });
            setCurrentSong(response.data.song);
        } catch (error) {
            console.error('Failed to fetch song:', error);
        }
    };

    const playSong = (songId: string) => {
        if (!isAuthenticated) return;
        if (!queue.includes(songId)) {
            setQueue([...queue, songId]);
            setCurrentIndex(queue.length);
        } else {
            const index = queue.indexOf(songId);
            setCurrentIndex(index);
        }
        fetchSong(songId);
    };

    useEffect(() => {
        const handlePlaySong = (e: CustomEvent) => {
            playSong(e.detail);
        };
        window.addEventListener('playSong', handlePlaySong as EventListener);
        return () => window.removeEventListener('playSong', handlePlaySong as EventListener);
    }, [queue, isAuthenticated]);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
            audioRef.current.addEventListener('ended', skipNext);
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
                audioRef.current.removeEventListener('ended', skipNext);
            }
        };
    }, []);

    useEffect(() => {
        if (currentSong && audioRef.current && isAuthenticated) {
            audioRef.current.src = currentSong.url;
            audioRef.current.load();
            if (isPlaying) {
                audioRef.current.play().catch(err => console.error('Playback error:', err));
            }
        }
    }, [currentSong]);

    useEffect(() => {
        if (audioRef.current && isAuthenticated && currentSong) {
            if (isPlaying) {
                audioRef.current.play().catch(err => console.error('Playback error:', err));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, isAuthenticated, currentSong]);

    useEffect(() => {
        if (audioRef.current && isAuthenticated) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted, isAuthenticated]);

    const handleTimeUpdate = () => {
        if (audioRef.current && currentSong) {
            const progressPercent = (audioRef.current.currentTime / currentSong.duration) * 100;
            setProgress(progressPercent);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isAuthenticated || !audioRef.current || !currentSong) return;
        const seekTime = (parseFloat(e.target.value) / 100) * currentSong.duration;
        audioRef.current.currentTime = seekTime;
        setProgress(parseFloat(e.target.value));
    };

    const togglePlayPause = () => {
        if (!isAuthenticated || !currentSong) return;
        setIsPlaying(!isPlaying);
    };

    const skipNext = () => {
        if (!isAuthenticated || currentIndex >= queue.length - 1) return;
        setCurrentIndex(currentIndex + 1);
        fetchSong(queue[currentIndex + 1]);
        setIsPlaying(true);
    };

    const skipPrevious = () => {
        if (!isAuthenticated || currentIndex <= 0) return;
        setCurrentIndex(currentIndex - 1);
        fetchSong(queue[currentIndex - 1]);
        setIsPlaying(true);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isAuthenticated) return;
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsMuted(false);
    };

    const toggleMute = () => {
        if (!isAuthenticated) return;
        setIsMuted(!isMuted);
    };

    const toggleImageSize = () => {
        setIsImageLarge(!isImageLarge);
    };

    const toggleQueue = () => {
        setShowQueue(!showQueue);
    };

    const formatDuration = (seconds: number) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="media-player">
            <div className="media-player-left">
                {currentSong && isAuthenticated ? (
                    <img
                        src={currentSong.imageUrl || '/default-album.png'}
                        alt={currentSong.title}
                        className="media-player-image"
                        onClick={toggleImageSize}
                        onError={(e) => { e.currentTarget.src = '/default-album.png'; }}
                    />
                ) : (
                    <img src="/default-album.png" alt="No song" className="media-player-image" />
                )}
                {currentSong && isAuthenticated && (
                    <div className="media-player-song-info">
                        <p className="media-player-song-title">{currentSong.title}</p>
                        <p className="media-player-song-artist">{currentSong.artist}</p>
                    </div>
                )}
            </div>
            <div className="media-player-center">
                <div className="media-player-controls">
                    <button className="media-player-control-button" onClick={skipPrevious} disabled={!isAuthenticated || currentIndex === 0 || !currentSong}>
                        <SkipBack size={20} />
                    </button>
                    <button className="media-player-play-pause" onClick={togglePlayPause} disabled={!isAuthenticated || !currentSong}>
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button className="media-player-control-button" onClick={skipNext} disabled={!isAuthenticated || currentIndex >= queue.length - 1 || !currentSong}>
                        <SkipForward size={20} />
                    </button>
                </div>
                <div className="media-player-progress">
                    <span className="media-player-time-current">{currentSong ? formatDuration((progress / 100) * currentSong.duration) : '0:00'}</span>
                    <input
                        type="range"
                        value={progress}
                        onChange={handleSeek}
                        min="0"
                        max="100"
                        className="media-player-progress-slider"
                    />
                    <span className="media-player-time-total">{currentSong ? formatDuration(currentSong.duration) : '0:00'}</span>
                </div>
            </div>
            <div className="media-player-right">
                <button className="media-player-queue-button" onClick={toggleQueue}>
                    <List size={20} />
                </button>
                <button className="media-player-volume-button" onClick={toggleMute} disabled={!isAuthenticated}>
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="media-player-volume-slider"
                />
            </div>
            {showQueue && (
                <div className="media-player-queue">
                    <h3 className="media-player-queue-title">Queue</h3>
                    {queue.length > 0 ? (
                        queue.map((songId) => (
                            <div key={songId} className="media-player-queue-item">
                                Song ID: {songId}
                            </div>
                        ))
                    ) : (
                        <p className="media-player-queue-empty">Queue is empty</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default MediaPlayer;