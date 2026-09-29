import React, { useState } from 'react';

export default function UsersView({
  users = [],
  roles = [],
  onOpenCreateUser,
  onDeleteUser,
  onToggleStatus,
  onVerifyArtist,
  onUpdateRoles,
  currentUser,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingRoleUser, setEditingRoleUser] = useState(null); // user object
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [suspendModalUser, setSuspendModalUser] = useState(null);
  const [suspendReasonCategory, setSuspendReasonCategory] = useState('Violation of Community Guidelines');
  const [suspendReasonDetails, setSuspendReasonDetails] = useState('');

  const getRoleBadgeColor = (roleName) => {
    switch (roleName?.toLowerCase()) {
      case 'admin':
        return '#ff5252';
      case 'moderator':
        return '#FFAA00';
      case 'artist':
        return '#00c896';
      case 'premium_user':
        return '#8685EF';
      case 'user':
        return '#2d659b';
      default:
        return '#94a3b8';
    }
  };

  const openRoleModal = (u) => {
    setEditingRoleUser(u);
    setSelectedRoles(u.roles || []);
  };

  const handleSaveRoles = (e) => {
    e.preventDefault();
    if (editingRoleUser && onUpdateRoles) {
      onUpdateRoles(editingRoleUser.id, selectedRoles);
      setEditingRoleUser(null);
    }
  };

  const handleConfirmSuspend = (e) => {
    e.preventDefault();
    if (suspendModalUser && onToggleStatus) {
      const fullReason = suspendReasonDetails.trim()
        ? `${suspendReasonCategory}: ${suspendReasonDetails.trim()}`
        : suspendReasonCategory;
      onToggleStatus(suspendModalUser.id, false, fullReason);
      setSuspendModalUser(null);
      setSuspendReasonCategory('Violation of Community Guidelines');
      setSuspendReasonDetails('');
    }
  };

  const toggleRoleSelection = (roleName) => {
    if (selectedRoles.includes(roleName)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== roleName));
    } else {
      setSelectedRoles([...selectedRoles, roleName]);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const username = u.username?.toLowerCase() || '';
    const email = u.email?.toLowerCase() || '';
    const fullName = u.full_name?.toLowerCase() || '';
    const userRoles = u.roles || [];
    const rolesStr = userRoles.join(' ').toLowerCase();

    const matchesSearch =
      !searchTerm ||
      username.includes(term) ||
      email.includes(term) ||
      fullName.includes(term) ||
      rolesStr.includes(term);

    const matchesRole =
      roleFilter === 'all' ||
      userRoles.map((r) => r.toLowerCase()).includes(roleFilter.toLowerCase());

    return matchesSearch && matchesRole;
  });

  const availableRoles = [
    { id: 'admin', label: 'Admin', desc: 'Full platform administration & moderation' },
    { id: 'moderator', label: 'Moderator', desc: 'Content approvals & copyright dispute triage' },
    { id: 'artist', label: 'Artist', desc: 'Music uploads, albums & creator analytics' },
    { id: 'premium_user', label: 'Premium', desc: 'Hi-Fi lossless ad-free streaming tier' },
    { id: 'user', label: 'Free User', desc: 'Standard catalog listener tier' },
  ];

  return (
    <div className="users-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Section Toolbar */}
      <div
        className="section-toolbar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', margin: 0 }}>
            User & Role Governance
          </h2>
          <p className="subtitle" style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '3px 0 0' }}>
            Manage platform membership ({users.length} accounts), role permissions, artist badges, and account suspensions
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={onOpenCreateUser}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '6px',
            background: '#00c896',
            color: '#081a13',
            fontSize: '0.78rem',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <i className="fas fa-user-plus" style={{ fontSize: '0.75rem' }}></i>
          <span>Add Member</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div
        className="table-card"
        style={{
          background: '#0e131f',
          border: '1px solid #1a2333',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        {/* Filter and Role Toolbar */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #1a2333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Quick Role Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Members', count: users.length },
              { id: 'admin', label: 'Admins', count: users.filter((u) => (u.roles || []).includes('admin')).length },
              { id: 'artist', label: 'Artists', count: users.filter((u) => (u.roles || []).includes('artist')).length },
              { id: 'premium_user', label: 'Premium', count: users.filter((u) => (u.roles || []).includes('premium_user')).length },
              { id: 'user', label: 'Free Users', count: users.filter((u) => (u.roles || []).includes('user')).length },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setRoleFilter(f.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '14px',
                  border: '1px solid',
                  borderColor: roleFilter === f.id ? '#2D659B' : '#1e293b',
                  background: roleFilter === f.id ? 'rgba(45, 101, 155, 0.25)' : 'rgba(255, 255, 255, 0.02)',
                  color: roleFilter === f.id ? '#fff' : '#94a3b8',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span>{f.label}</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    background: roleFilter === f.id ? '#2D659B' : '#161e2e',
                    padding: '1px 5px',
                    borderRadius: '8px',
                  }}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Clean Search Input */}
          <div style={{ position: 'relative', width: '240px' }}>
            <i
              className="fas fa-search"
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                fontSize: '0.75rem',
              }}
            ></i>
            <input
              type="text"
              placeholder="Search member, email, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 26px 6px 28px',
                background: '#080c14',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.76rem',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  padding: 0,
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* Member Table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.78rem',
            }}
          >
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1a2333' }}>
                <th style={{ padding: '9px 14px', color: '#64748b', fontWeight: '700', fontSize: '0.66rem', letterSpacing: '0.5px' }}>#</th>
                <th style={{ padding: '9px 14px', color: '#64748b', fontWeight: '700', fontSize: '0.66rem', letterSpacing: '0.5px' }}>MEMBER</th>
                <th style={{ padding: '9px 14px', color: '#64748b', fontWeight: '700', fontSize: '0.66rem', letterSpacing: '0.5px' }}>EMAIL</th>
                <th style={{ padding: '9px 14px', color: '#64748b', fontWeight: '700', fontSize: '0.66rem', letterSpacing: '0.5px' }}>ROLE</th>
                <th style={{ padding: '9px 14px', color: '#64748b', fontWeight: '700', fontSize: '0.66rem', letterSpacing: '0.5px' }}>ARTIST BADGE</th>
                <th style={{ padding: '9px 14px', color: '#64748b', fontWeight: '700', fontSize: '0.66rem', letterSpacing: '0.5px' }}>STATUS</th>
                <th style={{ padding: '9px 14px', color: '#64748b', fontWeight: '700', fontSize: '0.66rem', letterSpacing: '0.5px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px 14px', color: '#64748b' }}>
                    {searchTerm ? `No users match "${searchTerm}".` : 'No users found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSuperAdmin =
                    u.is_super_admin || u.email?.toLowerCase() === 'iks214262@gmail.com';
                  const isCurrentLoggedIn = currentUser?.id === u.id;
                  const isArtist = (u.roles || []).includes('artist');

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid #141c2b',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* ID */}
                      <td style={{ padding: '10px 14px', color: '#475569', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                        {u.id}
                      </td>

                      {/* Member Info */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={u.avatar || '/images/avatar.jpg'}
                            alt={u.username}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              border: isSuperAdmin ? '1.5px solid #FFD700' : '1px solid #1e293b',
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: '600', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{u.full_name || u.username}</span>
                              {isSuperAdmin && (
                                <span
                                  style={{
                                    backgroundColor: 'rgba(255, 215, 0, 0.15)',
                                    color: '#FFD700',
                                    border: '1px solid rgba(255, 215, 0, 0.4)',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    fontSize: '0.6rem',
                                    fontWeight: '700',
                                  }}
                                >
                                  SUPER ADMIN
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>@{u.username}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: '0.76rem' }}>
                        {u.email}
                      </td>

                      {/* Role Pill */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {u.roles && u.roles.length > 0 ? (
                              u.roles.map((r, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    background: `${getRoleBadgeColor(r)}18`,
                                    color: getRoleBadgeColor(r),
                                    border: `1px solid ${getRoleBadgeColor(r)}40`,
                                    padding: '2px 7px',
                                    borderRadius: '4px',
                                    fontSize: '0.66rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px',
                                  }}
                                >
                                  {r.replace('_', ' ')}
                                </span>
                              ))
                            ) : (
                              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>None</span>
                            )}
                          </div>

                          {!isSuperAdmin && (
                            <button
                              onClick={() => openRoleModal(u)}
                              title="Edit role assignment"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#64748b',
                                cursor: 'pointer',
                                padding: '2px 4px',
                                fontSize: '0.7rem',
                              }}
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Artist Verification */}
                      <td style={{ padding: '10px 14px' }}>
                        {isArtist ? (
                          <button
                            onClick={() => onVerifyArtist && onVerifyArtist(u.id, !u.is_verified_artist)}
                            title={u.is_verified_artist ? 'Revoke verification badge' : 'Grant verified badge'}
                            style={{
                              background: u.is_verified_artist ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.03)',
                              color: u.is_verified_artist ? '#38bdf8' : '#64748b',
                              border: `1px solid ${u.is_verified_artist ? 'rgba(56, 189, 248, 0.3)' : '#1e293b'}`,
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '0.68rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <i className={`fas ${u.is_verified_artist ? 'fa-check-circle' : 'fa-circle'}`} style={{ fontSize: '0.65rem' }}></i>
                            <span>{u.is_verified_artist ? 'Verified ✓' : 'Unverified'}</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: '#475569' }}>—</span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '2px 7px',
                            borderRadius: '12px',
                            fontSize: '0.68rem',
                            fontWeight: '600',
                            background: u.is_active ? 'rgba(0, 200, 150, 0.08)' : 'rgba(255, 82, 82, 0.08)',
                            color: u.is_active ? '#00c896' : '#ff5252',
                            border: `1px solid ${u.is_active ? 'rgba(0, 200, 150, 0.25)' : 'rgba(255, 82, 82, 0.25)'}`,
                          }}
                          title={!u.is_active && u.suspension_reason ? `Reason: ${u.suspension_reason}` : undefined}
                        >
                          <span
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              backgroundColor: 'currentColor',
                            }}
                          ></span>
                          <span>{u.is_active ? 'Active' : 'Suspended'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        {isSuperAdmin ? (
                          <span
                            style={{
                              fontSize: '0.66rem',
                              color: '#FFD700',
                              background: 'rgba(255, 215, 0, 0.08)',
                              border: '1px solid rgba(255, 215, 0, 0.25)',
                              padding: '3px 7px',
                              borderRadius: '4px',
                              fontWeight: '600',
                            }}
                          >
                            Protected
                          </span>
                        ) : isCurrentLoggedIn ? (
                          <span
                            style={{
                              fontSize: '0.66rem',
                              color: '#38bdf8',
                              background: 'rgba(56, 189, 248, 0.08)',
                              border: '1px solid rgba(56, 189, 248, 0.25)',
                              padding: '3px 7px',
                              borderRadius: '4px',
                              fontWeight: '600',
                            }}
                          >
                            You
                          </span>
                        ) : (
                          <div style={{ display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
                            {u.is_active ? (
                              <button
                                onClick={() => setSuspendModalUser(u)}
                                title="Suspend account"
                                style={{
                                  background: 'transparent',
                                  color: '#FFAA00',
                                  border: '1px solid rgba(255, 170, 0, 0.25)',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.68rem',
                                  fontWeight: '600',
                                }}
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => onToggleStatus && onToggleStatus(u.id, true)}
                                title="Reactivate account"
                                style={{
                                  background: 'transparent',
                                  color: '#00c896',
                                  border: '1px solid rgba(0, 200, 150, 0.25)',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.68rem',
                                  fontWeight: '600',
                                }}
                              >
                                Activate
                              </button>
                            )}

                            <button
                              onClick={() => onDeleteUser(u.id, u.username, u.email)}
                              title={`Delete user @${u.username}`}
                              style={{
                                background: 'transparent',
                                color: '#ff5252',
                                border: '1px solid rgba(255, 82, 82, 0.25)',
                                padding: '3px 7px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.68rem',
                              }}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Assignment Modal */}
      {editingRoleUser && (
        <div className="modal-backdrop" onClick={() => setEditingRoleUser(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '420px',
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
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: '#f8fafc' }}>
                  Assign Role Permissions
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                  @{editingRoleUser.username} ({editingRoleUser.full_name || 'Member'})
                </p>
              </div>
              <button
                onClick={() => setEditingRoleUser(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSaveRoles} style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                {availableRoles.map((r) => {
                  const isChecked = selectedRoles.includes(r.id);
                  const color = getRoleBadgeColor(r.id);
                  return (
                    <label
                      key={r.id}
                      onClick={() => toggleRoleSelection(r.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: isChecked ? `${color}12` : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isChecked ? color : '#1e293b'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: isChecked ? '#fff' : '#cbd5e1' }}>
                          {r.label}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{r.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ cursor: 'pointer' }}
                      />
                    </label>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #1e293b', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingRoleUser(null)}
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
                  Save Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Suspension Reason Modal */}
      {suspendModalUser && (
        <div className="modal-backdrop" onClick={() => setSuspendModalUser(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '420px',
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
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: '#FFAA00', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fas fa-exclamation-triangle"></i>
                  Suspend Member Account
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                  @{suspendModalUser.username} ({suspendModalUser.email})
                </p>
              </div>
              <button
                onClick={() => setSuspendModalUser(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleConfirmSuspend} style={{ padding: '16px 18px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                  Policy Violation Reason
                </label>
                <select
                  value={suspendReasonCategory}
                  onChange={(e) => setSuspendReasonCategory(e.target.value)}
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
                  <option value="Violation of Community Guidelines">Violation of Community Guidelines</option>
                  <option value="Copyright Infringement Repeat Offender">Copyright Infringement Repeat Offender</option>
                  <option value="Fraudulent or Bot Stream Activity">Fraudulent or Bot Stream Activity</option>
                  <option value="Harassment or Inappropriate Content">Harassment or Inappropriate Content</option>
                  <option value="User-Requested Account Closure">User-Requested Account Closure</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  value={suspendReasonDetails}
                  onChange={(e) => setSuspendReasonDetails(e.target.value)}
                  placeholder="Specify ticket number or moderation notes..."
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
                  onClick={() => setSuspendModalUser(null)}
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
                  Confirm Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
