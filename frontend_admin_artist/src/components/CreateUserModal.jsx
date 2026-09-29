import React, { useState } from 'react';

export default function CreateUserModal({ isOpen, onClose, onSave }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('12345678');
  const [role, setRole] = useState('artist');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const rolesList = [
    { id: 'admin', label: 'Admin', desc: 'Full platform governance', color: '#ff5252', icon: 'fas fa-shield-alt' },
    { id: 'moderator', label: 'Moderator', desc: 'Content & dispute audit', color: '#FFAA00', icon: 'fas fa-user-shield' },
    { id: 'artist', label: 'Artist', desc: 'Music upload & studio', color: '#00c896', icon: 'fas fa-microphone-alt' },
    { id: 'premium_user', label: 'Premium', desc: 'Hi-Fi ad-free listener', color: '#8685EF', icon: 'fas fa-gem' },
    { id: 'user', label: 'Free User', desc: 'Standard shuffle listener', color: '#2d659b', icon: 'fas fa-user' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      setErrorMsg('Username and email are required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onSave({
        full_name: fullName.trim() || username.trim(),
        username: username.trim(),
        email: email.trim(),
        password: password.trim() || '12345678',
        role,
      });
      // Reset form
      setFullName('');
      setUsername('');
      setEmail('');
      setPassword('12345678');
      setRole('artist');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create user account');
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
          maxWidth: '480px',
          background: '#0e131f',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-user-plus" style={{ color: '#00c896', fontSize: '0.9rem' }}></i>
              Create Platform Member
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
              Register account credentials and assign platform access permissions
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.9rem',
              padding: '4px',
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              margin: '12px 20px 0',
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'rgba(255, 82, 82, 0.1)',
              border: '1px solid rgba(255, 82, 82, 0.3)',
              color: '#ff5252',
              fontSize: '0.76rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fas fa-exclamation-circle"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '16px 20px' }}>
          {/* Full Name & Username */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. John Lennon"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
                Username <span style={{ color: '#ff5252' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. jlennon"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
          </div>

          {/* Email & Initial Password */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
                Email Address <span style={{ color: '#ff5252' }}>*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. john@soundfly.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                Password <span style={{ color: '#ff5252' }}>*</span>
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          {/* Role Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>
              Assign Access Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '6px' }}>
              {rolesList.map((r) => {
                const isSelected = role === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    style={{
                      padding: '8px 6px',
                      borderRadius: '6px',
                      border: isSelected ? `1.5px solid ${r.color}` : '1px solid #1e293b',
                      background: isSelected ? `${r.color}15` : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <i className={r.icon} style={{ color: r.color, fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}></i>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: isSelected ? '#fff' : '#94a3b8' }}>
                      {r.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              paddingTop: '12px',
              borderTop: '1px solid #1e293b',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '6px 14px',
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
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  <span>Create Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
