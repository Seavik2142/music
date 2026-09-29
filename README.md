# SoundFly - Fullstack Music Platform

SoundFly is a modern fullstack music platform featuring user and admin/artist web applications powered by a centralized Node.js/Express and PostgreSQL backend.

## Project Structure

```text
music_song/
├── frontend_user/          # User Streaming Web App (React 19 + Vite)
│   ├── public/             # Static audio & images
│   ├── src/                # Audio player, playlist, trending, albums, genres
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── frontend_admin_artist/  # Admin & Artist Dashboard (React 19 + Vite + Chart.js)
│   ├── public/             # Artwork & assets
│   ├── src/                # Track CRUD, Chart.js analytics, albums, artist profile
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── backend/                # REST API Server (Node.js + Express + PostgreSQL)
    ├── src/
    │   ├── config/db.js    # PostgreSQL pool & connection
    │   ├── middleware/
    │   │   └── auth.js          # Shared JWT auth & RBAC requireRole middleware
    │   ├── migrations/     # Database migration & seed scripts
    │   ├── routes/
    │   │   ├── authRoutes.js    # /api/auth - Shared login, register, & verify
    │   │   ├── adminRoutes.js   # /api/admin - Protected [admin] oversight
    │   │   ├── artistRoutes.js  # /api/artist - Protected [artist] studio
    │   │   └── musicRoutes.js   # /api - Public catalog & streaming routes
    │   └── server.js       # Express server entry point
    ├── .env
    ├── package.json
    └── README.md
```

## Quick Start

### 1. Backend Server (Port 5001)
```bash
cd backend
npm install
npm run db:setup    # Runs migrations and seeds PostgreSQL
npm run dev         # Starts server on http://localhost:5001
```

### 2. User Frontend (Port 3000)
```bash
cd frontend_user
npm install
npm run dev         # Starts user app on http://localhost:3000
```

### 3. Admin / Artist Frontend (Port 4000)
```bash
cd frontend_admin_artist
npm install
npm run dev         # Starts dashboard on http://localhost:4000
```
# music
