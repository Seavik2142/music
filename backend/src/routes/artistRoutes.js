import { Router } from 'express';
import { pool } from '../config/db.js';
import { songs as staticSongs, albums as staticAlbums } from '../data/musicData.js';

const router = Router();

// ==========================================
// ARTIST: SONGS & TRACK MANAGEMENT
// ==========================================

// GET /api/artist/songs - Get tracks belonging to artist
router.get('/songs', async (req, res) => {
  const artistName = req.query.artist;
  try {
    let query = 'SELECT * FROM songs';
    const params = [];
    if (artistName) {
      query += ' WHERE artist ILIKE $1';
      params.push(`%${artistName}%`);
    }
    query += ' ORDER BY id DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.warn('Artist songs query fallback:', error.message);
    res.json({ success: true, count: staticSongs.length, data: staticSongs });
  }
});

// POST /api/artist/songs - Upload / release a new track
router.post('/songs', async (req, res) => {
  const { title, artist, album, duration, path, image } = req.body;
  if (!title || !artist) {
    return res.status(400).json({ success: false, message: 'Track title and artist are required' });
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
    res.status(201).json({
      success: true,
      message: 'Track published successfully by artist',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/artist/songs/:id - Update artist track metadata
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
      return res.status(404).json({ success: false, message: 'Track not found' });
    }
    res.json({ success: true, message: 'Track updated successfully', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/artist/songs/:id - Delete artist track
router.delete('/songs/:id', async (req, res) => {
  const songId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query('DELETE FROM songs WHERE id = $1 RETURNING *', [songId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }
    res.json({ success: true, message: 'Track deleted from catalog', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// ARTIST: ALBUMS MANAGEMENT
// ==========================================

// GET /api/artist/albums - Get albums
router.get('/albums', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM albums ORDER BY id DESC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.json({ success: true, count: staticAlbums.length, data: staticAlbums });
  }
});

// POST /api/artist/albums - Create a new album/EP
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
    res.status(201).json({ success: true, message: 'Album created', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/artist/albums/:id - Delete album
router.delete('/albums/:id', async (req, res) => {
  const albumId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query('DELETE FROM albums WHERE id = $1 RETURNING *', [albumId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Album not found' });
    }
    res.json({ success: true, message: 'Album removed', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// ARTIST: PROFILE & ANALYTICS
// ==========================================

// GET /api/artist/profile
router.get('/profile', async (req, res) => {
  try {
    // Look up artist profile from users with 'artist' role
    const query = `
      SELECT u.id, u.username, u.full_name, u.email, u.avatar, u.bio, u.created_at
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name = 'artist'
      LIMIT 1
    `;
    const result = await pool.query(query);
    if (result.rows.length > 0) {
      const u = result.rows[0];
      return res.json({
        success: true,
        data: {
          id: u.id,
          name: u.full_name,
          username: u.username,
          bio: u.bio,
          location: 'Jakarta, Indonesia',
          monthlyListeners: '7.34M',
          followers: '452K',
          avatar: u.avatar || '/images/avatar.jpg',
          banner: '/images/layout.jpg',
        },
      });
    }
    res.json({
      success: true,
      data: {
        name: 'Rahman Nayan',
        username: 'rahmandev',
        bio: 'Music producer and electronic pop artist.',
        location: 'Jakarta, Indonesia',
        monthlyListeners: '7.34M',
        followers: '452K',
        avatar: '/images/avatar.jpg',
        banner: '/images/layout.jpg',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/artist/profile - Update bio and info
router.put('/profile', async (req, res) => {
  const { full_name, bio, location } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           bio = COALESCE($2, bio),
           updated_at = CURRENT_TIMESTAMP
       WHERE id IN (
         SELECT u.id FROM users u
         JOIN user_roles ur ON u.id = ur.user_id
         JOIN roles r ON ur.role_id = r.id
         WHERE r.name = 'artist' LIMIT 1
       )
       RETURNING id, username, full_name, bio`,
      [full_name, bio]
    );
    res.json({ success: true, message: 'Artist profile updated', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/artist/stats - Stream performance metrics
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalStreams: '7,342,100',
      monthlyGrowth: '+14.2%',
      topTrack: 'Eleven',
      topCountries: ['Indonesia', 'United States', 'Japan', 'United Kingdom'],
      streamsHistory: [
        { month: 'Apr', streams: 3.8 },
        { month: 'May', streams: 4.4 },
        { month: 'Jun', streams: 5.1 },
        { month: 'Jul', streams: 5.9 },
        { month: 'Aug', streams: 6.7 },
        { month: 'Sep', streams: 7.34 },
      ],
    },
  });
});

export default router;
