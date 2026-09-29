import React, { useState, useEffect } from 'react';
import { getAdminStats } from '../services/api';

export default function AdminOverview({ onNavigate, pendingCount = 0, disputeCount = 0 }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArtists: 0,
    totalSongs: 0,
    totalAlbums: 0,
    totalStreams: 1425000,
    monthlyRevenue: 24874.98,
    pendingReviews: 0,
    openDisputes: 0,
    systemHealth: 'Optimal',
    databaseEngine: 'PostgreSQL',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getAdminStats();
        if (res) setStats(res);
      } catch (err) {
        console.warn('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalStreamsFormatted = Number(stats.totalStreams || 1425000).toLocaleString();
  const monthlyRev = Number(stats.monthlyRevenue || 24874.98);
  const dailyRev = (monthlyRev / 30).toFixed(2);
  const effectivePending = stats.pendingReviews ?? pendingCount;
  const effectiveDisputes = stats.openDisputes ?? disputeCount;

  // Master KPI Metrics Cards
  const kpiCards = [
    {
      title: 'Total Platform Users',
      val: stats.totalUsers || 0,
      sub: 'Listeners & Subscribers',
      icon: 'fas fa-users',
      color: '#2D659B',
      action: () => onNavigate('admin-users'),
      btnText: 'Manage Users',
    },
    {
      title: 'Active Artists',
      val: stats.totalArtists || 0,
      sub: 'Verified Content Creators',
      icon: 'fas fa-microphone-alt',
      color: '#00C896',
      action: () => onNavigate('admin-users'),
      btnText: 'Verify Artists',
    },
    {
      title: 'Total Audio Streams',
      val: totalStreamsFormatted,
      sub: 'Platform-wide Playbacks',
      icon: 'fas fa-play-circle',
      color: '#8685EF',
      action: () => onNavigate('admin-content'),
      btnText: 'View Tracks',
    },
    {
      title: 'Monthly Gross Revenue',
      val: `$${monthlyRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: `Daily Run-Rate: ~$${Number(dailyRev).toLocaleString()} / day`,
      icon: 'fas fa-coins',
      color: '#FFAA00',
      action: () => onNavigate('admin-financial'),
      btnText: 'Finance Overview',
    },
  ];

  // 4 Core Operational Modules
  const operationalModules = [
    {
      id: 'admin-content',
      title: '1. Content & Music Management',
      icon: 'fas fa-compact-disc',
      color: '#00c896',
      badge: effectivePending > 0 ? `${effectivePending} Pending Approval` : 'Active',
      badgeType: effectivePending > 0 ? 'urgent' : 'normal',
      description:
        'Review and approve artist song uploads, disable playback platform-wide, and manage music genres & taxonomy.',
      features: [
        'Song & Album Approval Queue with Copyright Checks',
        'Global Content Control & Playback Kill-Switch',
        'Music Genre & Tag Taxonomy Management',
      ],
    },
    {
      id: 'admin-users',
      title: '2. User & Role Management',
      icon: 'fas fa-users-cog',
      color: '#2D659B',
      badge: 'RBAC Security',
      badgeType: 'normal',
      description:
        'Grant user roles (Admin, Moderator, Artist, Premium, Free), grant verified artist blue checkmarks, and suspend policy violators.',
      features: [
        'Role-Based Access Control (Admin, Mod, Artist, Premium, Free)',
        'Artist Verification & Official Badging',
        'Community Guidelines Account Suspension Reason Modal',
      ],
    },
    {
      id: 'admin-financial',
      title: '3. System & Financial Management',
      icon: 'fas fa-wallet',
      color: '#FFAA00',
      badge: 'Billing & Ads',
      badgeType: 'normal',
      description:
        'Oversee subscription membership packages, control banner/audio advertising placements, and process artist stream royalty payouts.',
      features: [
        'Subscription & Billing Pricing Control (Free vs. Premium)',
        'Ad Campaign Management (Banner Ads & Audio Ads)',
        'Artist Royalty Ledger ($0.004/stream) & Payout Disbursals',
      ],
    },
    {
      id: 'admin-disputes',
      title: '4. Platform Moderation & Disputes',
      icon: 'fas fa-gavel',
      color: '#ff5252',
      badge: effectiveDisputes > 0 ? `${effectiveDisputes} Open Claims` : 'All Settled',
      badgeType: effectiveDisputes > 0 ? 'urgent' : 'normal',
      description:
        'Receive, investigate, and settle complaints from copyright holders or artists regarding duplicate tracks and unauthorized uploads.',
      features: [
        'Automated Complaint Ingestion & Ticket Numbering',
        'Copyright Infringement & Duplicate Audio Audits',
        'Instant Content Takedown & Written Settlement Notes',
      ],
    },
    {
      id: 'admin-settings',
      title: '5. Profile & Platform Governance',
      icon: 'fas fa-cog',
      color: '#38bdf8',
      badge: 'System Policies',
      badgeType: 'normal',
      description:
        'Manage root administrator identity credentials, audio streaming bitrates, maintenance flags, and global royalty calculation models.',
      features: [
        'Administrator Identity & Password Credential Management',
        'Audio Bitrate Policies (320kbps Hi-Fi / Max Upload Limits)',
        'Global Maintenance Mode & Public Registration Controls',
      ],
    },
  ];

  return (
    <div className="admin-overview-page">
      {/* Top Banner */}
      <div className="section-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Platform Master Dashboard</h2>
          <p className="subtitle">
            Centralized operations plane: live aggregates, content moderation, RBAC governance, and financial ledger
          </p>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        {kpiCards.map((card, idx) => (
          <div key={idx} className="stat-card admin-metric-card">
            <div
              className="stat-icon-wrapper"
              style={{ backgroundColor: `${card.color}20`, color: card.color }}
            >
              <i className={card.icon}></i>
            </div>
            <div className="stat-info">
              <span className="stat-label">{card.title}</span>
              <h2 className="stat-value">{loading ? '...' : card.val}</h2>
              <span className="stat-change text-muted">{card.sub}</span>
              <button
                className="admin-card-btn"
                style={{ color: card.color }}
                onClick={card.action}
              >
                {card.btnText} →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Urgent Action Alerts Bar (if pending approval or open disputes) */}
      {(effectivePending > 0 || effectiveDisputes > 0) && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(255, 82, 82, 0.12) 0%, rgba(255, 170, 0, 0.12) 100%)',
            border: '1px solid rgba(255, 170, 0, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: '#ff5252', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div>
              <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Action Required on Platform:</strong>
              <p style={{ margin: '2px 0 0', color: '#cbd5e1', fontSize: '0.85rem' }}>
                {effectivePending > 0 && `• ${effectivePending} song(s) awaiting approval in Content Queue. `}
                {effectiveDisputes > 0 && `• ${effectiveDisputes} open copyright / duplicate claim ticket(s).`}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {effectivePending > 0 && (
              <button
                onClick={() => onNavigate('admin-content')}
                style={{
                  background: '#00c896',
                  color: '#000',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Review Songs →
              </button>
            )}
            {effectiveDisputes > 0 && (
              <button
                onClick={() => onNavigate('admin-disputes')}
                style={{
                  background: '#ff5252',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Audit Disputes →
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4 Core Pillars of Administration */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '8px' }}>
          Administration Operational Pillars
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
          Direct access to the 4 platform governance modules
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {operationalModules.map((mod) => (
          <div
            key={mod.id}
            onClick={() => onNavigate(mod.id)}
            style={{
              background: '#161c28',
              border: '1px solid #2a3447',
              borderRadius: '12px',
              padding: '22px',
              cursor: 'pointer',
              transition: 'transform 0.2s, border-color 0.2s',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = mod.color;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2a3447';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: `${mod.color}20`,
                    color: mod.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}
                >
                  <i className={mod.icon}></i>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    backgroundColor: mod.badgeType === 'urgent' ? 'rgba(255, 82, 82, 0.2)' : 'rgba(255,255,255,0.06)',
                    color: mod.badgeType === 'urgent' ? '#ff5252' : '#cbd5e1',
                    border: `1px solid ${mod.badgeType === 'urgent' ? '#ff5252' : '#334155'}`,
                  }}
                >
                  {mod.badge}
                </span>
              </div>

              <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: '0 0 8px' }}>{mod.title}</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: '1.5', margin: '0 0 16px' }}>
                {mod.description}
              </p>

              <div style={{ borderTop: '1px solid #232c3d', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {mod.features.map((feat, fidx) => (
                  <div key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                    <i className="fas fa-check" style={{ color: mod.color, fontSize: '0.7rem' }}></i>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: mod.color, fontWeight: '700', fontSize: '0.84rem' }}>
              <span>Launch Module</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
