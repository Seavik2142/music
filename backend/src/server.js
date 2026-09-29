import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import artistRoutes from './routes/artistRoutes.js';
import musicRoutes from './routes/musicRoutes.js';
import { authenticate, requireRole } from './middleware/auth.js';
import { testDbConnection } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// 1. 🔐 UNIFIED AUTHENTICATION ROUTE
// ==========================================
// Shared authentication system for both Admin & Artist (login, register, token verification)
app.use('/api/auth', authRoutes);

// ==========================================
// 2. 🛡️ DISTINCT ADMIN ROUTES (/api/admin)
// ==========================================
// Protected: Requires valid authentication AND 'admin' role
app.use('/api/admin', authenticate, requireRole('admin'), adminRoutes);

// ==========================================
// 3. 🎨 DISTINCT ARTIST ROUTES (/api/artist)
// ==========================================
// Protected: Requires valid authentication AND 'artist' role
app.use('/api/artist', authenticate, requireRole('artist'), artistRoutes);

// ==========================================
// 4. 🎧 PUBLIC CATALOG & STREAMING (/api)
// ==========================================
// Open access for listeners & frontend_user streaming
app.use('/api', musicRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🎵 SoundFly Backend Server running on http://localhost:${PORT}`);
  console.log(`🔐 Unified Auth Routes:     http://localhost:${PORT}/api/auth`);
  console.log(`🛡️  Distinct Admin Routes:   http://localhost:${PORT}/api/admin (Requires [admin] role)`);
  console.log(`🎨 Distinct Artist Routes:  http://localhost:${PORT}/api/artist (Requires [artist] role)`);
  console.log(`🎧 Public Routes:           http://localhost:${PORT}/api`);
  await testDbConnection();
});
