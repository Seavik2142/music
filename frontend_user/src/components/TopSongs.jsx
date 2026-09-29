import React from 'react';

export default function TopSongs({ songs, currentSongIndex, isPlaying, onSelectSong }) {
  return (
    <div className="right-top-songs">
      <p className="section-heading">Top Songs</p>
      <div className="songs">
        {songs.map((song, idx) => {
          const isCurrent = currentSongIndex === idx;
          return (
            <div
              key={song.id}
              className={`song ${isCurrent ? 'song-active' : ''}`}
              onClick={() => onSelectSong(idx)}
            >
              <img src={song.image} alt={song.title} className="song-img" />
              <div className="song-title">
                <span>{song.title}</span>
                <span>{song.artist}</span>
              </div>
              <span className="song-time">{song.duration}</span>
              <button
                type="button"
                className="btn-song-play"
                aria-label={`Play ${song.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSong(idx);
                }}
              >
                <i
                  className={
                    isCurrent && isPlaying
                      ? 'fas fa-pause-circle'
                      : 'far fa-play-circle'
                  }
                ></i>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
