import React, { useState, useEffect } from 'react';

export default function SongModal({ isOpen, onClose, onSave, editingSong }) {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    duration: '',
    path: '',
    image: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingSong) {
      setFormData({
        title: editingSong.title || '',
        artist: editingSong.artist || '',
        album: editingSong.album || '',
        duration: editingSong.duration || '3:30',
        path: editingSong.path || '/songs/love-like-this.mp3',
        image: editingSong.image || '/images/audio1.jpg',
      });
    } else {
      setFormData({
        title: '',
        artist: '',
        album: '',
        duration: '3:30',
        path: '/songs/love-like-this.mp3',
        image: '/images/audio1.jpg',
      });
    }
  }, [editingSong, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.artist) return;
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      alert('Error saving song: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '460px',
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
            <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <i className="fas fa-compact-disc" style={{ color: '#00c896', fontSize: '0.85rem' }}></i>
              {editingSong ? 'Edit Track Details' : 'Upload New Track'}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
              {editingSong ? 'Modify catalog metadata & media pointers' : 'Register audio track to creator discography'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', padding: '4px' }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
              Song Title <span style={{ color: '#ff5252' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Blinding Lights"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                Artist Name <span style={{ color: '#ff5252' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. The Weeknd"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
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
                Album / EP
              </label>
              <input
                type="text"
                placeholder="e.g. After Hours"
                value={formData.album}
                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                Duration (MM:SS)
              </label>
              <input
                type="text"
                placeholder="e.g. 3:20"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
                Cover Image URL
              </label>
              <input
                type="text"
                placeholder="/images/audio1.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
              Audio Source Path (MP3)
            </label>
            <input
              type="text"
              placeholder="/songs/love-like-this.mp3"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #1e293b', paddingTop: '12px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
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
              disabled={isSubmitting}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                background: '#00c896',
                border: 'none',
                color: '#081a13',
                fontSize: '0.76rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {isSubmitting ? 'Saving...' : editingSong ? 'Update Track' : 'Save Track'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
