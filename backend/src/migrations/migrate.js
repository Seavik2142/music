import { pool } from '../config/db.js';

const createTablesQuery = `
-- ==========================================
-- 1. Music Platform Catalog Tables
-- ==========================================

-- Songs Table
CREATE TABLE IF NOT EXISTS songs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  album VARCHAR(255),
  duration VARCHAR(50),
  path VARCHAR(500) NOT NULL,
  image VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Albums Table
CREATE TABLE IF NOT EXISTS albums (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  image VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Genres Table
CREATE TABLE IF NOT EXISTS genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(50) NOT NULL,
  col_span VARCHAR(10) DEFAULT '1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trending Table
CREATE TABLE IF NOT EXISTS trending (
  id SERIAL PRIMARY KEY,
  type VARCHAR(100) DEFAULT 'Trending',
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  views VARCHAR(100),
  curator VARCHAR(255),
  avatar VARCHAR(500),
  bg_image VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Playlists Table
CREATE TABLE IF NOT EXISTS playlists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. User & Authentication Role-Based Tables
-- ==========================================

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar VARCHAR(500),
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified_artist BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Roles Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_name VARCHAR(100) NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'active',
  billing_cycle VARCHAR(50) DEFAULT 'Monthly',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

-- Advertisements Table
CREATE TABLE IF NOT EXISTS ads (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'Banner Ad',
  sponsor VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  target_url VARCHAR(500),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Royalty Payouts Table
CREATE TABLE IF NOT EXISTS royalty_payouts (
  id SERIAL PRIMARY KEY,
  artist_name VARCHAR(255) NOT NULL,
  streams_counted INTEGER DEFAULT 0,
  rate_per_stream NUMERIC(8,4) DEFAULT 0.0040,
  amount NUMERIC(10,2) NOT NULL,
  period VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Disputes & Reports Table
CREATE TABLE IF NOT EXISTS disputes (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  reporter_name VARCHAR(255) NOT NULL,
  target_type VARCHAR(50) NOT NULL DEFAULT 'Song',
  target_title VARCHAR(255) NOT NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  resolution_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Safe Column Alterations on existing tables
ALTER TABLE songs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'approved';
ALTER TABLE songs ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS streams_count INTEGER DEFAULT 14250;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'approved';
ALTER TABLE albums ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified_artist BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_songs_status ON songs(status);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
`;

export async function runMigration() {
  console.log('🚀 Running database migrations...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(createTablesQuery);
    await client.query('COMMIT');
    console.log('✅ Migrations completed successfully! All tables created.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run directly if called as a script
if (process.argv[1]?.endsWith('migrate.js')) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
