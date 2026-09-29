import React from 'react';
import { genresData } from '../data/musicData';

export default function GenresTable({ genres = genresData }) {
  const displayGenres = genres && genres.length > 0 ? genres : genresData;

  return (
    <div className="left-genres">
      <div className="genres-table-title">
        <span>Genres</span>
        <button className="see-all-btn">See all</button>
      </div>
      <div className="genres-table">
        {displayGenres.map((genre, idx) => (
          <div
            key={genre.id || idx}
            className={`grid-item grid-item-${genre.id || idx + 1}`}
            style={{ backgroundColor: genre.color }}
          >
            {genre.name}
          </div>
        ))}
      </div>
    </div>
  );
}
