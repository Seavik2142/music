import React from 'react';

export default function ArtistSidebar({
  currentTab,
  setCurrentTab,
  currentUser,
  onLogout,
  onOpenAddSong,
}) {
  const artistNavItems = [
    { id: 'artist-dashboard', label: 'Artist Dashboard', icon: 'fas fa-chart-line', badge: 'Studio' },
    { id: 'artist-songs', label: 'My Tracks', icon: 'fas fa-music', badge: null },
    { id: 'artist-albums', label: 'Albums & EPs', icon: 'fas fa-compact-disc', badge: null },
    { id: 'artist-profile', label: 'Artist Profile', icon: 'fas fa-user-astronaut', badge: 'Verified' },
  ];

  return (
    <aside className="portal-sidebar artist-sidebar-theme">
      {/* Artist Studio Branding */}
      <div className="portal-brand">
        <div className="brand-icon-wrapper artist-icon-bg">
          <i className="fas fa-headphones-alt"></i>
        </div>
        <div className="brand-text">
          <span className="brand-title">SoundFly</span>
          <span className="brand-subtitle artist-badge-text">ARTIST STUDIO</span>
        </div>
      </div>

      {/* Artist Navigation Routes */}
      <nav className="portal-nav">
        <p className="nav-category-label">CREATOR STUDIO</p>
        <div className="nav-category-items">
          {artistNavItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                className={`portal-nav-item artist-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentTab(item.id)}
              >
                <i className={item.icon}></i>
                <span className="nav-title">{item.label}</span>
                {item.badge && <span className="item-badge artist-badge">{item.badge}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Quick Upload CTA in Artist Sidebar */}
      <div className="sidebar-cta-box">
        <div className="cta-icon">
          <i className="fas fa-cloud-upload-alt"></i>
        </div>
        <div className="cta-content">
          <h4>Publish New Music</h4>
          <p>Upload a track to SoundFly streaming catalog</p>
          <button className="btn-cta-action" onClick={onOpenAddSong}>
            Upload Track
          </button>
        </div>
      </div>

      {/* Artist Profile Footer */}
      <div className="sidebar-footer">
        <div
          className={`user-profile-button ${currentTab === 'artist-profile' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}
        >
          <div
            onClick={() => setCurrentTab('artist-profile')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, cursor: 'pointer' }}
            title="Open Artist Profile"
          >
            <img
              src={currentUser?.avatar || '/images/avatar.jpg'}
              alt={currentUser?.username}
              className="user-avatar-round"
            />
            <div className="user-meta-col">
              <span className="user-name-text">{currentUser?.full_name || currentUser?.username}</span>
              <span className="user-role-sub artist-role-sub">
                <i className="fas fa-check-circle"></i> VERIFIED ARTIST
              </span>
            </div>
          </div>

          {currentUser && onLogout && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
              title="Log Out (Go to Gmail & Password Login Form)"
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                padding: '5px',
                cursor: 'pointer',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ff5252')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              <i className="fas fa-sign-out-alt" style={{ fontSize: '0.8rem' }}></i>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
