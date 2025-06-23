import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FM.css';

const FM = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  const fmStations = [
    {
      id: 1,
      name: "Metro Traffic FM 95.5",
      frequency: "95.5",
      logo: null,
      streamUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
      fallbackUrl: "https://file-examples.com/storage/fe68c1b7c1a9fd62b2c2a99/2017/11/file_example_MP3_700KB.mp3",
      loop: true
    },
    {
      id: 2,
      name: "Radio Nepal 103.0",
      frequency: "103.0",
      logo: null,
      streamUrl: "https://file-examples.com/storage/fe68c1b7c1a9fd62b2c2a99/2017/11/file_example_MP3_1MG.mp3",
      fallbackUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
      loop: true
    },
    {
      id: 3,
      name: "Kantipur FM 96.1",
      frequency: "96.1",
      logo: null,
      streamUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
      fallbackUrl: "https://file-examples.com/storage/fe68c1b7c1a9fd62b2c2a99/2017/11/file_example_MP3_700KB.mp3",
      loop: true
    },
    {
      id: 4,
      name: "Image FM 97.9",
      frequency: "97.9",
      logo: null,
      streamUrl: "https://file-examples.com/storage/fe68c1b7c1a9fd62b2c2a99/2017/11/file_example_MP3_700KB.mp3",
      fallbackUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
      loop: true
    },
    {
      id: 5,
      name: "Hits FM 91.2",
      frequency: "91.2",
      logo: null,
      streamUrl: "https://file-examples.com/storage/fe68c1b7c1a9fd62b2c2a99/2017/11/file_example_MP3_1MG.mp3",
      fallbackUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
      loop: true
    },
    {
      id: 6,
      name: "Classic FM 101.2",
      frequency: "101.2",
      logo: null,
      streamUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
      fallbackUrl: "https://file-examples.com/storage/fe68c1b7c1a9fd62b2c2a99/2017/11/file_example_MP3_700KB.mp3",
      loop: true
    },
    {
      id: 7,
      name: "Chill FM 102.4",
      frequency: "102.4",
      logo: null,
      streamUrl: "https://file-examples.com/storage/fe68c1b7c1a9fd62b2c2a99/2017/11/file_example_MP3_1MG.mp3",
      fallbackUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
      loop: true
    }
  ];

  const handleBack = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    navigate('/home');
  };

  const tryPlayAudio = async (url, station) => {
    return new Promise((resolve, reject) => {
      const audio = audioRef.current;

      const handleCanPlay = () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadeddata', handleLoadedData);

        // Set loop if station supports it
        if (station.loop) {
          audio.loop = true;
        }

        resolve();
      };

      const handleLoadedData = () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadeddata', handleLoadedData);

        // Set loop if station supports it
        if (station.loop) {
          audio.loop = true;
        }

        resolve();
      };

      const handleError = (e) => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadeddata', handleLoadedData);
        console.error('Audio load error:', e);
        reject(new Error(`Failed to load audio: ${e.message || 'Unknown error'}`));
      };

      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('loadeddata', handleLoadedData);
      audio.addEventListener('error', handleError);

      // Set source and load
      audio.src = url;
      audio.load();

      // Timeout after 15 seconds
      setTimeout(() => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadeddata', handleLoadedData);
        reject(new Error('Audio loading timeout'));
      }, 15000);
    });
  };

  const handlePlayPause = async (station) => {
    setError('');

    if (currentStation?.id === station.id && isPlaying) {
      // Pause current station
      audioRef.current.pause();
      setIsPlaying(false);
      setIsLoading(false);
    } else {
      // Play new station
      if (audioRef.current) {
        try {
          setIsLoading(true);
          setCurrentStation(station);

          // Stop current audio if playing
          audioRef.current.pause();
          audioRef.current.currentTime = 0;

          // Try primary URL first
          try {
            console.log(`Trying to load: ${station.streamUrl}`);
            await tryPlayAudio(station.streamUrl, station);
            console.log('Audio loaded successfully, attempting to play...');
            await audioRef.current.play();
            console.log('Audio playing successfully');
            setIsPlaying(true);
            setIsLoading(false);
          } catch (primaryError) {
            console.log('Primary stream failed:', primaryError.message);

            // Try fallback URL if available
            if (station.fallbackUrl) {
              try {
                console.log(`Trying fallback: ${station.fallbackUrl}`);
                await tryPlayAudio(station.fallbackUrl, station);
                await audioRef.current.play();
                console.log('Fallback audio playing successfully');
                setIsPlaying(true);
                setIsLoading(false);
              } catch (fallbackError) {
                console.log('Fallback also failed:', fallbackError.message);
                throw new Error(`Unable to load audio for ${station.name}. Both primary and fallback failed.`);
              }
            } else {
              throw primaryError;
            }
          }
        } catch (err) {
          console.error('Error playing audio:', err);
          let errorMessage = `Unable to play ${station.name}`;

          if (err.name === 'NotAllowedError') {
            errorMessage = 'Please click to allow audio playback and try again.';
          } else if (err.name === 'NotSupportedError') {
            errorMessage = `${station.name} audio format is not supported by your browser.`;
          } else if (err.message.includes('network')) {
            errorMessage = `Network error. Please check your connection and try again.`;
          }

          setError(errorMessage);
          setIsPlaying(false);
          setIsLoading(false);
          setCurrentStation(null);
        }
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };

      const handleError = (e) => {
        console.error('Audio error:', e);
        setError('Connection lost. Please try again.');
        setIsPlaying(false);
        setIsLoading(false);
      };

      const handleLoadStart = () => {
        setIsLoading(true);
      };

      const handleCanPlay = () => {
        setIsLoading(false);
      };

      const handleWaiting = () => {
        setIsLoading(true);
      };

      const handlePlaying = () => {
        setIsLoading(false);
      };

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('playing', handlePlaying);

      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('playing', handlePlaying);
      };
    }
  }, []);

  return (
    <div className="fm-container">
      <div className="fm-card">
        <div className="fm-header">
          <button className="fm-back-button" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          <h1>FM Station</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="fm-content">
          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              {error}
              <button onClick={() => setError('')} className="error-close">×</button>
            </div>
          )}



          <div className="fm-stations-list">
            {fmStations.map((station) => (
              <div key={station.id} className="fm-station-item">
                <div className="station-info">
                  <div className="station-logo">
                    {station.logo ? (
                      <img src={station.logo} alt={station.name} />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v8c0 1.1.89 2 2 2h16c1.11 0 2-.9 2-2V8c0-1.1-.89-2-2-2H8.3l-.6-1.2c-.2-.4-.6-.8-1.1-.8H4c-.83 0-1.24.85-.76 1.15zM7 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                      </svg>
                    )}
                  </div>
                  <div className="station-details">
                    <h3>{station.name}</h3>
                    <p>{station.frequency} FM</p>
                  </div>
                </div>
                <button
                  className={`play-button ${currentStation?.id === station.id && isPlaying ? 'playing' : ''} ${currentStation?.id === station.id && isLoading ? 'loading' : ''}`}
                  onClick={() => handlePlayPause(station)}
                  disabled={isLoading && currentStation?.id === station.id}
                >
                  {currentStation?.id === station.id && isLoading ? (
                    <div className="loading-spinner-small"></div>
                  ) : currentStation?.id === station.id && isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" fill="currentColor"/>
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden audio element for streaming */}
        <audio
          ref={audioRef}
          preload="none"
          crossOrigin="anonymous"
          controls={false}
          volume={0.7}
        />

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && currentStation && (
          <div className="debug-info">
            <p>Current: {currentStation.name}</p>
            <p>Status: {isPlaying ? 'Playing' : isLoading ? 'Loading' : 'Stopped'}</p>
            <p>URL: {currentStation.streamUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FM;
