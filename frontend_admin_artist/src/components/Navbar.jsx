import React from 'react';

export default function Navbar({
  currentTab,
  backendStatus,
  onOpenAddSong,
  currentUser,
  onLogout,
  onNavigateProfile,
}) {
  const tabConfig = {
    // Artist routes
    'artist-dashboard': { title: 'Dashboard', section: 'Artist Studio', badgeColor: '#00C896' },
    'artist-songs': { title: 'Tracks', section: 'Artist Studio', badgeColor: '#00C896' },
    'artist-albums': { title: 'Albums', section: 'Artist Studio', badgeColor: '#00C896' },
    'artist-profile': { title: 'Profile', section: 'Artist Studio', badgeColor: '#00C896' },

    // Admin routes
    'admin-dashboard': { title: 'Master Dashboard', section: 'Administration', badgeColor: '#38bdf8' },
    'admin-content': { title: 'Content & Music', section: 'Administration', badgeColor: '#00C896' },
    'admin-catalog': { title: 'Content & Music', section: 'Administration', badgeColor: '#00C896' },
    'admin-users': { title: 'Users & Roles', section: 'Administration', badgeColor: '#8685EF' },
    'admin-financial': { title: 'System & Finance', section: 'Administration', badgeColor: '#FFAA00' },
    'admin-disputes': { title: 'Reports & Disputes', section: 'Administration', badgeColor: '#FF5252' },
    'admin-settings': { title: 'Profile & Settings', section: 'Administration', badgeColor: '#38bdf8' },
    'admin-profile': { title: 'Profile & Settings', section: 'Administration', badgeColor: '#38bdf8' },
    'admin-switch-account': { title: 'Change Account & Authentication', section: 'Administration', badgeColor: '#FFAA00' },
  };

  const currentConfig = tabConfig[currentTab] || {
    title: 'Overview',
    section: 'SoundFly',
    badgeColor: '#2D659B',
  };

  const hasArtistRole = currentUser?.roles?.includes('artist');
  const isAdminRoute = currentTab.startsWith('admin-');

  return (
    <header className="admin-header">
      {/* Clean, single-line breadcrumb trail with small crisp text */}
      <div className="header-left">
        <nav className="header-breadcrumb" aria-label="Breadcrumb">
          <span className="crumb-brand">SoundFly</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-section" style={{ color: currentConfig.badgeColor }}>
            {currentConfig.section}
          </span>
          <span className="crumb-sep">/</span>
          <span className="crumb-current">{currentConfig.title}</span>
        </nav>
      </div>

      {/* Clean Right Controls: Status indicator, artist quick action & account pill */}
      <div className="header-right">
        {/* Minimal backend status */}
        <div
          className={`system-status-pill ${backendStatus ? 'online' : 'offline'}`}
          title={backendStatus ? 'PostgreSQL API Connected' : 'API Offline'}
        >
          <span className="status-indicator-dot"></span>
          <span className="status-indicator-text">{backendStatus ? 'Live' : 'Offline'}</span>
        </div>

        {/* Quick Upload Action for Artists */}
        {hasArtistRole && !isAdminRoute && (
          <button className="btn-upload-quick" onClick={onOpenAddSong}>
            <i className="fas fa-plus"></i>
            <span>Upload Track</span>
          </button>
        )}

        {/* Clean Profile Account Trigger */}
        <button
          className="header-profile-btn"
          onClick={() => onNavigateProfile?.()}
          title={currentUser ? "View account profile & settings" : "Account"}
        >
          <img
            src={currentUser?.avatar || '/images/avatar.jpg'}
            alt={currentUser?.username || 'User'}
            className="navbar-avatar"
          />
          <span className="header-profile-name">
            {currentUser?.username || 'Guest'}
          </span>
          <span className="header-profile-role-tag">
            {currentUser?.roles?.[0] || 'Guest'}
          </span>
        </button>

        {/* Clean Header Log Out Button */}
        {currentUser && onLogout && (
          <button
            type="button"
            className="btn-upload-quick"
            onClick={onLogout}
            title="Log Out (Return to Auth Login Form)"
            style={{
              background: 'rgba(255, 82, 82, 0.1)',
              borderColor: 'rgba(255, 82, 82, 0.3)',
              color: '#ff6b6b',
              padding: '5px 10px',
              fontSize: '0.74rem',
            }}
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Log Out</span>
          </button>
        )}
      </div>
    </header>
  );
}
