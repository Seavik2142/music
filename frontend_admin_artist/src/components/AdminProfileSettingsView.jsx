import React, { useState, useEffect } from 'react';
import {
  updateAdminProfile,
  changeAdminPassword,
  getSystemSettings,
  updateSystemSettings,
} from '../services/api';

export default function AdminProfileSettingsView({
  currentUser,
  onUpdateCurrentUser,
  showToast,
  onLogout,
  initialSubtab = 'profile',
}) {
  const [activeSubtab, setActiveSubtab] = useState(initialSubtab); // 'profile' | 'settings'

  // Admin Profile Form State
  const [profileForm, setProfileForm] = useState({
    full_name: currentUser?.full_name || '',
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    avatar: currentUser?.avatar || '/images/avatar.jpg',
    bio: currentUser?.bio || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security / Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Platform Governance Settings State
  const [settings, setSettings] = useState({
    platform_name: 'SoundFly Music',
    support_email: 'support@soundfly.io',
    maintenance_mode: 'false',
    allow_registrations: 'true',
    default_audio_bitrate: '320kbps',
    max_upload_size_mb: '100',
    require_track_approval: 'true',
    royalty_rate_per_stream: '0.0040',
    min_payout_threshold: '50.00',
    session_token_expiry_days: '7',
    enforce_admin_2fa: 'false',
    environment: 'Production',
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Synchronize when initialSubtab changes
  useEffect(() => {
    if (initialSubtab && (initialSubtab === 'profile' || initialSubtab === 'settings')) {
      setActiveSubtab(initialSubtab);
    }
  }, [initialSubtab]);

  // Update profile form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        full_name: currentUser.full_name || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
        avatar: currentUser.avatar || '/images/avatar.jpg',
        bio: currentUser.bio || '',
      });
    }
  }, [currentUser]);

  // Load platform settings on mount
  useEffect(() => {
    async function fetchSettings() {
      setIsLoadingSettings(true);
      try {
        const data = await getSystemSettings();
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.warn('Failed to load system settings from backend:', err);
      } finally {
        setIsLoadingSettings(false);
      }
    }
    fetchSettings();
  }, []);

  // Preset avatars for rapid selection
  const avatarPresets = [
    '/images/avatar.jpg',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  ];

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.full_name.trim()) {
      showToast?.('Full Name cannot be empty', 'error');
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await updateAdminProfile({
        full_name: profileForm.full_name.trim(),
        username: profileForm.username.trim(),
        avatar: profileForm.avatar.trim() || '/images/avatar.jpg',
        bio: profileForm.bio.trim(),
      });

      if (res.user && onUpdateCurrentUser) {
        onUpdateCurrentUser(res.user);
      }
      showToast?.(res.message || 'Admin profile saved successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update admin profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      showToast?.('Please enter your current password', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      showToast?.('New password must be at least 4 characters long', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast?.('New passwords do not match', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changeAdminPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast?.(res.message || 'Password changed successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast?.(err.message || 'Failed to change password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Save Platform Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await updateSystemSettings(settings);
      if (res.data) {
        setSettings(res.data);
      }
      showToast?.(res.message || 'Platform governance policies saved!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update platform settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const isSuperAdmin =
    currentUser?.is_super_admin ||
    currentUser?.email?.toLowerCase() === 'iks214262@gmail.com';

  // Reusable Switch Toggle Component
  const ToggleSwitch = ({ checked, onChange, label, description, color = '#00c896' }) => (
    <div
      onClick={onChange}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#090d16',
        borderRadius: '8px',
        border: '1px solid #1a2333',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2a374a')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1a2333')}
    >
      <div style={{ paddingRight: '16px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#f1f5f9', display: 'block' }}>
          {label}
        </span>
        {description && (
          <span style={{ fontSize: '0.71rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
            {description}
          </span>
        )}
      </div>

      <div
        style={{
          width: '38px',
          height: '22px',
          borderRadius: '12px',
          background: checked ? color : '#1e293b',
          position: 'relative',
          flexShrink: 0,
          transition: 'background-color 0.2s ease',
        }}
      >
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#ffffff',
            position: 'absolute',
            top: '3px',
            left: checked ? '19px' : '3px',
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="admin-profile-settings-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ───────────────────────────────────────────────────────── */}
      {/* Header Toolbar & Segmented Tabs                           */}
      {/* ───────────────────────────────────────────────────────── */}
      <div
        className="section-toolbar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '14px',
          borderBottom: '1px solid #1a2333',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', margin: 0, letterSpacing: '-0.3px' }}>
              Profile & Platform Settings
            </h2>
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '4px',
                background: isSuperAdmin ? 'rgba(56, 189, 248, 0.12)' : 'rgba(134, 133, 239, 0.12)',
                color: isSuperAdmin ? '#38bdf8' : '#8685EF',
                border: isSuperAdmin ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(134, 133, 239, 0.3)',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: isSuperAdmin ? '#38bdf8' : '#8685EF',
                }}
              />
              {isSuperAdmin ? 'Super Administrator' : 'Administrator'}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '3px 0 0' }}>
            Configure administrator credentials, system security, and platform-wide streaming policies
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Subtabs Segmented Pill Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#090d16',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid #1a2333',
              gap: '3px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveSubtab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '6px 14px',
                fontSize: '0.77rem',
                fontWeight: activeSubtab === 'profile' ? '600' : '500',
                color: activeSubtab === 'profile' ? '#f8fafc' : '#94a3b8',
                background: activeSubtab === 'profile' ? '#1e293b' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <i
                className="fas fa-user-shield"
                style={{ fontSize: '0.74rem', color: activeSubtab === 'profile' ? '#38bdf8' : '#64748b' }}
              />
              <span>Admin Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubtab('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '6px 14px',
                fontSize: '0.77rem',
                fontWeight: activeSubtab === 'settings' ? '600' : '500',
                color: activeSubtab === 'settings' ? '#f8fafc' : '#94a3b8',
                background: activeSubtab === 'settings' ? '#1e293b' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <i
                className="fas fa-sliders-h"
                style={{ fontSize: '0.74rem', color: activeSubtab === 'settings' ? '#00c896' : '#64748b' }}
              />
              <span>Platform Governance</span>
            </button>
          </div>

          {/* Quick Sign Out Action */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Sign out and return to Gmail & password login form"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: '600',
                color: '#ff6b6b',
                background: 'rgba(255, 82, 82, 0.08)',
                border: '1px solid rgba(255, 82, 82, 0.25)',
                borderRadius: '7px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <i className="fas fa-sign-out-alt" style={{ fontSize: '0.75rem' }}></i>
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* 1. ADMIN PROFILE & SECURITY SUBTAB                        */}
      {/* ───────────────────────────────────────────────────────── */}
      {activeSubtab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'start' }}>
          {/* Left Column: Visual Identity & Access Summary */}
          <div
            style={{
              background: '#0e131f',
              border: '1px solid #1e293b',
              borderRadius: '10px',
              padding: '20px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '14px',
            }}
          >
            {/* Avatar Preview with Status Ring */}
            <div style={{ position: 'relative', width: '84px', height: '84px' }}>
              <img
                src={profileForm.avatar || '/images/avatar.jpg'}
                alt={profileForm.full_name || 'Admin'}
                onError={(e) => {
                  e.target.src = '/images/avatar.jpg';
                }}
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2.5px solid #38bdf8',
                  boxShadow: '0 0 16px rgba(56, 189, 248, 0.2)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#00c896',
                  border: '2px solid #0e131f',
                }}
                title="Active Administrator Session"
              />
            </div>

            {/* Name & Handle */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 2px' }}>
                {profileForm.full_name || currentUser?.username || 'Administrator'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#38bdf8', margin: '0 0 6px', fontWeight: '500' }}>
                @{profileForm.username || currentUser?.username || 'superadmin'}
              </p>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.67rem',
                  fontWeight: '600',
                  padding: '3px 9px',
                  borderRadius: '4px',
                  background: 'rgba(56, 189, 248, 0.1)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}
              >
                <i className="fas fa-shield-alt"></i> Root Authority
              </span>
            </div>

            {/* Scope / Bio Box */}
            <p
              style={{
                fontSize: '0.73rem',
                color: '#94a3b8',
                lineHeight: '1.45',
                margin: 0,
                background: '#090d16',
                padding: '10px 12px',
                borderRadius: '7px',
                border: '1px solid #1a2333',
                width: '100%',
                boxSizing: 'border-box',
                textAlign: 'left',
              }}
            >
              {profileForm.bio || 'Platform Super Administrator with complete system governance and catalog moderation authority.'}
            </p>

            {/* Access & Security Metadata Table */}
            <div
              style={{
                width: '100%',
                borderTop: '1px solid #1a2333',
                paddingTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.72rem',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Account ID</span>
                <span style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>#{currentUser?.id || 5}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Primary Email</span>
                <span style={{ color: '#cbd5e1' }}>{currentUser?.email || 'iks214262@gmail.com'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Active Roles</span>
                <span style={{ color: '#38bdf8', fontWeight: '600' }}>
                  {currentUser?.roles?.join(', ') || 'admin'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Identity Protection</span>
                <span style={{ color: isSuperAdmin ? '#00c896' : '#94a3b8', fontWeight: '600' }}>
                  {isSuperAdmin ? '✓ Root Protected' : 'Standard'}
                </span>
              </div>
            </div>

            {/* Quick Avatar Presets */}
            <div style={{ width: '100%', borderTop: '1px solid #1a2333', paddingTop: '10px' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                Quick Avatar Presets
              </span>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {avatarPresets.map((avUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProfileForm((prev) => ({ ...prev, avatar: avUrl }))}
                    style={{
                      padding: 0,
                      background: 'none',
                      border: profileForm.avatar === avUrl ? '2px solid #38bdf8' : '1px solid #1e293b',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      width: '28px',
                      height: '28px',
                      overflow: 'hidden',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <img src={avUrl} alt={`Preset ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Identity Form & Password Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Card 1: Administrator Profile Details */}
            <div
              style={{
                background: '#0e131f',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '7px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                    fontSize: '0.8rem',
                  }}
                >
                  <i className="fas fa-id-card"></i>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                    Administrator Identity & Public Display
                  </h4>
                  <p style={{ fontSize: '0.71rem', color: '#64748b', margin: '2px 0 0' }}>
                    Personalize your display credentials and administrative authority notes
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                      Display Name <span style={{ color: '#ff5252' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      placeholder="e.g. Super Administrator"
                      required
                      style={{
                        width: '100%',
                        padding: '8px 11px',
                        background: '#090d16',
                        border: '1px solid #26354a',
                        borderRadius: '7px',
                        color: '#f8fafc',
                        fontSize: '0.79rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'border-color 0.15s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
                      onBlur={(e) => (e.target.style.borderColor = '#26354a')}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                      Username Handle <span style={{ color: '#ff5252' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.78rem' }}>@</span>
                      <input
                        type="text"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                        placeholder="superadmin"
                        required
                        style={{
                          width: '100%',
                          padding: '8px 11px 8px 24px',
                          background: '#090d16',
                          border: '1px solid #26354a',
                          borderRadius: '7px',
                          color: '#f8fafc',
                          fontSize: '0.79rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                          transition: 'border-color 0.15s ease',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
                        onBlur={(e) => (e.target.style.borderColor = '#26354a')}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                      Primary Email (Root Protected Identity)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        value={currentUser?.email || 'iks214262@gmail.com'}
                        disabled
                        title="Super Administrator email is protected and managed via database root credentials."
                        style={{
                          width: '100%',
                          padding: '8px 11px 8px 30px',
                          background: '#131b2e',
                          border: '1px solid #1a2333',
                          borderRadius: '7px',
                          color: '#64748b',
                          fontSize: '0.79rem',
                          boxSizing: 'border-box',
                          cursor: 'not-allowed',
                        }}
                      />
                      <i
                        className="fas fa-lock"
                        style={{
                          position: 'absolute',
                          left: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#00c896',
                          fontSize: '0.72rem',
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                      Avatar Image URL
                    </label>
                    <input
                      type="text"
                      value={profileForm.avatar}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                      placeholder="/images/avatar.jpg or https://..."
                      style={{
                        width: '100%',
                        padding: '8px 11px',
                        background: '#090d16',
                        border: '1px solid #26354a',
                        borderRadius: '7px',
                        color: '#f8fafc',
                        fontSize: '0.79rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'border-color 0.15s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
                      onBlur={(e) => (e.target.style.borderColor = '#26354a')}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                    Administrative Scope & Notes
                  </label>
                  <textarea
                    rows={2}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Enter your administrative scope, organizational title, or security clearance notes..."
                    style={{
                      width: '100%',
                      padding: '8px 11px',
                      background: '#090d16',
                      border: '1px solid #26354a',
                      borderRadius: '7px',
                      color: '#f8fafc',
                      fontSize: '0.79rem',
                      lineHeight: '1.4',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
                    onBlur={(e) => (e.target.style.borderColor = '#26354a')}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      fontSize: '0.77rem',
                      fontWeight: '600',
                      color: '#fff',
                      background: '#2563eb',
                      border: 'none',
                      borderRadius: '7px',
                      cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <i className={isSavingProfile ? 'fas fa-spinner fa-spin' : 'fas fa-check'}></i>
                    <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Card 2: Password & Authentication Security */}
            <div
              style={{
                background: '#0e131f',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '7px',
                    background: 'rgba(255, 170, 0, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFAA00',
                    fontSize: '0.8rem',
                  }}
                >
                  <i className="fas fa-lock"></i>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                    Security & Access Credentials
                  </h4>
                  <p style={{ fontSize: '0.71rem', color: '#64748b', margin: '2px 0 0' }}>
                    Rotate administrator password. Minimum 4 characters required.
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                      Current Password <span style={{ color: '#ff5252' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Current password"
                        required
                        style={{
                          width: '100%',
                          padding: '8px 30px 8px 11px',
                          background: '#090d16',
                          border: '1px solid #26354a',
                          borderRadius: '7px',
                          color: '#f8fafc',
                          fontSize: '0.79rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#64748b',
                          fontSize: '0.74rem',
                          padding: '3px',
                        }}
                      >
                        <i className={`fas ${showPassword.current ? 'fa-eye-slash' : 'fa-eye'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                      New Password <span style={{ color: '#ff5252' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword.next ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Min. 4 chars"
                        required
                        style={{
                          width: '100%',
                          padding: '8px 30px 8px 11px',
                          background: '#090d16',
                          border: '1px solid #26354a',
                          borderRadius: '7px',
                          color: '#f8fafc',
                          fontSize: '0.79rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, next: !showPassword.next })}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#64748b',
                          fontSize: '0.74rem',
                          padding: '3px',
                        }}
                      >
                        <i className={`fas ${showPassword.next ? 'fa-eye-slash' : 'fa-eye'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                      Confirm Password <span style={{ color: '#ff5252' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Re-type password"
                        required
                        style={{
                          width: '100%',
                          padding: '8px 30px 8px 11px',
                          background: '#090d16',
                          border: '1px solid #26354a',
                          borderRadius: '7px',
                          color: '#f8fafc',
                          fontSize: '0.79rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#64748b',
                          fontSize: '0.74rem',
                          padding: '3px',
                        }}
                      >
                        <i className={`fas ${showPassword.confirm ? 'fa-eye-slash' : 'fa-eye'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '8px',
                    borderTop: '1px solid #1a2333',
                  }}
                >
                  <span style={{ fontSize: '0.71rem', color: '#64748b' }}>
                    <i className="fas fa-shield-virus" style={{ marginRight: '5px' }}></i>
                    Passwords encrypted with 10-round bcrypt hashing
                  </span>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      fontSize: '0.77rem',
                      fontWeight: '600',
                      color: '#fff',
                      background: '#d97706',
                      border: 'none',
                      borderRadius: '7px',
                      cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <i className={isChangingPassword ? 'fas fa-spinner fa-spin' : 'fas fa-key'}></i>
                    <span>{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* 2. PLATFORM & SYSTEM GOVERNANCE SETTINGS SUBTAB            */}
      {/* ───────────────────────────────────────────────────────── */}
      {activeSubtab === 'settings' && (
        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card 1: Platform Brand & Availability Rules */}
          <div
            style={{
              background: '#0e131f',
              border: '1px solid #1e293b',
              borderRadius: '10px',
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                  fontSize: '0.8rem',
                }}
              >
                <i className="fas fa-globe"></i>
              </div>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                  Platform Brand & System Availability
                </h4>
                <p style={{ fontSize: '0.71rem', color: '#64748b', margin: '2px 0 0' }}>
                  Manage platform identifiers, public ingress, and maintenance mode gating
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settings.platform_name}
                  onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 11px',
                    background: '#090d16',
                    border: '1px solid #26354a',
                    borderRadius: '7px',
                    color: '#f8fafc',
                    fontSize: '0.79rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                  Compliance & Support Email
                </label>
                <input
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 11px',
                    background: '#090d16',
                    border: '1px solid #26354a',
                    borderRadius: '7px',
                    color: '#f8fafc',
                    fontSize: '0.79rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                  Platform Environment
                </label>
                <select
                  value={settings.environment}
                  onChange={(e) => setSettings({ ...settings, environment: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 11px',
                    background: '#090d16',
                    border: '1px solid #26354a',
                    borderRadius: '7px',
                    color: '#f8fafc',
                    fontSize: '0.79rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                >
                  <option value="Production">Production (Active Live)</option>
                  <option value="Staging">Staging & QA Cluster</option>
                  <option value="Development">Local Development</option>
                </select>
              </div>
            </div>

            {/* Modern Interactive Switch Toggles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
              <ToggleSwitch
                checked={settings.maintenance_mode === 'true'}
                onChange={() =>
                  setSettings({
                    ...settings,
                    maintenance_mode: settings.maintenance_mode === 'true' ? 'false' : 'true',
                  })
                }
                label="Maintenance Mode"
                description={
                  settings.maintenance_mode === 'true'
                    ? 'Catalog blocked; visitors see maintenance screen'
                    : 'Platform is online and accepting public traffic'
                }
                color="#ef4444"
              />

              <ToggleSwitch
                checked={settings.allow_registrations === 'true'}
                onChange={() =>
                  setSettings({
                    ...settings,
                    allow_registrations: settings.allow_registrations === 'true' ? 'false' : 'true',
                  })
                }
                label="Public User Registrations"
                description={
                  settings.allow_registrations === 'true'
                    ? 'Open registration enabled for all new listeners'
                    : 'Registration is restricted (Invite-only)'
                }
                color="#00c896"
              />
            </div>
          </div>

          {/* Card 2: Audio Codecs & Streaming Policies */}
          <div
            style={{
              background: '#0e131f',
              border: '1px solid #1e293b',
              borderRadius: '10px',
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  background: 'rgba(0, 200, 150, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00c896',
                  fontSize: '0.8rem',
                }}
              >
                <i className="fas fa-compact-disc"></i>
              </div>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                  Audio Codecs & Content Ingestion Governance
                </h4>
                <p style={{ fontSize: '0.71rem', color: '#64748b', margin: '2px 0 0' }}>
                  Define audio bitrate standards, file upload ceilings, and upload approval workflow
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                  Default Audio Streaming Quality
                </label>
                <select
                  value={settings.default_audio_bitrate}
                  onChange={(e) => setSettings({ ...settings, default_audio_bitrate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 11px',
                    background: '#090d16',
                    border: '1px solid #26354a',
                    borderRadius: '7px',
                    color: '#f8fafc',
                    fontSize: '0.79rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                >
                  <option value="320kbps">320 kbps (High Fidelity MP3 / AAC)</option>
                  <option value="256kbps">256 kbps (Lossless Web Stream)</option>
                  <option value="192kbps">192 kbps (Standard Mobile Stream)</option>
                  <option value="128kbps">128 kbps (Low Bandwidth Economy)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                  Max File Upload Limit (MB)
                </label>
                <select
                  value={settings.max_upload_size_mb}
                  onChange={(e) => setSettings({ ...settings, max_upload_size_mb: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 11px',
                    background: '#090d16',
                    border: '1px solid #26354a',
                    borderRadius: '7px',
                    color: '#f8fafc',
                    fontSize: '0.79rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                >
                  <option value="50">50 MB per track</option>
                  <option value="100">100 MB per track (Recommended)</option>
                  <option value="250">250 MB per track (Lossless WAV)</option>
                </select>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.require_track_approval === 'true'}
              onChange={() =>
                setSettings({
                  ...settings,
                  require_track_approval: settings.require_track_approval === 'true' ? 'false' : 'true',
                })
              }
              label="Track Upload Moderation Gate"
              description={
                settings.require_track_approval === 'true'
                  ? 'All artist uploads require administrator moderation approval before publishing'
                  : 'Tracks are automatically published to live catalog immediately upon upload'
              }
              color="#38bdf8"
            />
          </div>

          {/* Card 3: Monetization, Royalties & Session Duration */}
          <div
            style={{
              background: '#0e131f',
              border: '1px solid #1e293b',
              borderRadius: '10px',
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  background: 'rgba(255, 170, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFAA00',
                  fontSize: '0.8rem',
                }}
              >
                <i className="fas fa-wallet"></i>
              </div>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                  Monetization, Royalty Rates & Payout Thresholds
                </h4>
                <p style={{ fontSize: '0.71rem', color: '#64748b', margin: '2px 0 0' }}>
                  Set royalty remuneration rates per stream, minimum cash-out threshold, and token lifetime
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                  Per-Stream Royalty Rate ($ USD)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', color: '#64748b' }}>$</span>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={settings.royalty_rate_per_stream}
                    onChange={(e) => setSettings({ ...settings, royalty_rate_per_stream: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 11px 8px 24px',
                      background: '#090d16',
                      border: '1px solid #26354a',
                      borderRadius: '7px',
                      color: '#f8fafc',
                      fontSize: '0.79rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.67rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                  Standard rate: $0.0040 USD per stream
                </span>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                  Min Payout Threshold ($ USD)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', color: '#64748b' }}>$</span>
                  <input
                    type="number"
                    step="5"
                    min="10"
                    value={settings.min_payout_threshold}
                    onChange={(e) => setSettings({ ...settings, min_payout_threshold: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 11px 8px 24px',
                      background: '#090d16',
                      border: '1px solid #26354a',
                      borderRadius: '7px',
                      color: '#f8fafc',
                      fontSize: '0.79rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.67rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                  Minimum accrued for release
                </span>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                  Session Token Validity
                </label>
                <select
                  value={settings.session_token_expiry_days}
                  onChange={(e) => setSettings({ ...settings, session_token_expiry_days: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 11px',
                    background: '#090d16',
                    border: '1px solid #26354a',
                    borderRadius: '7px',
                    color: '#f8fafc',
                    fontSize: '0.79rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                >
                  <option value="1">24 Hours (High Security)</option>
                  <option value="7">7 Days (Balanced)</option>
                  <option value="30">30 Days (Extended)</option>
                </select>
                <span style={{ fontSize: '0.67rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                  JWT token session lifetime
                </span>
              </div>
            </div>
          </div>

          {/* Action Bar Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              background: '#0e131f',
              border: '1px solid #1e293b',
              borderRadius: '10px',
            }}
          >
            <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-check-circle" style={{ color: '#00c896', fontSize: '0.8rem' }}></i>
              <span>Policies are synchronized live with system configuration</span>
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setSettings({
                    platform_name: 'SoundFly Music',
                    support_email: 'support@soundfly.io',
                    maintenance_mode: 'false',
                    allow_registrations: 'true',
                    default_audio_bitrate: '320kbps',
                    max_upload_size_mb: '100',
                    require_track_approval: 'true',
                    royalty_rate_per_stream: '0.0040',
                    min_payout_threshold: '50.00',
                    session_token_expiry_days: '7',
                    enforce_admin_2fa: 'false',
                    environment: 'Production',
                  });
                  showToast?.('Reset fields to recommended platform defaults', 'info');
                }}
                style={{
                  padding: '8px 14px',
                  fontSize: '0.76rem',
                  fontWeight: '600',
                  color: '#94a3b8',
                  background: 'transparent',
                  border: '1px solid #26354a',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Reset Defaults
              </button>

              <button
                type="submit"
                disabled={isSavingSettings}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: '#081a13',
                  background: '#00c896',
                  border: 'none',
                  borderRadius: '7px',
                  cursor: isSavingSettings ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 10px rgba(0, 200, 150, 0.25)',
                }}
              >
                <i className={isSavingSettings ? 'fas fa-spinner fa-spin' : 'fas fa-save'}></i>
                <span>{isSavingSettings ? 'Saving Policies...' : 'Save Governance Policies'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
