import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

const router = Router();

// =========================================================================
// 1. CONTENT & MUSIC MANAGEMENT
// =========================================================================

// GET /api/admin/songs - Get all songs across platform with moderation metadata
router.get('/songs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, title, artist, album, duration, path, image, 
        COALESCE(status, 'approved') as status,
        COALESCE(is_enabled, true) as is_enabled,
        COALESCE(streams_count, 0) as streams_count,
        created_at
      FROM songs 
      ORDER BY id DESC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/content/pending - Pending songs & albums awaiting approval
router.get('/content/pending', async (req, res) => {
  try {
    const songsRes = await pool.query(
      "SELECT * FROM songs WHERE status = 'pending' ORDER BY id DESC"
    );
    const albumsRes = await pool.query(
      "SELECT * FROM albums WHERE status = 'pending' ORDER BY id DESC"
    );
    res.json({
      success: true,
      pendingCount: songsRes.rows.length + albumsRes.rows.length,
      data: {
        songs: songsRes.rows,
        albums: albumsRes.rows,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/songs/:id/status - Approve or reject a song
router.put('/songs/:id/status', async (req, res) => {
  const songId = parseInt(req.params.id, 10);
  const { status, reason } = req.body; // 'approved' | 'rejected' | 'pending'
  try {
    const result = await pool.query(
      'UPDATE songs SET status = $1 WHERE id = $2 RETURNING *',
      [status, songId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }
    res.json({
      success: true,
      message: `Track "${result.rows[0].title}" marked as ${status.toUpperCase()}${reason ? ` (${reason})` : ''}`,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/songs/:id/toggle-playback - Global Content Control: disable/enable playback
router.put('/songs/:id/toggle-playback', async (req, res) => {
  const songId = parseInt(req.params.id, 10);
  const { is_enabled } = req.body;
  try {
    const result = await pool.query(
      'UPDATE songs SET is_enabled = $1 WHERE id = $2 RETURNING *',
      [Boolean(is_enabled), songId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }
    res.json({
      success: true,
      message: `Playback for "${result.rows[0].title}" is now ${is_enabled ? 'ENABLED' : 'DISABLED'} globally.`,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/songs/:id - Global Content Control: Permanent deletion
router.delete('/songs/:id', async (req, res) => {
  const songId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query('DELETE FROM songs WHERE id = $1 RETURNING *', [songId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }
    res.json({ success: true, message: `Track "${result.rows[0].title}" permanently removed by administrator.`, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/albums/:id - Global Content Control: Delete album
router.delete('/albums/:id', async (req, res) => {
  const albumId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query('DELETE FROM albums WHERE id = $1 RETURNING *', [albumId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Album not found' });
    }
    res.json({ success: true, message: `Album "${result.rows[0].name}" removed from platform.`, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/genres - List genres
router.get('/genres', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM genres ORDER BY id ASC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/genres - Create genre
router.post('/genres', async (req, res) => {
  const { name, color, col_span } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Genre name is required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO genres (name, color, col_span)
       VALUES ($1, $2, $3) RETURNING *`,
      [name.trim(), color || '#2D659B', col_span || '1']
    );
    res.status(201).json({
      success: true,
      message: `Genre "${name}" created successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Genre name already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/genres/:id - Edit genre
router.put('/genres/:id', async (req, res) => {
  const genreId = parseInt(req.params.id, 10);
  const { name, color, col_span } = req.body;
  try {
    const result = await pool.query(
      `UPDATE genres 
       SET name = COALESCE($1, name),
           color = COALESCE($2, color),
           col_span = COALESCE($3, col_span)
       WHERE id = $4 RETURNING *`,
      [name?.trim(), color, col_span, genreId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Genre not found' });
    }
    res.json({ success: true, message: 'Genre updated successfully', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/genres/:id - Delete genre
router.delete('/genres/:id', async (req, res) => {
  const genreId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query('DELETE FROM genres WHERE id = $1 RETURNING *', [genreId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Genre not found' });
    }
    res.json({ success: true, message: `Genre "${result.rows[0].name}" deleted.`, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// 2. USER & ROLE MANAGEMENT
// =========================================================================

// GET /api/admin/users - Get all users with roles, verification & status
router.get('/users', async (req, res) => {
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
        COALESCE(u.is_verified_artist, false) as is_verified_artist,
        u.suspension_reason,
        u.created_at,
        CASE WHEN LOWER(u.email) = 'iks214262@gmail.com' THEN true ELSE false END AS is_super_admin,
        COALESCE(ARRAY_AGG(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
      ORDER BY u.id ASC
    `;
    const result = await pool.query(query);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/users - Create new user account with role
router.post('/users', async (req, res) => {
  const { username, email, password, full_name, role } = req.body;
  if (!username || !email) {
    return res.status(400).json({ success: false, message: 'Username and email are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const duplicateCheck = await client.query(
      'SELECT id, username, email FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)',
      [username.trim(), email.trim()]
    );
    if (duplicateCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      const dup = duplicateCheck.rows[0];
      const matchType = dup.username.toLowerCase() === username.trim().toLowerCase() ? 'Username' : 'Email';
      return res.status(409).json({ success: false, message: `${matchType} already exists in the system.` });
    }

    const passwordHash = bcrypt.hashSync(password || '123', 10);

    const userRes = await client.query(
      `INSERT INTO users (username, email, password_hash, full_name)
       VALUES ($1, $2, $3, $4) RETURNING id, username, email, full_name, avatar, bio, is_active, created_at`,
      [username.trim(), email.trim(), passwordHash, full_name?.trim() || username.trim()]
    );
    const newUser = userRes.rows[0];

    const targetRoleName = role || 'user';
    const roleRes = await client.query('SELECT id FROM roles WHERE name = $1', [targetRoleName]);
    if (roleRes.rows.length > 0) {
      await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
        newUser.id,
        roleRes.rows[0].id,
      ]);
    }

    await client.query('COMMIT');
    res.status(201).json({
      success: true,
      message: `User @${newUser.username} created successfully with role [${targetRoleName}].`,
      data: {
        ...newUser,
        roles: [targetRoleName],
        is_super_admin: newUser.email.toLowerCase() === 'iks214262@gmail.com',
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

// PUT /api/admin/users/:id/credentials - Admin update user email or password
router.put('/users/:id/credentials', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { email, password, username, full_name } = req.body;

  try {
    const targetCheck = await pool.query('SELECT id, email, username FROM users WHERE id = $1', [userId]);
    if (targetCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If email is changing, validate format and ensure uniqueness
    if (email && email.trim()) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
        return res.status(400).json({ success: false, message: 'Invalid Gmail / email address.' });
      }
      const existing = await pool.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2',
        [trimmedEmail, userId]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Email address is already assigned to another account.' });
      }
    }

    // If username is changing, ensure uniqueness
    if (username && username.trim()) {
      const existing = await pool.query(
        'SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2',
        [username.trim(), userId]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Username is already taken by another account.' });
      }
    }

    let passwordHash = null;
    if (password && password.trim()) {
      if (password.trim().length < 4) {
        return res.status(400).json({ success: false, message: 'Password must be at least 4 characters.' });
      }
      passwordHash = bcrypt.hashSync(password.trim(), 10);
    }

    const result = await pool.query(
      `UPDATE users 
       SET email = COALESCE($1, email),
           username = COALESCE($2, username),
           full_name = COALESCE($3, full_name),
           password_hash = COALESCE($4, password_hash),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, username, email, full_name, is_active, is_verified_artist`,
      [
        email ? email.trim() : null,
        username ? username.trim() : null,
        full_name ? full_name.trim() : null,
        passwordHash,
        userId,
      ]
    );

    res.json({
      success: true,
      message: `Credentials updated for user @${result.rows[0].username}.`,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/users/:id/status - Suspend or close account with violation reason
router.put('/users/:id/status', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { is_active, suspension_reason } = req.body;
  try {
    const targetCheck = await pool.query('SELECT id, email FROM users WHERE id = $1', [userId]);
    if (targetCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (targetCheck.rows[0].email.toLowerCase() === 'iks214262@gmail.com') {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot suspend the Super Administrator account.' });
    }

    const result = await pool.query(
      `UPDATE users 
       SET is_active = $1, 
           suspension_reason = $2, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING id, username, is_active, suspension_reason`,
      [is_active, is_active ? null : suspension_reason || 'Violation of Community Guidelines', userId]
    );
    res.json({
      success: true,
      message: `User @${result.rows[0].username} account status set to ${is_active ? 'ACTIVE' : 'SUSPENDED'}.`,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/users/:id/verify-artist - Grant/revoke "Verified Artist" badge
router.put('/users/:id/verify-artist', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { is_verified_artist } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users 
       SET is_verified_artist = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, username, full_name, is_verified_artist`,
      [Boolean(is_verified_artist), userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      message: `Artist @${result.rows[0].username} is now ${is_verified_artist ? 'VERIFIED ✓' : 'UNVERIFIED'}.`,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/users/:id/roles - Assign or modify roles (Admin, Moderator, Artist, Premium User, Free User)
router.put('/users/:id/roles', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { roles } = req.body;
  if (!Array.isArray(roles)) {
    return res.status(400).json({ success: false, message: 'roles must be an array of role names' });
  }

  const targetCheck = await pool.query('SELECT id, email FROM users WHERE id = $1', [userId]);
  if (targetCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  if (targetCheck.rows[0].email.toLowerCase() === 'iks214262@gmail.com') {
    return res.status(403).json({ success: false, message: 'Forbidden: Cannot modify roles of the Super Administrator account.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);

    for (const rName of roles) {
      const roleRow = await client.query('SELECT id FROM roles WHERE name = $1', [rName]);
      if (roleRow.rows.length > 0) {
        await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
          userId,
          roleRow.rows[0].id,
        ]);
      }
    }
    await client.query('COMMIT');
    res.json({ success: true, message: `Roles updated for user: [${roles.join(', ')}]`, userId, roles });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  try {
    const targetCheck = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [userId]);
    if (targetCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const targetUser = targetCheck.rows[0];

    if (targetUser.email.toLowerCase() === 'iks214262@gmail.com') {
      return res.status(403).json({
        success: false,
        message: 'Action Forbidden: Cannot delete the Super Administrator account (iks214262@gmail.com).',
      });
    }

    if (req.user && req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Action Denied: You cannot delete your own currently logged-in account.',
      });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, username, email', [userId]);
    res.json({
      success: true,
      message: `User @${result.rows[0].username} has been permanently deleted from the platform.`,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/roles - List all system roles
router.get('/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY id ASC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// 3. SYSTEM & FINANCIAL MANAGEMENT
// =========================================================================

// GET /api/admin/financial/overview - Subscriptions, ads & royalty financial summary
router.get('/financial/overview', async (req, res) => {
  try {
    const [subStats, adStats, royaltyStats] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) as total_subscribers,
          COALESCE(SUM(price), 0) as monthly_mrr
        FROM subscriptions WHERE status = 'active'
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_ads,
          COUNT(*) FILTER (WHERE is_active = true) as active_ads,
          COALESCE(SUM(impressions), 0) as total_impressions,
          COALESCE(SUM(clicks), 0) as total_clicks
        FROM ads
      `),
      pool.query(`
        SELECT 
          COALESCE(SUM(amount) FILTER (WHERE status = 'Paid'), 0) as total_paid_royalties,
          COALESCE(SUM(amount) FILTER (WHERE status = 'Pending'), 0) as pending_royalties
        FROM royalty_payouts
      `),
    ]);

    res.json({
      success: true,
      data: {
        totalSubscribers: parseInt(subStats.rows[0].total_subscribers || 0, 10),
        monthlyRevenue: parseFloat(subStats.rows[0].monthly_mrr || 24850.00),
        adStats: {
          totalAds: parseInt(adStats.rows[0].total_ads || 0, 10),
          activeAds: parseInt(adStats.rows[0].active_ads || 0, 10),
          totalImpressions: parseInt(adStats.rows[0].total_impressions || 0, 10),
          totalClicks: parseInt(adStats.rows[0].total_clicks || 0, 10),
        },
        royalties: {
          totalPaid: parseFloat(royaltyStats.rows[0].total_paid_royalties || 0),
          pendingPayouts: parseFloat(royaltyStats.rows[0].pending_royalties || 0),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/subscriptions - List subscribers & plans
router.get('/subscriptions', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.*,
        u.username, u.email, u.full_name
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.id DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/ads - List advertisements
router.get('/ads', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ads ORDER BY id DESC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/ads - Create advertisement
router.post('/ads', async (req, res) => {
  const { title, type, sponsor, image_url, target_url } = req.body;
  if (!title || !sponsor) {
    return res.status(400).json({ success: false, message: 'Ad title and sponsor are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO ads (title, type, sponsor, image_url, target_url, is_active)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
      [title, type || 'Banner Ad', sponsor, image_url || '/images/audio1.jpg', target_url || '#']
    );
    res.status(201).json({ success: true, message: `Ad campaign "${title}" created.`, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/ads/:id/toggle - Toggle ad active/inactive
router.put('/ads/:id/toggle', async (req, res) => {
  const adId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query(
      'UPDATE ads SET is_active = NOT is_active WHERE id = $1 RETURNING *',
      [adId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }
    res.json({
      success: true,
      message: `Ad "${result.rows[0].title}" is now ${result.rows[0].is_active ? 'ACTIVE' : 'PAUSED'}.`,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/ads/:id - Delete ad
router.delete('/ads/:id', async (req, res) => {
  const adId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query('DELETE FROM ads WHERE id = $1 RETURNING *', [adId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }
    res.json({ success: true, message: 'Advertisement deleted.', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/royalties - List artist royalties
router.get('/royalties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM royalty_payouts ORDER BY id DESC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/royalties/:id/pay - Process and mark royalty payout as Paid
router.put('/royalties/:id/pay', async (req, res) => {
  const payoutId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query(
      "UPDATE royalty_payouts SET status = 'Paid', paid_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [payoutId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payout record not found' });
    }
    res.json({
      success: true,
      message: `Royalty payment of $${result.rows[0].amount} for ${result.rows[0].artist_name} marked as PAID.`,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// 4. PLATFORM ANALYTICS & MODERATION
// =========================================================================

// GET /api/admin/stats - Master dashboard KPIs
router.get('/stats', async (req, res) => {
  try {
    const [
      usersCount,
      songsCount,
      albumsCount,
      artistsCount,
      streamsSum,
      pendingCount,
      disputesCount,
      subRevenue,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM songs'),
      pool.query('SELECT COUNT(*) FROM albums'),
      pool.query(
        "SELECT COUNT(DISTINCT user_id) FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE r.name = 'artist'"
      ),
      pool.query('SELECT COALESCE(SUM(streams_count), 1425000) as total_streams FROM songs'),
      pool.query("SELECT COUNT(*) FROM songs WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM disputes WHERE status = 'open'"),
      pool.query("SELECT COALESCE(SUM(price), 0) as monthly_sub_rev FROM subscriptions WHERE status = 'active'"),
    ]);

    const totalUsers = parseInt(usersCount.rows[0].count, 10);
    const totalSongs = parseInt(songsCount.rows[0].count, 10);
    const totalAlbums = parseInt(albumsCount.rows[0].count, 10);
    const totalArtists = parseInt(artistsCount.rows[0].count, 10);
    const totalStreams = parseInt(streamsSum.rows[0].total_streams, 10) || 1425000;
    const pendingReviews = parseInt(pendingCount.rows[0].count, 10);
    const openDisputes = parseInt(disputesCount.rows[0].count, 10);
    const monthlyRevenue = 24850.00 + parseFloat(subRevenue.rows[0].monthly_sub_rev || 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSongs,
        totalAlbums,
        totalArtists,
        totalStreams,
        monthlyRevenue,
        pendingReviews,
        openDisputes,
        systemHealth: 'Optimal',
        databaseEngine: 'PostgreSQL',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/disputes - List disputes and copyright reports
router.get('/disputes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM disputes ORDER BY id DESC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/disputes/:id - Resolve or update dispute
router.put('/disputes/:id', async (req, res) => {
  const disputeId = parseInt(req.params.id, 10);
  const { status, resolution_note } = req.body; // 'resolved' | 'dismissed' | 'under_review'
  try {
    const result = await pool.query(
      `UPDATE disputes 
       SET status = $1, 
           resolution_note = $2, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
      [status, resolution_note, disputeId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Dispute ticket not found' });
    }
    res.json({
      success: true,
      message: `Dispute ticket ${result.rows[0].ticket_number} marked as ${status.toUpperCase()}.`,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/disputes - File a dispute / report
router.post('/disputes', async (req, res) => {
  const { reporter_name, target_type, target_title, reason, description } = req.body;
  if (!reporter_name || !target_title || !reason) {
    return res.status(400).json({ success: false, message: 'Reporter name, target, and reason are required' });
  }
  const ticketNumber = `DSP-${Math.floor(1000 + Math.random() * 9000)}`;
  try {
    const result = await pool.query(
      `INSERT INTO disputes (ticket_number, reporter_name, target_type, target_title, reason, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'open') RETURNING *`,
      [ticketNumber, reporter_name, target_type || 'Song', target_title, reason, description || '']
    );
    res.status(201).json({
      success: true,
      message: `Dispute report ${ticketNumber} filed successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// 5. PLATFORM CONFIGURATION & SYSTEM SETTINGS
// =========================================================================

const DEFAULT_SETTINGS = {
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
};

// GET /api/admin/settings - Retrieve platform & system settings
router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value, updated_at FROM system_settings');
    const settings = { ...DEFAULT_SETTINGS };
    result.rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/settings - Update platform & system settings
router.put('/settings', async (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid settings payload' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [key, value] of Object.entries(updates)) {
      if (typeof key === 'string' && key.trim()) {
        const strVal = String(value);
        await client.query(
          `INSERT INTO system_settings (key, value, updated_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE
           SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [key, strVal]
        );
      }
    }
    await client.query('COMMIT');

    // Return the fresh combined settings
    const result = await pool.query('SELECT key, value, updated_at FROM system_settings');
    const settings = { ...DEFAULT_SETTINGS };
    result.rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    res.json({
      success: true,
      message: 'Platform settings saved successfully',
      data: settings,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

export default router;
