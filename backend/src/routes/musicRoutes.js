import { Router } from 'express';
import { pool } from '../config/db.js';
import {
  songs as staticSongs,
  albums as staticAlbums,
  genres as staticGenres,
  trending as staticTrending,
} from '../data/musicData.js';

const router = Router();

// ==================== SONGS ROUTES ====================

// GET all songs from PostgreSQL (fallback to static)
router.get('/songs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM songs ORDER BY id ASC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.warn('Database query failed, using static data:', error.message);
    res.json({ success: true, count: staticSongs.length, data: staticSongs });
  }
});

// GET single song by ID
router.get('/songs/:id', async (req, res) => {
  const songId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query('SELECT * FROM songs WHERE id = $1', [songId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.warn('Database query failed, using static data:', error.message);
    const song = staticSongs.find((s) => s.id === songId);
    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }
    res.json({ success: true, data: song });
  }
});

// POST create new song (CRUD for Admin/Artist)
router.post('/songs', async (req, res) => {
  const { title, artist, album, duration, path, image } = req.body;
  if (!title || !artist) {
    return res.status(400).json({ success: false, message: 'Title and artist are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO songs (title, artist, album, duration, path, image)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        title,
        artist,
        album || 'Single',
        duration || '3:30',
        path || '/songs/love-like-this.mp3',
        image || '/images/audio1.jpg',
      ]
    );
    res.status(201).json({ success: true, message: 'Song created successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating song:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update song (CRUD for Admin/Artist)
router.put('/songs/:id', async (req, res) => {
  const songId = parseInt(req.params.id, 10);
  const { title, artist, album, duration, path, image } = req.body;
  try {
    const result = await pool.query(
      `UPDATE songs
       SET title = COALESCE($1, title),
           artist = COALESCE($2, artist),
           album = COALESCE($3, album),
           duration = COALESCE($4, duration),
           path = COALESCE($5, path),
           image = COALESCE($6, image)
       WHERE id = $7 RETURNING *`,
      [title, artist, album, duration, path, image, songId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }
    res.json({ success: true, message: 'Song updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating song:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE song (CRUD for Admin/Artist)
router.delete('/songs/:id', async (req, res) => {
  const songId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query('DELETE FROM songs WHERE id = $1 RETURNING *', [songId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }
    res.json({ success: true, message: 'Song deleted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting song:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ALBUMS ROUTES ====================

// GET all albums
router.get('/albums', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM albums ORDER BY id ASC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.warn('Database query failed, using static data:', error.message);
    res.json({ success: true, count: staticAlbums.length, data: staticAlbums });
  }
});

// POST create album
router.post('/albums', async (req, res) => {
  const { name, artist, image } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Album name is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO albums (name, artist, image) VALUES ($1, $2, $3) RETURNING *',
      [name, artist || 'SoundFly Artist', image || '/images/top-album1.jpg']
    );
    res.status(201).json({ success: true, message: 'Album created successfully', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE album
router.delete('/albums/:id', async (req, res) => {
  const albumId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query('DELETE FROM albums WHERE id = $1 RETURNING *', [albumId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Album not found' });
    }
    res.json({ success: true, message: 'Album deleted successfully', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GENRES & OTHER ROUTES ====================

// GET all genres
router.get('/genres', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM genres ORDER BY id ASC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.warn('Database query failed, using static data:', error.message);
    res.json({ success: true, count: staticGenres.length, data: staticGenres });
  }
});

// GET trending track
router.get('/trending', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trending ORDER BY id ASC LIMIT 1');
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return res.json({
        success: true,
        data: {
          type: row.type,
          title: row.title,
          artist: row.artist,
          views: row.views,
          curator: row.curator,
          avatar: row.avatar,
          bgImage: row.bg_image,
        },
      });
    }
    res.json({ success: true, data: staticTrending });
  } catch (error) {
    res.json({ success: true, data: staticTrending });
  }
});

// GET playlists
router.get('/playlists', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM playlists ORDER BY id ASC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.json({
      success: true,
      data: [{ name: 'English Song' }, { name: 'Hindi Plays' }, { name: 'Bangla Songs' }],
    });
  }
});

// ==================== USERS & ROLES ROUTES ====================

// GET all users with their assigned roles
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
        u.created_at,
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

// GET all available roles
router.get('/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY id ASC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
