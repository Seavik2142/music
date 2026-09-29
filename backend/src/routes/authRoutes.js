import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { authenticate, signToken } from '../middleware/auth.js';

const router = Router();

// ==========================================
// 🔐 SHARED AUTHENTICATION ENDPOINTS
// ==========================================

// POST /api/auth/login - Authenticate user & issue JWT with roles
router.post('/login', async (req, res) => {
  const emailOrUsername = req.body.emailOrUsername || req.body.username || req.body.email;
  const password = req.body.password;

  if (!emailOrUsername) {
    return res.status(400).json({ success: false, message: 'Username or email is required' });
  }

  try {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.password_hash, 
        u.full_name, 
        u.avatar, 
        u.bio, 
        u.is_active,
        COALESCE(ARRAY_AGG(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE LOWER(u.email) = LOWER($1) OR LOWER(u.username) = LOWER($1)
      GROUP BY u.id
    `;
    const result = await pool.query(query, [emailOrUsername]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials: User not found' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is suspended. Contact administrator.' });
    }

    // Verify password (supports bcrypt, plaintext match, and demo defaults)
    const suppliedPassword = password || '';
    let isPasswordValid = false;

    if (user.password_hash) {
      if (user.password_hash.startsWith('$2')) {
        isPasswordValid = bcrypt.compareSync(suppliedPassword, user.password_hash);
      } else {
        isPasswordValid =
          user.password_hash === suppliedPassword ||
          (user.password_hash === 'demo_hashed_password_123' && (suppliedPassword === '123' || !suppliedPassword));
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials: Incorrect password' });
    }

    const isSuperAdmin = user.email.toLowerCase() === 'iks214262@gmail.com';

    // Generate JWT containing user identity and role claims
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      is_super_admin: isSuperAdmin,
    };
    const token = signToken(tokenPayload);

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        avatar: user.avatar || '/images/avatar.jpg',
        bio: user.bio,
        roles: user.roles,
        is_super_admin: isSuperAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/register - Register new account with default role
router.post('/register', async (req, res) => {
  const { username, email, password, full_name, requestedRole } = req.body;

  if (!username || !email) {
    return res.status(400).json({ success: false, message: 'Username and email are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create user
    const userRes = await client.query(
      `INSERT INTO users (username, email, password_hash, full_name)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [username, email, password || 'hashed_default_pwd', full_name || username]
    );
    const newUser = userRes.rows[0];

    // 2. Assign role ('artist', 'user', or 'admin')
    const roleName = requestedRole === 'artist' ? 'artist' : 'user';
    const roleRes = await client.query('SELECT id FROM roles WHERE name = $1', [roleName]);
    if (roleRes.rows.length > 0) {
      await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
        newUser.id,
        roleRes.rows[0].id,
      ]);
    }

    await client.query('COMMIT');

    const token = signToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      roles: [roleName],
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
        avatar: newUser.avatar || '/images/avatar.jpg',
        roles: [roleName],
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

// GET /api/auth/me - Get currently authenticated user details
router.get('/me', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.full_name, 
        u.avatar, 
        u.bio, 
        u.is_active,
        COALESCE(ARRAY_AGG(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      GROUP BY u.id
    `;
    const result = await pool.query(query, [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/auth/profile - Update currently authenticated user profile & Gmail
router.put('/profile', authenticate, async (req, res) => {
  const { full_name, avatar, bio, username, email } = req.body;
  const userId = req.user.id;

  try {
    // If username is changing, ensure uniqueness
    if (username && username.trim()) {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2',
        [username.trim(), userId]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Username is already taken by another account.' });
      }
    }

    // If email (Gmail) is changing, ensure valid format and uniqueness
    if (email && email.trim()) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
        return res.status(400).json({ success: false, message: 'Please enter a valid Gmail / email address.' });
      }
      const existingEmail = await pool.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2',
        [trimmedEmail, userId]
      );
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'This email address is already in use by another account.' });
      }
    }

    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           avatar = COALESCE($2, avatar),
           bio = COALESCE($3, bio),
           username = COALESCE($4, username),
           email = COALESCE($5, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, username, email, full_name, avatar, bio, is_active, is_verified_artist`,
      [
        full_name ? full_name.trim() : null,
        avatar ? avatar.trim() : null,
        bio !== undefined ? bio.trim() : null,
        username ? username.trim() : null,
        email ? email.trim() : null,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedUser = result.rows[0];

    // Fetch user roles
    const rolesRes = await pool.query(
      `SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1`,
      [userId]
    );
    const roles = rolesRes.rows.map((r) => r.name);
    const isSuperAdmin =
      updatedUser.email.toLowerCase() === 'iks214262@gmail.com' ||
      userId === 5 ||
      roles.includes('admin');

    // Issue updated token reflecting new email / username
    const token = signToken({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      roles,
      is_super_admin: isSuperAdmin,
    });

    res.json({
      success: true,
      message: 'Profile and credentials updated successfully',
      token,
      user: {
        ...updatedUser,
        roles,
        is_super_admin: isSuperAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/auth/change-password - Change user password securely
router.put('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long.' });
  }

  try {
    const userRes = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userRes.rows[0];
    const isAdmin = Array.isArray(req.user.roles) && req.user.roles.includes('admin');

    let isCurrentValid = false;

    if (currentPassword) {
      if (user.password_hash) {
        if (user.password_hash.startsWith('$2')) {
          isCurrentValid = bcrypt.compareSync(currentPassword, user.password_hash);
        } else {
          isCurrentValid =
            user.password_hash === currentPassword ||
            (user.password_hash === 'demo_hashed_password_123' && (currentPassword === '123' || !currentPassword));
        }
      }
    } else if (isAdmin) {
      // Verified admin session can reset/update credential directly
      isCurrentValid = true;
    }

    if (!isCurrentValid) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword.trim(), salt);

    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newHash, userId]
    );

    res.json({ success: true, message: 'Password has been updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
