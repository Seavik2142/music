import React from 'react';

export default function AccessDenied({ requiredRole, userRoles, onLogout, onGoDashboard }) {
  return (
    <div className="access-denied-container">
      <div className="access-denied-card">
        <div className="denied-icon-circle">
          <i className="fas fa-lock"></i>
        </div>
        <h2>403 — Distinct Route Access Forbidden</h2>
        <p className="denied-explanation">
          This route belongs to the <strong>{requiredRole.toUpperCase()}</strong> partition and requires
          explicit <code>[{requiredRole}]</code> authorization.
        </p>

        <div className="roles-audit-box">
          <div className="audit-row">
            <span className="audit-label">Required Role:</span>
            <span className="role-tag-pill" style={{ backgroundColor: '#ff525225', color: '#ff5252', border: '1px solid #ff525250' }}>
              {requiredRole.toUpperCase()}
            </span>
          </div>
          <div className="audit-row">
            <span className="audit-label">Your Active Roles:</span>
            <div className="roles-chips">
              {userRoles && userRoles.length > 0 ? (
                userRoles.map((r, i) => (
                  <span key={i} className="role-chip" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    {r.toUpperCase()}
                  </span>
                ))
              ) : (
                <span className="text-muted">None</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '18px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {onGoDashboard && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onGoDashboard}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                fontSize: '0.8rem',
                fontWeight: '600',
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <i className="fas fa-home"></i>
              <span>Back to Authorized Tab</span>
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              className="btn-primary"
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                fontSize: '0.8rem',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <i className="fas fa-sign-in-alt"></i>
              <span>Sign In with Different Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
