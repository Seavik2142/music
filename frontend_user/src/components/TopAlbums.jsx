import React from 'react';
import { topAlbumsData } from '../data/musicData';

export default function TopAlbums({ albums = topAlbumsData }) {
  const displayAlbums = albums && albums.length > 0 ? albums : topAlbumsData;

  return (
    <div className="left-side-top">
      <div className="top-albums-title">
        <span>Top Albums</span>
        <button className="see-all-btn">See all</button>
      </div>
      <div className="top-albums">
        {displayAlbums.map((album) => (
          <div key={album.id} className="card-albums">
            <img src={album.image || '/images/top-album1.jpg'} alt={album.name} />
            <p>{album.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
