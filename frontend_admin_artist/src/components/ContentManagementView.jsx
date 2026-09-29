import React, { useState } from 'react';

export default function ContentManagementView({
  songs = [],
  pendingSongs = [],
  genres = [],
  onApproveSong,
  onRejectSong,
  onTogglePlayback,
  onDeleteSong,
  onAddGenre,
  onDeleteGenre,
  activePreview,
  setActivePreview,
}) {
  const [activeTab, setActiveTab] = useState('approval'); // 'approval' | 'catalog' | 'genres'
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddGenreOpen, setIsAddGenreOpen] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreColor, setNewGenreColor] = useState('#2D659B');
  const [rejectReasonModal, setRejectReasonModal] = useState(null); // song object
  const [rejectReason, setRejectReason] = useState('');

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (rejectReasonModal) {
      onRejectSong(rejectReasonModal.id, rejectReason || 'Content policy non-compliance');
      setRejectReasonModal(null);
      setRejectReason('');
    }
  };

  const handleCreateGenre = async (e) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;
    await onAddGenre({ name: newGenreName.trim(), color: newGenreColor, col_span: '1' });
    setNewGenreName('');
    setIsAddGenreOpen(false);
  };

  const filteredSongs = songs.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.title?.toLowerCase().includes(term) ||
      s.artist?.toLowerCase().includes(term) ||
      s.album?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="content-management-page">
      {/* Top Header & Tab Switcher */}
      <div className="section-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Content & Music Management</h2>
          <p className="subtitle">
            Catalog approval queue, global playback controls, and music genre taxonomy
          </p>
        </div>

        {/* Operational Subtabs */}
        <div className="content-subnav" style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid #2a3447' }}>
          <button
            className={`btn-subtab ${activeTab === 'approval' ? 'active' : ''}`}
            onClick={() => setActiveTab('approval')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'approval' ? '#00c896' : 'transparent',
              color: activeTab === 'approval' ? '#000' : '#94a3b8',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fas fa-clipboard-check"></i>
            <span>Song Approval</span>
            {pendingSongs.length > 0 && (
              <span style={{ backgroundColor: activeTab === 'approval' ? '#000' : '#ff5252', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '0.7rem' }}>
                {pendingSongs.length}
              </span>
            )}
          </button>

          <button
            className={`btn-subtab ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'catalog' ? '#2D659B' : 'transparent',
              color: activeTab === 'catalog' ? '#fff' : '#94a3b8',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fas fa-globe"></i>
            <span>Global Content Control ({songs.length})</span>
          </button>

          <button
            className={`btn-subtab ${activeTab === 'genres' ? 'active' : ''}`}
            onClick={() => setActiveTab('genres')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'genres' ? '#8685EF' : 'transparent',
              color: activeTab === 'genres' ? '#fff' : '#94a3b8',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fas fa-tags"></i>
            <span>Genres & Tags ({genres.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 1. SONG & ALBUM APPROVAL QUEUE                          */}
      {/* ======================================================= */}
      {activeTab === 'approval' && (
        <div className="table-card" style={{ marginTop: '16px' }}>
          <div className="card-header-row" style={{ padding: '20px 24px', borderBottom: '1px solid #2a3447', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-tasks" style={{ color: '#00c896' }}></i>
                Pending Artist Uploads Review Queue
              </h3>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.82rem' }}>
                Verify incoming tracks for copyright clearance, explicit audio tags, and production standards
              </p>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Pending Review: <strong style={{ color: '#00c896' }}>{pendingSongs.length} items</strong>
            </span>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Track Details</th>
                  <th>Artist</th>
                  <th>Album</th>
                  <th>Duration</th>
                  <th>Audit Preview</th>
                  <th style={{ textAlign: 'center' }}>Approval Decision</th>
                </tr>
              </thead>
              <tbody>
                {pendingSongs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '48px' }}>
                      <i className="fas fa-check-double" style={{ fontSize: '2.5rem', color: '#00c896', marginBottom: '12px', display: 'block' }}></i>
                      <strong style={{ color: '#fff', fontSize: '1.05rem' }}>Review Queue is All Clear!</strong>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
                        All uploaded artist tracks have been approved and published to the platform catalog.
                      </p>
                    </td>
                  </tr>
                ) : (
                  pendingSongs.map((song, i) => (
                    <tr key={song.id || i}>
                      <td className="row-index">{song.id}</td>
                      <td>
                        <div className="song-title-cell">
                          <img src={song.image || '/images/audio1.jpg'} alt={song.title} className="table-cover-img" />
                          <div>
                            <div className="font-semibold text-white">{song.title}</div>
                            <span className="badge-pending" style={{ fontSize: '0.68rem', backgroundColor: 'rgba(255, 170, 0, 0.15)', color: '#FFAA00', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(255, 170, 0, 0.3)' }}>
                              ⏳ PENDING REVIEW
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="text-white font-medium">{song.artist}</td>
                      <td className="text-muted">{song.album || 'Single'}</td>
                      <td className="text-muted">{song.duration || '3:30'}</td>
                      <td>
                        <button
                          className="btn-preview-small"
                          onClick={() => setActivePreview(activePreview?.id === song.id ? null : song)}
                          style={{
                            background: activePreview?.id === song.id ? '#00c896' : 'rgba(255,255,255,0.05)',
                            color: activePreview?.id === song.id ? '#000' : '#fff',
                            border: '1px solid #334155',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <i className={`fas ${activePreview?.id === song.id ? 'fa-pause' : 'fa-play'}`}></i>
                          <span>{activePreview?.id === song.id ? 'Playing' : 'Listen'}</span>
                        </button>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => onApproveSong(song.id)}
                            title="Approve and publish to public SoundFly catalog"
                            style={{
                              background: '#00c896',
                              color: '#000',
                              border: 'none',
                              padding: '7px 14px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '0.78rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <i className="fas fa-check"></i> Approve
                          </button>
                          <button
                            onClick={() => setRejectReasonModal(song)}
                            title="Reject track with reason"
                            style={{
                              background: 'rgba(255, 82, 82, 0.15)',
                              color: '#ff5252',
                              border: '1px solid rgba(255, 82, 82, 0.4)',
                              padding: '7px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.78rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <i className="fas fa-ban"></i> Reject
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
      )}

      {/* ======================================================= */}
      {/* 2. GLOBAL CONTENT CONTROL TABLE                         */}
      {/* ======================================================= */}
      {activeTab === 'catalog' && (
        <div className="table-card" style={{ marginTop: '16px' }}>
          <div className="table-toolbar" style={{ padding: '16px 20px', borderBottom: '1px solid #2a3447', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="search-box" style={{ maxWidth: '400px', width: '100%' }}>
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search across all catalog tracks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Showing {filteredSongs.length} tracks across all artists
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Track</th>
                  <th>Artist</th>
                  <th>Album</th>
                  <th>Streams</th>
                  <th>Playback Access</th>
                  <th style={{ textAlign: 'center' }}>Takedown</th>
                </tr>
              </thead>
              <tbody>
                {filteredSongs.map((s, i) => {
                  const isEnabled = s.is_enabled !== false;
                  return (
                    <tr key={s.id || i}>
                      <td className="row-index">{s.id}</td>
                      <td>
                        <div className="song-title-cell">
                          <img src={s.image || '/images/audio1.jpg'} alt={s.title} className="table-cover-img" />
                          <div>
                            <div className="font-semibold text-white">{s.title}</div>
                            <span style={{ fontSize: '0.7rem', color: isEnabled ? '#00c896' : '#ff5252' }}>
                              ● {isEnabled ? 'Live on Catalog' : 'Playback Disabled'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="text-white">{s.artist}</td>
                      <td className="text-muted">{s.album || 'Single'}</td>
                      <td className="text-muted">{(s.streams_count || 14250).toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => onTogglePlayback(s.id, !isEnabled)}
                          title={isEnabled ? 'Disable track playback platform-wide' : 'Enable track playback'}
                          style={{
                            background: isEnabled ? 'rgba(0, 200, 150, 0.12)' : 'rgba(255, 82, 82, 0.12)',
                            color: isEnabled ? '#00c896' : '#ff5252',
                            border: `1px solid ${isEnabled ? 'rgba(0, 200, 150, 0.3)' : 'rgba(255, 82, 82, 0.3)'}`,
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <i className={`fas ${isEnabled ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
                          <span>{isEnabled ? 'Enabled' : 'Disabled'}</span>
                        </button>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-delete-user"
                          onClick={() => onDeleteSong(s.id, s.title)}
                          title="Global Moderation Takedown"
                          style={{
                            background: 'rgba(255, 82, 82, 0.1)',
                            color: '#ff5252',
                            border: '1px solid rgba(255, 82, 82, 0.3)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <i className="fas fa-trash-alt"></i> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 3. GENRE & TAG MANAGEMENT                               */}
      {/* ======================================================= */}
      {activeTab === 'genres' && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Genre Classification & Taxonomy</h3>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.82rem' }}>
                Organize music discovery categories and tagging for listener browsing
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={() => setIsAddGenreOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px' }}
            >
              <i className="fas fa-plus"></i> Add New Genre
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {genres.map((g) => (
              <div
                key={g.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid #2a3447',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: g.color || '#2D659B',
                      display: 'inline-block',
                      boxShadow: `0 0 12px ${g.color || '#2D659B'}80`,
                    }}
                  ></span>
                  <button
                    onClick={() => onDeleteGenre(g.id, g.name)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}
                    title="Delete Genre"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem' }}>{g.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Color Hex: {g.color || '#2D659B'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Genre Modal */}
      {isAddGenreOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddGenreOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '400px',
              background: '#0e131f',
              border: '1px solid #1e293b',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fas fa-tags" style={{ color: '#8685ef' }}></i>
                  Add Music Genre
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                  Create category label and taxonomy theme badge
                </p>
              </div>
              <button
                onClick={() => setIsAddGenreOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateGenre} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                  Genre Name <span style={{ color: '#ff5252' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hip-Hop, Synthwave, Acoustic"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    background: '#080c14',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.8rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                  Badge Theme Color
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={newGenreColor}
                    onChange={(e) => setNewGenreColor(e.target.value)}
                    style={{
                      width: '36px',
                      height: '32px',
                      border: '1px solid #1e293b',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      background: '#080c14',
                      padding: '2px',
                    }}
                  />
                  <input
                    type="text"
                    value={newGenreColor}
                    onChange={(e) => setNewGenreColor(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      background: '#080c14',
                      border: '1px solid #1e293b',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #1e293b', paddingTop: '12px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddGenreOpen(false)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid #2a3447',
                    color: '#94a3b8',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '6px 16px',
                    borderRadius: '6px',
                    background: '#8685ef',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Create Genre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectReasonModal && (
        <div className="modal-backdrop" onClick={() => setRejectReasonModal(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '440px',
              background: '#0e131f',
              border: '1px solid #1e293b',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: '#ff5252', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fas fa-exclamation-triangle"></i>
                  Reject Track Upload
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                  Provide explicit rejection notes for the artist studio
                </p>
              </div>
              <button
                onClick={() => setRejectReasonModal(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleConfirmReject} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  background: 'rgba(255, 82, 82, 0.06)',
                  border: '1px solid rgba(255, 82, 82, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.76rem',
                  color: '#cbd5e1',
                }}
              >
                Rejecting: <strong style={{ color: '#fff' }}>"{rejectReasonModal.title}"</strong> by <strong style={{ color: '#fff' }}>{rejectReasonModal.artist}</strong>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                  Reason / Copyright Violation Notice
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Master recording unlicensed sample detected, or low audio bitrate."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    background: '#080c14',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.78rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #1e293b', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setRejectReasonModal(null)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid #2a3447',
                    color: '#94a3b8',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '6px 16px',
                    borderRadius: '6px',
                    background: '#ff5252',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
