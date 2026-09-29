import React from 'react';

export default function AdminSidebar({
  currentTab,
  setCurrentTab,
  currentUser,
  pendingCount = 0,
  disputeCount = 0,
  onLogout,
}) {
  const navSections = [
    {
      category: 'Overview',
      items: [
        {
          id: 'admin-dashboard',
          label: 'Master Dashboard',
          icon: 'fas fa-chart-pie',
          badge: null,
        },
      ],
    },
    {
      category: 'Platform & Content',
      items: [
        {
          id: 'admin-content',
          label: 'Content & Music',
          icon: 'fas fa-compact-disc',
          badge: pendingCount > 0 ? `${pendingCount}` : null,
          badgeColor: '#00c896',
        },
        {
          id: 'admin-users',
          label: 'Users & Roles',
          icon: 'fas fa-users-cog',
          badge: 'RBAC',
          badgeColor: '#8685EF',
        },
      ],
    },
    {
      category: 'Finance & Compliance',
      items: [
        {
          id: 'admin-financial',
          label: 'System & Finance',
          icon: 'fas fa-wallet',
          badge: null,
        },
        {
          id: 'admin-disputes',
          label: 'Reports & Disputes',
          icon: 'fas fa-gavel',
          badge: disputeCount > 0 ? `${disputeCount}` : null,
          badgeColor: '#ff5252',
        },
      ],
    },
    {
      category: 'System Governance',
      items: [
        {
          id: 'admin-settings',
          label: 'Profile & Settings',
          icon: 'fas fa-cog',
          badge: 'SYS',
          badgeColor: '#38bdf8',
        },
      ],
    },
  ];

  return (
    <aside className="portal-sidebar admin-sidebar-theme">
      {/* Admin Console Branding */}
      <div className="portal-brand">
        <div className="brand-icon-wrapper admin-icon-bg">
          <i className="fas fa-shield-alt"></i>
        </div>
        <div className="brand-text">
          <span className="brand-title">SoundFly</span>
          <span className="brand-subtitle admin-badge-text">ADMIN CONSOLE</span>
        </div>
      </div>

      {/* Admin Navigation Routes */}
      <nav className="portal-nav">
        {navSections.map((sec, sIdx) => (
          <div key={sIdx} className="nav-section-group">
            <p className="nav-category-label">{sec.category}</p>
            <div className="nav-category-items">
              {sec.items.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`portal-nav-item admin-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setCurrentTab(item.id)}
                    title={item.label}
                  >
                    <i className={item.icon}></i>
                    <span className="nav-title">{item.label}</span>
                    {item.badge && (
                      <span
                        className="item-badge"
                        style={{
                          background: item.badgeColor ? `${item.badgeColor}22` : 'rgba(255, 255, 255, 0.08)',
                          color: item.badgeColor || '#94a3b8',
                          border: item.badgeColor ? `1px solid ${item.badgeColor}40` : '1px solid rgba(255, 255, 255, 0.12)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin Profile Footer */}
      <div className="sidebar-footer">
        <div
          className={`user-profile-button ${currentTab === 'admin-settings' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}
        >
          <div
            onClick={() => setCurrentTab('admin-settings')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, cursor: 'pointer' }}
            title="Open Administrator Profile & Platform Settings"
          >
            <img
              src={currentUser?.avatar || '/images/avatar.jpg'}
              alt={currentUser?.username}
              className="user-avatar-round"
            />
            <div className="user-meta-col">
              <span className="user-name-text">
                {currentUser ? (currentUser.full_name || currentUser.username) : 'Sign In'}
              </span>
              <span className="user-role-sub admin-role-sub">
                <i className="fas fa-shield-alt"></i> {currentUser ? 'Platform Admin' : 'Authentication'}
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
