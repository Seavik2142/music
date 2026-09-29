# SoundFly - React Music Player

A modern music streaming dashboard and audio player built with **React 19** and **Vite**.

## Features
- **Dynamic Audio Player**:
  - Live track progress bar / seekbar with elapsed and total duration.
  - Controls: Previous, Play / Pause, Next, Volume slider, Mute/Unmute toggle.
  - Automatic playback of the next song when current track ends.
  - Dynamic song title, album, and artist metadata display.
- **Interactive Song List**:
  - Click any song in the "Top Songs" list to play it immediately.
  - Active track indicator with animated/styled highlight.
- **Trending Banner**:
  - Direct "Play Now" action button.
- **Top Albums & Genres**:
  - Responsive album cards and colorful genre tags.
- **Sidebar Navigation**:
  - Interactive navigation tabs with active state management.
- **Modern Responsive Layout**:
  - Flexbox and Grid layouts optimized for desktop, tablet, and mobile.

## Project Structure
```text
music_song/
├── public/                 # Static assets (images, mp3 songs)
│   ├── images/
│   └── songs/
├── src/
│   ├── components/         # Modular React components
│   │   ├── AudioPlayer.jsx
│   │   ├── GenresTable.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TopAlbums.jsx
│   │   ├── TopSongs.jsx
│   │   └── TrendingBanner.jsx
│   ├── data/
│   │   └── musicData.js    # Songs, albums, genres, and trending metadata
│   ├── App.jsx             # Main stateful component
│   ├── App.css             # Component styling
│   ├── index.css           # Global theme & CSS variables
│   └── main.jsx            # React root mount
├── index.html              # Vite HTML template
├── package.json
└── vite.config.js
```

## Getting Started

### Development Server
Run the local dev server:
```bash
npm run dev
```

### Production Build
Build for production:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```