import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { songs, albums, genres, trending } from '../data/musicData.js';

export async function runSeed() {
  console.log('🌱 Seeding database with initial data...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Seed Songs
    const songsCount = await client.query('SELECT COUNT(*) FROM songs');
    if (parseInt(songsCount.rows[0].count, 10) === 0) {
      for (const song of songs) {
        await client.query(
          `INSERT INTO songs (title, artist, album, duration, path, image)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [song.title, song.artist, song.album, song.duration, song.path, song.image]
        );
      }
      console.log(`🎶 Inserted ${songs.length} songs.`);
    } else {
      console.log('ℹ️  Songs table already has data. Skipping songs seed.');
    }

    // 2. Seed Albums
    const albumsCount = await client.query('SELECT COUNT(*) FROM albums');
    if (parseInt(albumsCount.rows[0].count, 10) === 0) {
      for (const album of albums) {
        await client.query(
          `INSERT INTO albums (name, image) VALUES ($1, $2)`,
          [album.name, album.image]
        );
      }
      console.log(`💿 Inserted ${albums.length} albums.`);
    } else {
      console.log('ℹ️  Albums table already has data. Skipping albums seed.');
    }

    // 3. Seed Genres
    const genresCount = await client.query('SELECT COUNT(*) FROM genres');
    if (parseInt(genresCount.rows[0].count, 10) === 0) {
      for (const genre of genres) {
        await client.query(
          `INSERT INTO genres (name, color, col_span) VALUES ($1, $2, $3)
           ON CONFLICT (name) DO NOTHING`,
          [genre.name, genre.color, genre.colSpan]
        );
      }
      console.log(`🎸 Inserted ${genres.length} genres.`);
    } else {
      console.log('ℹ️  Genres table already has data. Skipping genres seed.');
    }

    // 4. Seed Trending
    const trendingCount = await client.query('SELECT COUNT(*) FROM trending');
    if (parseInt(trendingCount.rows[0].count, 10) === 0) {
      await client.query(
        `INSERT INTO trending (type, title, artist, views, curator, avatar, bg_image)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          trending.type,
          trending.title,
          trending.artist,
          trending.views,
          trending.curator,
          trending.avatar,
          trending.bgImage,
        ]
      );
      console.log('🔥 Inserted trending banner item.');
    } else {
      console.log('ℹ️  Trending table already has data. Skipping trending seed.');
    }

    // 5. Seed Playlists
    const playlistsCount = await client.query('SELECT COUNT(*) FROM playlists');
    if (parseInt(playlistsCount.rows[0].count, 10) === 0) {
      const defaultPlaylists = ['English Song', 'Hindi Plays', 'Bangla Songs'];
      for (const name of defaultPlaylists) {
        await client.query('INSERT INTO playlists (name) VALUES ($1)', [name]);
      }
      console.log(`📁 Inserted ${defaultPlaylists.length} playlists.`);
    } else {
      console.log('ℹ️  Playlists table already has data. Skipping playlists seed.');
    }

    // 6. Seed Roles
    const rolesCount = await client.query('SELECT COUNT(*) FROM roles');
    if (parseInt(rolesCount.rows[0].count, 10) === 0) {
      const defaultRoles = [
        { name: 'admin', description: 'Platform Administrator with full access' },
        { name: 'artist', description: 'Music Creator & Artist with catalog management' },
        { name: 'user', description: 'Standard Listener and Streaming User' },
      ];
      for (const role of defaultRoles) {
        await client.query(
          'INSERT INTO roles (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
          [role.name, role.description]
        );
      }
      console.log(`🛡️  Inserted ${defaultRoles.length} system roles.`);
    } else {
      console.log('ℹ️  Roles table already has data. Skipping roles seed.');
    }

    // 7. Seed Users & User Roles
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersCount.rows[0].count, 10) === 0) {
      // 1. Create Super Administrator User (iks214262@gmail.com / 12345678)
      const superAdminPasswordHash = bcrypt.hashSync('12345678', 10);
      const superAdminRes = await client.query(
        `INSERT INTO users (username, email, password_hash, full_name, avatar, bio)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          'superadmin',
          'iks214262@gmail.com',
          superAdminPasswordHash,
          'Super Administrator',
          '/images/avatar.jpg',
          'Platform Super Administrator with complete system governance and user management authority.',
        ]
      );
      const superAdminUserId = superAdminRes.rows[0].id;

      // 2. Create Standard Platform Administrator User (Controls all users & platform)
      const adminPasswordHash = bcrypt.hashSync('123', 10);
      const adminRes = await client.query(
        `INSERT INTO users (username, email, password_hash, full_name, avatar, bio)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          'admin',
          'admin@soundfly.com',
          adminPasswordHash,
          'Platform Administrator',
          '/images/avatar.jpg',
          'System administrator with platform oversight and user governance.',
        ]
      );
      const adminUserId = adminRes.rows[0].id;

      // 3. Create Dedicated Artist User (Controls only artist routes & music)
      const artistPasswordHash = bcrypt.hashSync('123', 10);
      const artistRes = await client.query(
        `INSERT INTO users (username, email, password_hash, full_name, avatar, bio)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          'rahman',
          'rahman@soundfly.com',
          artistPasswordHash,
          'Rahman Nayan',
          '/images/avatar.jpg',
          'Music producer and verified recording artist.',
        ]
      );
      const artistUserId = artistRes.rows[0].id;

      // 4. Create Dedicated Regular Listener User (User role only)
      const userPasswordHash = bcrypt.hashSync('123', 10);
      const userRes = await client.query(
        `INSERT INTO users (username, email, password_hash, full_name, avatar, bio)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          'listener1',
          'listener@soundfly.com',
          userPasswordHash,
          'Music Listener',
          '/images/avatar.jpg',
          'Passionate music enthusiast.',
        ]
      );
      const normalUserId = userRes.rows[0].id;

      // Fetch role IDs
      const rolesRes = await client.query('SELECT id, name FROM roles');
      const roleMap = {};
      rolesRes.rows.forEach((r) => {
        roleMap[r.name] = r.id;
      });

      // Assign admin role to Super Admin
      if (roleMap.admin) {
        await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
          superAdminUserId,
          roleMap.admin,
        ]);
        await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
          adminUserId,
          roleMap.admin,
        ]);
      }

      // Assign artist role ONLY to Rahman user
      if (roleMap.artist) {
        await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
          artistUserId,
          roleMap.artist,
        ]);
      }

      // Assign user role to normal listener user
      if (roleMap.user) {
        await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [
          normalUserId,
          roleMap.user,
        ]);
      }

      console.log('👤 Inserted separated users (superadmin, admin, artist, user) and assigned distinct roles.');
    } else {
      console.log('ℹ️  Users table already has data. Skipping users seed.');
    }

    await client.query('COMMIT');
    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run directly if called as a script
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
