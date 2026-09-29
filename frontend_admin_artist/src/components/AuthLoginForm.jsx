import React, { useState } from 'react';

export default function AuthLoginForm({ onLogin, showToast, backendStatus = true }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your Gmail / email address');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your account password');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (onLogin) {
        await onLogin(email.trim(), password.trim());
      }
    } catch (err) {
      const msg = err.message || 'Authentication failed. Please verify your Gmail and password.';
      setErrorMessage(msg);
      showToast?.(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="auth-login-page"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#070a12',
        backgroundImage: 'radial-gradient(ellipse at top, rgba(45, 101, 155, 0.15), transparent 70%), radial-gradient(ellipse at bottom, rgba(0, 200, 150, 0.08), transparent 70%)',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="auth-card"
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#0e131f',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '28px 24px 20px',
            textAlign: 'center',
            borderBottom: '1px solid #1a2333',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(0, 200, 150, 0.2) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              fontSize: '1.3rem',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)',
            }}
          >
            <i className="fas fa-shield-alt"></i>
          </div>

          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
            SoundFly Portal
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
            Sign in with your Gmail and password to access the portal
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px' }}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: 'rgba(255, 82, 82, 0.12)',
                border: '1px solid rgba(255, 82, 82, 0.35)',
                color: '#ff6b6b',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '18px',
                lineHeight: '1.4',
              }}
            >
              <i className="fas fa-exclamation-circle" style={{ flexShrink: 0 }}></i>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Gmail / Email Input */}
            <div className="form-group" style={{ margin: 0 }}>
              <label
                style={{
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  color: '#cbd5e1',
                  marginBottom: '6px',
                  display: 'block',
                  letterSpacing: '0.2px',
                }}
              >
                Gmail / Email Address <span style={{ color: '#ff5252' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <i
                  className="fas fa-envelope"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    fontSize: '0.78rem',
                  }}
                ></i>
                <input
                  type="text"
                  placeholder="e.g. iks214262@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username email"
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    background: '#090d16',
                    border: '1px solid #26354a',
                    borderRadius: '7px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
                  onBlur={(e) => (e.target.style.borderColor = '#26354a')}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group" style={{ margin: 0 }}>
              <label
                style={{
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  color: '#cbd5e1',
                  marginBottom: '6px',
                  display: 'block',
                  letterSpacing: '0.2px',
                }}
              >
                Password <span style={{ color: '#ff5252' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <i
                  className="fas fa-lock"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    fontSize: '0.78rem',
                  }}
                ></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '9px 38px 9px 34px',
                    background: '#090d16',
                    border: '1px solid #26354a',
                    borderRadius: '7px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
                  onBlur={(e) => (e.target.style.borderColor = '#26354a')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '0.78rem',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Remember Session */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.74rem',
                color: '#64748b',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#00c896', cursor: 'pointer' }}
                />
                <span style={{ color: '#94a3b8' }}>Remember session</span>
              </label>
            </div>

            {/* Log In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 16px',
                fontSize: '0.82rem',
                fontWeight: '700',
                color: '#081a13',
                background: '#00c896',
                border: 'none',
                borderRadius: '7px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginTop: '6px',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 14px rgba(0, 200, 150, 0.25)',
              }}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Log In</span>
                </>
              )}
            </button>
          </form>

          {/* Security Architecture Footnote */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '14px',
              borderTop: '1px solid #1a2333',
              fontSize: '0.7rem',
              color: '#64748b',
              textAlign: 'center',
              lineHeight: '1.4',
            }}
          >
            <span>
              Secure Authentication • SoundFly Portal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
