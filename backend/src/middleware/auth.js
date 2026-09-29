import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'soundfly_jwt_super_secret_key_2026';

// Middleware to authenticate user via JWT
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  // If Bearer token is provided, verify it strictly
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // { id, username, email, roles }
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token: ' + error.message,
      });
    }
  }

  // Development convenience fallback if no token passed
  if (process.env.NODE_ENV === 'development') {
    req.user = {
      id: 5,
      username: 'superadmin',
      email: 'iks214262@gmail.com',
      roles: ['admin', 'artist'],
      is_super_admin: true,
    };
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please provide a valid Bearer token.',
  });
}

// Middleware factory to enforce distinct role permissions (RBAC)
export function requireRole(allowedRoles) {
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user || !Array.isArray(req.user.roles)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: No role permissions found for this user.',
      });
    }

    const hasPermission = req.user.roles.some((userRole) =>
      rolesArray.map((r) => r.toLowerCase()).includes(userRole.toLowerCase())
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        code: 'ROLE_FORBIDDEN',
        message: `Forbidden: This route requires [${rolesArray.join(' or ')}] role. Your active roles: [${req.user.roles.join(', ')}].`,
      });
    }

    next();
  };
}

// Helper to sign JWT tokens
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
