import React, { useState } from 'react';

export default function FinancialManagementView({
  financialStats,
  subscriptions = [],
  ads = [],
  royalties = [],
  onToggleAd,
  onCreateAd,
  onDeleteAd,
  onProcessPayout,
}) {
  const [activeTab, setActiveTab] = useState('subscriptions'); // 'subscriptions' | 'ads' | 'royalties'
  const [isNewAdModalOpen, setIsNewAdModalOpen] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [adSponsor, setAdSponsor] = useState('');
  const [adType, setAdType] = useState('Banner Ad');
  const [adTargetUrl, setAdTargetUrl] = useState('');

  const handleCreateAdSubmit = async (e) => {
    e.preventDefault();
    if (!adTitle.trim() || !adSponsor.trim()) return;
    await onCreateAd({
      title: adTitle.trim(),
      sponsor: adSponsor.trim(),
      type: adType,
      target_url: adTargetUrl.trim() || '#',
      image_url: '/images/audio1.jpg',
    });
    setAdTitle('');
    setAdSponsor('');
    setIsNewAdModalOpen(false);
  };

  const plans = [
    {
      name: 'Free Listener Tier',
      price: '$0.00',
      period: 'Forever Free',
      badge: 'Free',
      badgeColor: '#2D659B',
      features: ['Standard 128kbps audio streaming', 'Periodic audio & banner ads', 'Shuffle-only mobile playback'],
    },
    {
      name: 'Premium Individual',
      price: '$9.99',
      period: 'Per Month',
      badge: 'Most Popular',
      badgeColor: '#00C896',
      features: ['Hi-Fi 320kbps lossless audio', '100% Ad-free listening experience', 'Unlimited skips & offline downloads'],
    },
    {
      name: 'Family Subscription',
      price: '$14.99',
      period: 'Per Month',
      badge: '6 Accounts',
      badgeColor: '#8685EF',
      features: ['6 Individual Premium accounts', 'Explicit audio filter for kids', 'Shared family mix playlist'],
    },
    {
      name: 'Student Discount',
      price: '$4.99',
      period: 'Per Month',
      badge: '50% Off',
      badgeColor: '#FFAA00',
      features: ['Full Premium benefits at half price', 'Annual student verification required', 'Access to live stream events'],
    },
  ];

  return (
    <div className="financial-management-page">
      {/* Financial KPIs Banner */}
      <div className="stat-cards-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(0, 200, 150, 0.15)', color: '#00c896' }}>
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-meta">
            <span className="stat-label">Monthly Gross Revenue</span>
            <strong className="stat-number">
              ${(financialStats?.monthlyRevenue || 24874.98).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
            <span className="stat-delta positive">
              <i className="fas fa-arrow-up"></i> +14.2% from last month
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(134, 133, 239, 0.15)', color: '#8685EF' }}>
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-meta">
            <span className="stat-label">Active Paid Subscribers</span>
            <strong className="stat-number">
              {(financialStats?.totalSubscribers || subscriptions.length || 2420).toLocaleString()}
            </strong>
            <span className="stat-sub-text">Across Premium & Family plans</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 170, 0, 0.15)', color: '#FFAA00' }}>
            <i className="fas fa-ad"></i>
          </div>
          <div className="stat-meta">
            <span className="stat-label">Ad Impressions (Month)</span>
            <strong className="stat-number">
              {(financialStats?.adStats?.totalImpressions || 45700).toLocaleString()}
            </strong>
            <span className="stat-sub-text">
              CTR: {(((financialStats?.adStats?.totalClicks || 3070) / (financialStats?.adStats?.totalImpressions || 45700)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 82, 82, 0.15)', color: '#ff5252' }}>
            <i className="fas fa-coins"></i>
          </div>
          <div className="stat-meta">
            <span className="stat-label">Pending Royalty Payouts</span>
            <strong className="stat-number">
              ${(financialStats?.royalties?.pendingPayouts || 1940.80).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
            <span className="stat-sub-text">Rate: $0.0040 / song stream</span>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="section-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>System & Financial Governance</h2>
          <p className="subtitle">
            Subscription pricing, advertisement placements, and automated artist royalty payouts
          </p>
        </div>

        <div className="content-subnav" style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid #2a3447' }}>
          <button
            className={`btn-subtab ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'subscriptions' ? '#00c896' : 'transparent',
              color: activeTab === 'subscriptions' ? '#000' : '#94a3b8',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            <i className="fas fa-credit-card" style={{ marginRight: '6px' }}></i>
            Subscriptions & Plans
          </button>

          <button
            className={`btn-subtab ${activeTab === 'ads' ? 'active' : ''}`}
            onClick={() => setActiveTab('ads')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'ads' ? '#FFAA00' : 'transparent',
              color: activeTab === 'ads' ? '#000' : '#94a3b8',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            <i className="fas fa-bullhorn" style={{ marginRight: '6px' }}></i>
            Ad Placements ({ads.length})
          </button>

          <button
            className={`btn-subtab ${activeTab === 'royalties' ? 'active' : ''}`}
            onClick={() => setActiveTab('royalties')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'royalties' ? '#8685EF' : 'transparent',
              color: activeTab === 'royalties' ? '#fff' : '#94a3b8',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            <i className="fas fa-hand-holding-usd" style={{ marginRight: '6px' }}></i>
            Artist Royalties ({royalties.length})
          </button>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 1. SUBSCRIPTION & BILLING CONTROL                       */}
      {/* ======================================================= */}
      {activeTab === 'subscriptions' && (
        <div style={{ marginTop: '16px' }}>
          {/* Pricing Plans Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {plans.map((p, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid #2a3447',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>{p.name}</h4>
                    <span
                      style={{
                        backgroundColor: `${p.badgeColor}20`,
                        color: p.badgeColor,
                        border: `1px solid ${p.badgeColor}40`,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: '700',
                      }}
                    >
                      {p.badge}
                    </span>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>{p.price}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.78rem', marginLeft: '6px' }}>/ {p.period}</span>
                  </div>
                  <ul style={{ paddingLeft: '18px', color: '#94a3b8', fontSize: '0.78rem', lineHeight: '1.6', margin: 0 }}>
                    {p.features.map((feat, fIdx) => (
                      <li key={fIdx}>{feat}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Subscribers Table */}
          <div className="table-card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a3447' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Active User Subscriptions</h3>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Subscribed Plan</th>
                    <th>Billing Cycle</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Started</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((s, idx) => (
                    <tr key={s.id || idx}>
                      <td className="row-index">{s.id}</td>
                      <td>
                        <strong className="text-white">{s.full_name || s.username || 'Listener'}</strong>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{s.email}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '600', color: '#00c896' }}>{s.plan_name}</span>
                      </td>
                      <td className="text-muted">{s.billing_cycle || 'Monthly'}</td>
                      <td className="text-white font-semibold">${parseFloat(s.price).toFixed(2)}</td>
                      <td>
                        <span className="status-pill online">
                          <span className="status-dot"></span> Active
                        </span>
                      </td>
                      <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {s.started_at ? new Date(s.started_at).toLocaleDateString() : 'Active'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 2. AD MANAGEMENT FOR FREE-TIER USERS                   */}
      {/* ======================================================= */}
      {activeTab === 'ads' && (
        <div className="table-card" style={{ marginTop: '16px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a3447', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Free-Tier Audio & Display Ads</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Manage advertisements broadcasted to non-paying listeners between tracks and in discovery banners
              </p>
            </div>
            <button className="btn-primary" onClick={() => setIsNewAdModalOpen(true)}>
              <i className="fas fa-plus"></i> New Ad Campaign
            </button>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Campaign Title</th>
                  <th>Ad Type</th>
                  <th>Sponsor</th>
                  <th>Impressions</th>
                  <th>Clicks (CTR)</th>
                  <th>Placement Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad, idx) => {
                  const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={ad.id || idx}>
                      <td className="row-index">{ad.id}</td>
                      <td>
                        <strong className="text-white">{ad.title}</strong>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            backgroundColor: ad.type === 'Audio Ad' ? 'rgba(134, 133, 239, 0.15)' : 'rgba(0, 200, 150, 0.15)',
                            color: ad.type === 'Audio Ad' ? '#8685EF' : '#00c896',
                          }}
                        >
                          {ad.type}
                        </span>
                      </td>
                      <td className="text-white font-medium">{ad.sponsor}</td>
                      <td className="text-muted">{ad.impressions.toLocaleString()}</td>
                      <td className="text-muted">{ad.clicks.toLocaleString()} ({ctr}%)</td>
                      <td>
                        <button
                          onClick={() => onToggleAd(ad.id)}
                          style={{
                            background: ad.is_active ? 'rgba(0, 200, 150, 0.12)' : 'rgba(255,255,255,0.05)',
                            color: ad.is_active ? '#00c896' : '#94a3b8',
                            border: `1px solid ${ad.is_active ? 'rgba(0, 200, 150, 0.3)' : '#334155'}`,
                            padding: '5px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}
                        >
                          {ad.is_active ? '● Active' : '○ Paused'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => onDeleteAd(ad.id)}
                          style={{ background: 'none', border: 'none', color: '#ff5252', cursor: 'pointer' }}
                          title="Delete Campaign"
                        >
                          <i className="fas fa-trash"></i>
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
      {/* 3. ROYALTY PAYOUTS ACCORDING TO STREAMS                 */}
      {/* ======================================================= */}
      {activeTab === 'royalties' && (
        <div className="table-card" style={{ marginTop: '16px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a3447', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Artist Stream Royalty Statements</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Transparent payout ledger accounting for stream play counts at platform baseline of $0.0040 per stream
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Artist Name</th>
                  <th>Verified Streams</th>
                  <th>Rate / Stream</th>
                  <th>Total Due</th>
                  <th>Accounting Period</th>
                  <th>Payout Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {royalties.map((r, idx) => {
                  const isPaid = r.status?.toLowerCase() === 'paid';
                  return (
                    <tr key={r.id || idx}>
                      <td className="row-index">{r.id}</td>
                      <td>
                        <strong className="text-white">{r.artist_name}</strong>
                      </td>
                      <td className="text-muted">{parseInt(r.streams_counted).toLocaleString()} plays</td>
                      <td className="text-muted">${parseFloat(r.rate_per_stream || 0.004).toFixed(4)}</td>
                      <td className="text-white font-bold" style={{ color: '#00c896' }}>
                        ${parseFloat(r.amount).toFixed(2)}
                      </td>
                      <td className="text-muted">{r.period}</td>
                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            backgroundColor: isPaid ? 'rgba(0, 200, 150, 0.15)' : 'rgba(255, 170, 0, 0.15)',
                            color: isPaid ? '#00c896' : '#FFAA00',
                          }}
                        >
                          {isPaid ? 'PAID ✓' : 'PENDING'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {!isPaid ? (
                          <button
                            onClick={() => onProcessPayout(r.id)}
                            style={{
                              background: '#00c896',
                              color: '#000',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <i className="fas fa-check"></i> Process Payout
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Ad Modal */}
      {isNewAdModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsNewAdModalOpen(false)}>
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
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fas fa-bullhorn" style={{ color: '#FFAA00' }}></i>
                  Create Advertisement Campaign
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                  Deploy promotional banner or audio placements for Free listeners
                </p>
              </div>
              <button
                onClick={() => setIsNewAdModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateAdSubmit} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                  Campaign Title <span style={{ color: '#ff5252' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Beats Studio Wireless Promo"
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                    Sponsor / Brand <span style={{ color: '#ff5252' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Beats Audio"
                    value={adSponsor}
                    onChange={(e) => setAdSponsor(e.target.value)}
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
                    Ad Placement Type
                  </label>
                  <select
                    value={adType}
                    onChange={(e) => setAdType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      background: '#080c14',
                      border: '1px solid #1e293b',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.78rem',
                    }}
                  >
                    <option value="Banner Ad">Banner Ad</option>
                    <option value="Audio Ad">Audio Ad (Between Tracks)</option>
                    <option value="Sponsored Placement">Sponsored Placement</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                  Destination Click URL
                </label>
                <input
                  type="url"
                  placeholder="https://sponsor.com/offer"
                  value={adTargetUrl}
                  onChange={(e) => setAdTargetUrl(e.target.value)}
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
                  onClick={() => setIsNewAdModalOpen(false)}
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
                    background: '#FFAA00',
                    border: 'none',
                    color: '#081a13',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Deploy Ad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
