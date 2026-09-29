import React from 'react';

export default function GenresView({ genres }) {
  return (
    <div className="genres-page">
      <div className="section-toolbar">
        <div>
          <h2>Music Genres & Categories</h2>
          <p className="subtitle">Categorize audio tracks and curate discovery tags</p>
        </div>
      </div>

      <div className="genres-grid-admin">
        {genres.map((g) => (
          <div key={g.id} className="genre-card-admin" style={{ borderLeft: `6px solid ${g.color}` }}>
            <div className="genre-meta">
              <span className="genre-badge" style={{ backgroundColor: `${g.color}25`, color: g.color }}>
                {g.name}
              </span>
              <span className="genre-color-code">{g.color}</span>
            </div>
            <p className="genre-sub">Mapped in user recommendation algorithm</p>
          </div>
        ))}
      </div>
    </div>
  );
}
