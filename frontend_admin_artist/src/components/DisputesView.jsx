import React, { useState } from 'react';

export default function DisputesView({
  disputes = [],
  onUpdateDisputeStatus,
  onCreateDispute,
  onTakedownSong,
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'under_review' | 'resolved'
  const [searchTerm, setSearchTerm] = useState('');
  const [resolveModalTicket, setResolveModalTicket] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    reporter_name: '',
    target_type: 'Song',
    target_title: '',
    reason: 'Copyright Infringement',
    description: '',
  });

  const filteredDisputes = disputes.filter((d) => {
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      d.ticket_number?.toLowerCase().includes(term) ||
      d.reporter_name?.toLowerCase().includes(term) ||
      d.target_title?.toLowerCase().includes(term) ||
      d.reason?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const openCount = disputes.filter((d) => d.status === 'open').length;
  const underReviewCount = disputes.filter((d) => d.status === 'under_review').length;
  const resolvedCount = disputes.filter((d) => d.status === 'resolved').length;

  const handleOpenResolveModal = (ticket) => {
    setResolveModalTicket(ticket);
    setResolutionNote(ticket.resolution_note || '');
  };

  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (resolveModalTicket && onUpdateDisputeStatus) {
      await onUpdateDisputeStatus(
        resolveModalTicket.id,
        'resolved',
        resolutionNote || 'Claim validated and resolved by platform moderation team.'
      );
      setResolveModalTicket(null);
      setResolutionNote('');
    }
  };

  const handleFileTicketSubmit = async (e) => {
    e.preventDefault();
    if (!newTicket.reporter_name.trim() || !newTicket.target_title.trim()) return;
    if (onCreateDispute) {
      await onCreateDispute(newTicket);
      setIsFileModalOpen(false);
      setNewTicket({
        reporter_name: '',
        target_type: 'Song',
        target_title: '',
        reason: 'Copyright Infringement',
        description: '',
      });
    }
  };

  const getReasonColor = (reason) => {
    switch (reason?.toLowerCase()) {
      case 'copyright infringement':
        return '#ff5252';
      case 'duplicate song':
        return '#FFAA00';
      case 'inappropriate content':
        return '#8685EF';
      default:
        return '#2D659B';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return (
          <span
            style={{
              background: 'rgba(255, 82, 82, 0.15)',
              color: '#ff5252',
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: '700',
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#ff5252',
                display: 'inline-block',
              }}
            ></span>
            Open Dispute
          </span>
        );
      case 'under_review':
        return (
          <span
            style={{
              background: 'rgba(255, 170, 0, 0.15)',
              color: '#FFAA00',
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: '700',
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fas fa-search" style={{ fontSize: '0.7rem' }}></i>
            Under Review
          </span>
        );
      case 'resolved':
        return (
          <span
            style={{
              background: 'rgba(0, 200, 150, 0.15)',
              color: '#00c896',
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: '700',
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fas fa-check" style={{ fontSize: '0.7rem' }}></i>
            Resolved
          </span>
        );
      case 'dismissed':
        return (
          <span
            style={{
              background: 'rgba(148, 163, 184, 0.15)',
              color: '#94a3b8',
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: '700',
              fontSize: '0.75rem',
            }}
          >
            Dismissed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="disputes-management-page">
      {/* Page Header */}
      <div
        className="section-toolbar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2>Report & Dispute Resolution</h2>
          <p className="subtitle">
            Receive and resolve complaints regarding duplicate songs, copyright infringements, or intellectual property disputes
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setIsFileModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            background: '#ff5252',
            border: 'none',
            color: '#fff',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          <i className="fas fa-plus-circle"></i>
          <span>File Dispute Ticket</span>
        </button>
      </div>

      {/* Analytics KPI Row */}
      <div className="stat-cards-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: 'rgba(255, 82, 82, 0.15)', color: '#ff5252' }}
          >
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <div className="stat-meta">
            <span className="stat-label">Open Tickets</span>
            <strong className="stat-number">{openCount}</strong>
            <span className="stat-sub-text" style={{ color: openCount > 0 ? '#ff5252' : '#94a3b8' }}>
              {openCount > 0 ? 'Urgent triage required' : 'No urgent tickets'}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: 'rgba(255, 170, 0, 0.15)', color: '#FFAA00' }}
          >
            <i className="fas fa-glasses"></i>
          </div>
          <div className="stat-meta">
            <span className="stat-label">Under Investigation</span>
            <strong className="stat-number">{underReviewCount}</strong>
            <span className="stat-sub-text">Active claims being audited</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: 'rgba(0, 200, 150, 0.15)', color: '#00c896' }}
          >
            <i className="fas fa-check-double"></i>
          </div>
          <div className="stat-meta">
            <span className="stat-label">Resolved / Closed</span>
            <strong className="stat-number">{resolvedCount}</strong>
            <span className="stat-sub-text">Settled disputes</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: 'rgba(134, 133, 239, 0.15)', color: '#8685EF' }}
          >
            <i className="fas fa-shield-alt"></i>
          </div>
          <div className="stat-meta">
            <span className="stat-label">Total platform disputes</span>
            <strong className="stat-number">{disputes.length}</strong>
            <span className="stat-sub-text">Copyright & duplicate logs</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="table-card"
        style={{
          background: '#161c28',
          border: '1px solid #2a3447',
          borderRadius: '12px',
          overflow: 'hidden',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'all', label: 'All Tickets', count: disputes.length },
              { id: 'open', label: 'Open', count: openCount },
              { id: 'under_review', label: 'Under Review', count: underReviewCount },
              { id: 'resolved', label: 'Resolved', count: resolvedCount },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: statusFilter === f.id ? '#2D659B' : '#2a3447',
                  background: statusFilter === f.id ? 'rgba(45, 101, 155, 0.25)' : 'transparent',
                  color: statusFilter === f.id ? '#fff' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{f.label}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    background: statusFilter === f.id ? '#2D659B' : '#1e2638',
                    padding: '2px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <i
              className="fas fa-search"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                fontSize: '0.85rem',
              }}
            ></i>
            <input
              type="text"
              placeholder="Search ticket, title, reporter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                background: '#0d111a',
                border: '1px solid #2a3447',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>

        {/* Tickets List */}
        {filteredDisputes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <i className="fas fa-check-circle" style={{ fontSize: '3rem', marginBottom: '16px', color: '#00c896' }}></i>
            <h4 style={{ color: '#fff', marginBottom: '6px' }}>No Dispute Tickets Found</h4>
            <p style={{ fontSize: '0.88rem' }}>All copyright reports and duplicate claims have been reviewed or resolved.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredDisputes.map((d) => (
              <div
                key={d.id}
                style={{
                  background: '#0f1420',
                  border: '1px solid #232c3d',
                  borderRadius: '10px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        color: '#64748b',
                        background: '#192233',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #2a3447',
                      }}
                    >
                      {d.ticket_number}
                    </span>
                    <span
                      style={{
                        background: `${getReasonColor(d.reason)}20`,
                        color: getReasonColor(d.reason),
                        border: `1px solid ${getReasonColor(d.reason)}50`,
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '0.75rem',
                      }}
                    >
                      {d.reason}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      Target: <strong style={{ color: '#fff' }}>[{d.target_type}] {d.target_title}</strong>
                    </span>
                  </div>

                  <div>{getStatusBadge(d.status)}</div>
                </div>

                {/* Complaint Narrative / Description */}
                <div
                  style={{
                    background: '#141a27',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${getReasonColor(d.reason)}`,
                    fontSize: '0.85rem',
                    color: '#cbd5e1',
                    lineHeight: '1.5',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#64748b', fontSize: '0.78rem' }}>
                    <span>Reporter: <strong style={{ color: '#94a3b8' }}>{d.reporter_name}</strong></span>
                    <span>Filed: {new Date(d.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: 0 }}>{d.description || 'No detailed evidence narrative provided.'}</p>
                </div>

                {/* Resolution Note if present */}
                {d.resolution_note && (
                  <div
                    style={{
                      background: 'rgba(0, 200, 150, 0.08)',
                      border: '1px solid rgba(0, 200, 150, 0.25)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      color: '#00c896',
                    }}
                  >
                    <i className="fas fa-check-circle" style={{ marginRight: '6px' }}></i>
                    <strong>Resolution Decision:</strong> {d.resolution_note}
                  </div>
                )}

                {/* Dispute Actions Toolbar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    borderTop: '1px solid #1c2434',
                    paddingTop: '12px',
                    alignItems: 'center',
                  }}
                >
                  {d.status === 'open' && (
                    <button
                      onClick={() => onUpdateDisputeStatus(d.id, 'under_review', 'Auditing track metadata & audio stems.')}
                      style={{
                        background: 'transparent',
                        border: '1px solid #FFAA00',
                        color: '#FFAA00',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <i className="fas fa-search"></i>
                      Investigate (Under Review)
                    </button>
                  )}

                  {d.status !== 'resolved' && (
                    <button
                      onClick={() => handleOpenResolveModal(d)}
                      style={{
                        background: '#00c896',
                        border: 'none',
                        color: '#000',
                        padding: '6px 16px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <i className="fas fa-check-circle"></i>
                      Resolve Ticket
                    </button>
                  )}

                  {d.status !== 'dismissed' && d.status !== 'resolved' && (
                    <button
                      onClick={() => onUpdateDisputeStatus(d.id, 'dismissed', 'Claim dismissed due to insufficient evidence.')}
                      style={{
                        background: 'transparent',
                        border: '1px solid #334155',
                        color: '#94a3b8',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {resolveModalTicket && (
        <div className="modal-backdrop" onClick={() => setResolveModalTicket(null)}>
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
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: '#00c896', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fas fa-gavel"></i>
                  Resolve Dispute Ticket #{resolveModalTicket.ticket_number}
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                  Record moderation findings and settle complaint
                </p>
              </div>
              <button
                onClick={() => setResolveModalTicket(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  background: 'rgba(0, 200, 150, 0.06)',
                  border: '1px solid rgba(0, 200, 150, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.76rem',
                  color: '#cbd5e1',
                }}
              >
                <div><strong>Target:</strong> [{resolveModalTicket.target_type}] {resolveModalTicket.target_title}</div>
                <div style={{ marginTop: '2px' }}><strong>Claimant:</strong> {resolveModalTicket.reporter_name} ({resolveModalTicket.reason})</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                  Resolution Settlement Decision Notes <span style={{ color: '#ff5252' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Master recordings audited. Verified original stems with claimant. Dispute closed in favor of creator."
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
                  onClick={() => setResolveModalTicket(null)}
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
                    background: '#00c896',
                    border: 'none',
                    color: '#081a13',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Confirm & Resolve Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Dispute Ticket Modal */}
      {isFileModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsFileModalOpen(false)}>
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
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: '#ff5252', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fas fa-file-signature"></i>
                  File Copyright / Dispute Ticket
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                  Submit infringement report or duplicate claim to moderation queue
                </p>
              </div>
              <button
                onClick={() => setIsFileModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleFileTicketSubmit} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                  Reporter Name / Legal Entity <span style={{ color: '#ff5252' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTicket.reporter_name}
                  onChange={(e) => setNewTicket({ ...newTicket, reporter_name: e.target.value })}
                  placeholder="e.g. Sony Music Publishing or Artist Legal Team"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                    Target Type
                  </label>
                  <select
                    value={newTicket.target_type}
                    onChange={(e) => setNewTicket({ ...newTicket, target_type: e.target.value })}
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
                    <option value="Song">Song</option>
                    <option value="Album">Album</option>
                    <option value="Artist">Artist Account</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                    Target Title / Name <span style={{ color: '#ff5252' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTicket.target_title}
                    onChange={(e) => setNewTicket({ ...newTicket, target_title: e.target.value })}
                    placeholder="e.g. Midnight Echoes"
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
                  Dispute Reason
                </label>
                <select
                  value={newTicket.reason}
                  onChange={(e) => setNewTicket({ ...newTicket, reason: e.target.value })}
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
                  <option value="Copyright Infringement">Copyright Infringement (Audio/Lyrics)</option>
                  <option value="Duplicate Song">Duplicate Song / Re-upload</option>
                  <option value="Inappropriate Content">Inappropriate Content (Policy Violation)</option>
                  <option value="Trademark Violation">Trademark or Identity Impersonation</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                  Evidence & Description
                </label>
                <textarea
                  rows={3}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Provide copyright registration ID, original publication URL, or infringing timestamps..."
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
                  onClick={() => setIsFileModalOpen(false)}
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
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
