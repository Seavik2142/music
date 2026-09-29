import React, { useState } from 'react';

export default function SongsTable({
  songs,
  onOpenAdd,
  onOpenEdit,
  onDelete,
  activePreview,
  setActivePreview,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSongs = songs.filter(
    (s) =>
      s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.album?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePreview = (song) => {
    if (activePreview?.id === song.id) {
      setActivePreview(null);
    } else {
      setActivePreview(song);
    }
  };

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <div className="search-box">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by title, artist, or album..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn-add-track" onClick={onOpenAdd}>
          <i className="fas fa-plus"></i>
          <span>Add New Track</span>
        </button>
      </div>

      {activePreview && (
        <div className="audio-preview-bar">
          <div className="preview-info">
            <i className="fas fa-volume-up preview-icon"></i>
            <span>
              Now Previewing: <strong>{activePreview.title}</strong> — {activePreview.artist}
            </span>
          </div>
          <audio controls autoPlay src={activePreview.path} className="preview-audio-player" />
          <button className="btn-close-preview" onClick={() => setActivePreview(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cover</th>
              <th>Title</th>
              <th>Artist</th>
              <th>Album</th>
              <th>Duration</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSongs.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-message">
                  No tracks found matching "{searchTerm}".
                </td>
              </tr>
            ) : (
              filteredSongs.map((song, idx) => (
                <tr key={song.id || idx}>
                  <td className="row-index">{idx + 1}</td>
                  <td>
                    <img
                      src={song.image || '/images/audio1.jpg'}
                      alt={song.title}
                      className="table-cover-img"
                    />
                  </td>
                  <td className="font-semibold text-white">{song.title}</td>
                  <td className="text-muted">{song.artist}</td>
                  <td className="text-muted">{song.album || 'Single'}</td>
                  <td className="text-muted">{song.duration || '3:30'}</td>
                  <td className="text-right">
                    <div className="action-buttons">
                      <button
                        className={`btn-action btn-preview ${
                          activePreview?.id === song.id ? 'active' : ''
                        }`}
                        title="Preview Audio"
                        onClick={() => togglePreview(song)}
                      >
                        <i
                          className={`fas ${
                            activePreview?.id === song.id ? 'fa-pause' : 'fa-play'
                          }`}
                        ></i>
                      </button>
                      <button
                        className="btn-action btn-edit"
                        title="Edit Track"
                        onClick={() => onOpenEdit(song)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-action btn-delete"
                        title="Delete Track"
                        onClick={() => onDelete(song.id, song.title)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
