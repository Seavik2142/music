# SoundFly Backend API

Express.js REST API server for the SoundFly music player application.

## Endpoints Overview

### 1. 🎧 Public / Listener Endpoints (`/api`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health status check |
| `GET` | `/api/songs` | Get all catalog songs |
| `GET` | `/api/songs/:id` | Get single song details |
| `GET` | `/api/albums` | Get top albums |
| `GET` | `/api/genres` | Get music genres |
| `GET` | `/api/trending` | Get trending track data |
| `GET` | `/api/playlists` | Get featured playlists |

### 2. 🎨 Artist Endpoints (`/api/artist`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/artist/songs` | Get artist's tracks |
| `POST` | `/api/artist/songs` | Upload / publish a new track |
| `PUT` | `/api/artist/songs/:id` | Update track metadata |
| `DELETE` | `/api/artist/songs/:id` | Delete artist's track |
| `GET` | `/api/artist/albums` | Get artist's albums |
| `POST` | `/api/artist/albums` | Create a new album |
| `DELETE` | `/api/artist/albums/:id` | Delete an album |
| `GET` | `/api/artist/profile` | Get artist profile & bio |
| `PUT` | `/api/artist/profile` | Update artist profile |
| `GET` | `/api/artist/stats` | Stream performance & listening history |

### 3. 🛡️ Admin Endpoints (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/users` | List all users with aggregated roles |
| `POST` | `/api/admin/users` | Create user and assign roles |
| `PUT` | `/api/admin/users/:id/status` | Toggle user active/suspended status |
| `PUT` | `/api/admin/users/:id/roles` | Assign or update user roles |
| `DELETE` | `/api/admin/users/:id` | Delete a user account |
| `GET` | `/api/admin/roles` | Get all system roles |
| `GET` | `/api/admin/stats` | Global platform metrics |
| `DELETE` | `/api/admin/songs/:id` | Administrative moderation track removal |

## Getting Started

### Installation
```bash
npm install
```

### Run Server in Development Mode
```bash
npm run dev
```

### Run Server in Production
```bash
npm start
```

Default server port: `5001`.

## Database Migrations & Seeding

Run database migrations to create all required tables:
```bash
npm run migrate
```

Seed initial data (songs, albums, genres, trending, playlists):
```bash
npm run seed
```

Or run both together:
```bash
npm run db:setup
```
