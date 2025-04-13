import React from 'react';
import { useAudio } from '../context/AudioContext';

const AudioPlayer: React.FC = () => {
  const { 
    currentSong, 
    isPlaying, 
    pauseSong, 
    resumeSong, 
    progress, 
    duration,
    handleSeek
  } = useAudio();
  
  if (!currentSong) {
    return null;
  }
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div>
              <h4 className="font-medium">{currentSong.title}</h4>
              <p className="text-sm text-gray-500">{currentSong.artist}</p>
            </div>
          </div>
          
          <div className="flex-1 mx-8">
            <div className="flex items-center justify-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="19 20 9 12 19 4 19 20"></polygon>
                  <line x1="5" y1="19" x2="5" y2="5"></line>
                </svg>
              </button>
              
              <button 
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                onClick={isPlaying ? pauseSong : resumeSong}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>
              
              <button className="p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4"></polygon>
                  <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
              </button>
            </div>
            
            <div className="flex items-center mt-2">
              <span className="text-xs text-gray-500 w-10">{formatTime(progress)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={progress}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="flex-1 mx-2 h-1"
              />
              <span className="text-xs text-gray-500 w-10">{formatTime(duration)}</span>
            </div>
          </div>
          
          <div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;