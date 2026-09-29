import React from 'react';
import { trendingData } from '../data/musicData';

export default function TrendingBanner({ trending, onPlayNow, isPlaying }) {
  const data = trending || trendingData;

  return (
    <div
      className="trending"
      style={{ backgroundImage: `url(${data.bgImage || data.bg_image || '/images/layout.jpg'})` }}
    >
      <div className="left">
        <p className="type">{data.type || 'Trending'}</p>
        <h1 className="title">{data.title}</h1>
        <p className="artist">{data.artist}</p>
        <p className="view">{data.views}</p>
        <button className="btn-play" onClick={onPlayNow}>
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} style={{ marginRight: '8px' }}></i>
          {isPlaying ? 'Pause' : 'Play Now'}
        </button>
      </div>

      <div className="right">
        <img src={data.avatar || '/images/avatar.jpg'} alt={data.curator} />
        <span>{data.curator}</span>
      </div>
    </div>
  );
}
