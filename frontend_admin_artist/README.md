# SoundFly - Admin & Artist Dashboard

Modern administrative and artist portal for the **SoundFly** music platform, built with **React 19**, **Vite**, and **Chart.js**.

## Features

- **Dashboard Overview**:
  - Live metric cards (Catalog Tracks, Total Plays, Published Albums, Active Genres).
  - Interactive Chart.js visualizations (Streaming Growth line chart, Genre distribution doughnut chart).
  - Quick upload shortcut and status indicators.
- **Track & Catalog Manager**:
  - Full CRUD integration with the PostgreSQL backend API (`http://localhost:5001/api/songs`).
  - Search and filter tracks by title, artist, or album.
  - Built-in audio preview player to listen to tracks directly in the table.
  - Add & Edit track modal with validation.
  - Delete track with confirmation.
- **Albums & Releases**:
  - Manage albums, EPs, and cover artwork.
  - Create and delete albums directly via PostgreSQL backend API.
- **Genres & Categories**:
  - Review genre badges, color codes, and discovery tagging.
- **Artist Profile & Bio**:
  - Verified artist badge, biography editor, global ranking, monthly listeners, and connected streaming platforms.
- **System & Settings**:
  - Real-time connection tester to backend and PostgreSQL.

## Getting Started

### Development Server
```bash
npm run dev
# or
npm start
```
Runs at `http://localhost:4000`.

### Production Build
```bash
npm run build
```

Preview the build:
```bash
npm run preview
```
