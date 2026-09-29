import React, { useState } from 'react';

export default function AlbumsView({ albums, onAddAlbum, onDeleteAlbum }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlbum, setNewAlbum] = useState({ name: '', artist: '', image: '/images/top-album1.jpg' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newAlbum.name) return;
    await onAddAlbum(newAlbum);
    setNewAlbum({ name: '', artist: '', image: '/images/top-album1.jpg' });
    setShowAddForm(false);
  };

  return (
    <div className="albums-page">
      <div className="section-toolbar">
        <div>
          <h2>Albums & Discography</h2>
          <p className="subtitle">Manage artist albums, EPs, and cover artwork</p>
        </div>
        <button className="btn-add-track" onClick={() => setShowAddForm(!showAddForm)}>
          <i className={`fas ${showAddForm ? 'fa-minus' : 'fa-plus'}`}></i>
          <span>{showAddForm ? 'Cancel' : 'New Album'}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="add-album-card">
          <h3>Create New Album</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Album Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Memories Do Not Open"
                value={newAlbum.name}
                onChange={(e) => setNewAlbum({ ...newAlbum, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Artist Name</label>
              <input
                type="text"
                placeholder="e.g. The Chainsmokers"
                value={newAlbum.artist}
                onChange={(e) => setNewAlbum({ ...newAlbum, artist: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Cover Image Path</label>
              <input
                type="text"
                placeholder="/images/top-album1.jpg"
                value={newAlbum.image}
                onChange={(e) => setNewAlbum({ ...newAlbum, image: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            Save Album
          </button>
        </form>
      )}

      <div className="albums-grid">
        {albums.map((album) => (
          <div key={album.id} className="album-card">
            <div className="album-img-wrapper">
              <img src={album.image || '/images/top-album1.jpg'} alt={album.name} />
              <button
                className="btn-delete-album"
                onClick={() => onDeleteAlbum(album.id, album.name)}
                title="Delete Album"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
            <div className="album-details">
              <h4>{album.name}</h4>
              <p>{album.artist || 'SoundFly Artist'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
