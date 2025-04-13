import { createContext, useState, useContext, useRef, useEffect, ReactNode } from 'react';

// Define the Song interface
interface Song {
    _id: string;
    title: string;
    artist: string;
    url: string;
    duration: number;
}

// Define the AudioContext interface
interface AudioContextType {
    currentSong: Song | null;
    isPlaying: boolean;
    playSong: (song: Song) => void;
    pauseSong: () => void;
    resumeSong: () => void;
    progress: number;
    duration: number;
    handleSeek: (value: number) => void;
}

// Create the context
const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Create the provider component
export const AudioProvider = ({ children }: { children: ReactNode }) => {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    useEffect(() => {
        // Initialize audio element
        if (!audioRef.current) {
            audioRef.current = new Audio();
            
            // Set up event listeners
            audioRef.current.addEventListener('timeupdate', () => {
                if (audioRef.current) {
                    setProgress(audioRef.current.currentTime);
                }
            });
            
            audioRef.current.addEventListener('loadedmetadata', () => {
                if (audioRef.current) {
                    setDuration(audioRef.current.duration);
                }
            });
            
            audioRef.current.addEventListener('ended', () => {
                setIsPlaying(false);
                setProgress(0);
            });
        }
        
        // Cleanup function
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
                audioRef.current.removeEventListener('timeupdate', () => {});
                audioRef.current.removeEventListener('loadedmetadata', () => {});
                audioRef.current.removeEventListener('ended', () => {});
            }
        };
    }, []);
    
    // Play a song
    const playSong = (song: Song) => {
        if (audioRef.current) {
            // If a song is already playing, pause it first
            audioRef.current.pause();
            
            // Set the new song and start playing
            setCurrentSong(song);
            audioRef.current.src = song.url;
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(error => {
                    console.error('Error playing song:', error);
                    setIsPlaying(false);
                });
        }
    };
    
    // Pause the current song
    const pauseSong = () => {
        if (audioRef.current && isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };
    
    // Resume the current song
    const resumeSong = () => {
        if (audioRef.current && !isPlaying && currentSong) {
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(error => {
                    console.error('Error resuming song:', error);
                });
        }
    };
    
    // Handle seeking in the song
    const handleSeek = (value: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value;
            setProgress(value);
        }
    };
    
    return (
        <AudioContext.Provider
            value={{
                currentSong,
                isPlaying,
                playSong,
                pauseSong,
                resumeSong,
                progress,
                duration,
                handleSeek
            }}
        >
            {children}
        </AudioContext.Provider>
    );
};

// Create the hook to use the context
export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};