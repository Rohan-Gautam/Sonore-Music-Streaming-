import React, { useEffect, useState } from 'react';
import { Song } from '../../../backend/types/song';
import { useAudio } from '../context/AudioContext';

const SongList: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { playSong, currentSong, isPlaying, pauseSong, resumeSong } = useAudio();
  
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
  
  const handleSongClick = (song: Song) => {
    if (currentSong && currentSong._id === song._id) {
      // Toggle play/pause if clicking on the current song
      isPlaying ? pauseSong() : resumeSong();
    } else {
      // Play a new song
      playSong(song);
    }
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  if (loading) {
    return <div className="text-center py-10">Loading songs...</div>;
  }
  
  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6">Songs</h2>
      
      {songs.length === 0 ? (
        <p className="text-center py-4">No songs available.</p>
      ) : (
        <ul className="bg-white rounded-lg shadow overflow-hidden">
          {songs.map((song) => (
            <li 
              key={song._id}
              className={`border-b last:border-0 hover:bg-gray-50 cursor-pointer ${
                currentSong && currentSong._id === song._id ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleSongClick(song)}
            >
              <div className="flex items-center p-4">
                <div className="mr-4">
                  {currentSong && currentSong._id === song._id && isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                      <rect x="6" y="4" width="4" height="16"></rect>
                      <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{song.title}</h3>
                  <p className="text-sm text-gray-500">{song.artist}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDuration(song.duration)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SongList;