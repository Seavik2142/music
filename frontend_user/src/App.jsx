import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TrendingBanner from './components/TrendingBanner';
import TopAlbums from './components/TopAlbums';
import GenresTable from './components/GenresTable';
import TopSongs from './components/TopSongs';
import AudioPlayer from './components/AudioPlayer';
import { songsData, topAlbumsData, genresData, trendingData } from './data/musicData';
import { fetchSongs, fetchAlbums, fetchGenres, fetchTrending } from './services/api';
import './App.css';

export default function App() {
  const [songs, setSongs] = useState(songsData);
  const [albums, setAlbums] = useState(topAlbumsData);
  const [genres, setGenres] = useState(genresData);
  const [trending, setTrending] = useState(trendingData);
  const [backendConnected, setBackendConnected] = useState(false);

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);

  // Load live data from PostgreSQL Backend API
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [liveSongs, liveAlbums, liveGenres, liveTrending] = await Promise.all([
          fetchSongs().catch(() => null),
          fetchAlbums().catch(() => null),
          fetchGenres().catch(() => null),
          fetchTrending().catch(() => null),
        ]);

        if (liveSongs && liveSongs.length > 0) {
          setSongs(liveSongs);
          setBackendConnected(true);
        }
        if (liveAlbums && liveAlbums.length > 0) setAlbums(liveAlbums);
        if (liveGenres && liveGenres.length > 0) setGenres(liveGenres);
        if (liveTrending) setTrending(liveTrending);
      } catch (err) {
        console.warn('Backend connection failed, using local offline data:', err.message);
        setBackendConnected(false);
      }
    }

    loadBackendData();
  }, []);

  const currentSong = songs[currentSongIndex] || songs[0] || songsData[0];

  // Sync audio play/pause with isPlaying state
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio playback was prevented:', err);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSongIndex, currentSong]);

  // Sync volume and mute
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const nextSong = () => {
    if (songs.length === 0) return;
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
    setIsPlaying(true);
  };

  const previousSong = () => {
    if (songs.length === 0) return;
    setCurrentSongIndex((prevIndex) =>
      prevIndex === 0 ? songs.length - 1 : prevIndex - 1
    );
    setIsPlaying(true);
  };

  const selectSong = (index) => {
    if (index === currentSongIndex) {
      togglePlay();
    } else {
      setCurrentSongIndex(index);
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <div className="container">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentSong?.path}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={nextSong}
      />

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="content">
        {/* Top Banner */}
        <section className="top-content">
          <TrendingBanner
            trending={trending}
            onPlayNow={togglePlay}
            isPlaying={isPlaying}
          />
        </section>

        {/* Bottom Content Area */}
        <section className="bottom-content">
          <div className="playlist">
            {/* Left Column: Albums, Genres, and Top Songs */}
            <div className="left-side">
              <TopAlbums albums={albums} />

              <div className="left-side-bottom">
                <GenresTable genres={genres} />
                <TopSongs
                  songs={songs}
                  currentSongIndex={currentSongIndex}
                  isPlaying={isPlaying}
                  onSelectSong={selectSong}
                />
              </div>
            </div>

            {/* Right Column: Audio Player */}
            <AudioPlayer
              currentSong={currentSong}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              onTogglePlay={togglePlay}
              onPrevious={previousSong}
              onNext={nextSong}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onToggleMute={toggleMute}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
