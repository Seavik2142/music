import React from 'react';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function AudioPlayer({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onTogglePlay,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
}) {
  if (!currentSong) return null;

  return (
    <div className="right-side">
      <p className="adp-card-title">Now Playing</p>

      <div className="audio-player">
        <div className="adp-img-wrapper">
          <img
            src={currentSong.image}
            alt={currentSong.title}
            className={`adp-img ${isPlaying ? 'rotating-subtle' : ''}`}
          />
        </div>

        <div className="adp-title">
          <p className="song-name">{currentSong.title}</p>
          <p className="album-name">{currentSong.album}</p>
          <p className="artist-name">{currentSong.artist}</p>
        </div>

        {/* Progress Bar / Seekbar */}
        <div className="adp-progress-container">
          <span className="time-display">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime || 0}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="seek-slider"
          />
          <span className="time-display">
            {formatTime(duration) || currentSong.duration}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="adp-action">
          <button
            type="button"
            className="control-btn"
            id="previous"
            onClick={onPrevious}
            title="Previous Track"
            aria-label="Previous Track"
          >
            <i className="fas fa-backward"></i>
          </button>

          <button
            type="button"
            className="control-btn play-btn-main"
            id="play"
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </button>

          <button
            type="button"
            className="control-btn"
            id="next"
            onClick={onNext}
            title="Next Track"
            aria-label="Next Track"
          >
            <i className="fas fa-forward"></i>
          </button>
        </div>

        {/* Volume Slider */}
        <div className="volume-container">
          <button
            type="button"
            className="volume-btn"
            onClick={onToggleMute}
            aria-label="Mute/Unmute"
          >
            <i
              className={`fas ${
                isMuted || volume === 0
                  ? 'fa-volume-mute'
                  : volume < 0.5
                  ? 'fa-volume-down'
                  : 'fa-volume-up'
              }`}
            ></i>
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  );
}
