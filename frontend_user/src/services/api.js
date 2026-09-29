const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export async function fetchSongs() {
  const res = await fetch(`${API_BASE_URL}/api/songs`);
  if (!res.ok) throw new Error('Failed to fetch songs from backend');
  const data = await res.json();
  return data.data || [];
}

export async function fetchAlbums() {
  const res = await fetch(`${API_BASE_URL}/api/albums`);
  if (!res.ok) throw new Error('Failed to fetch albums');
  const data = await res.json();
  return data.data || [];
}

export async function fetchGenres() {
  const res = await fetch(`${API_BASE_URL}/api/genres`);
  if (!res.ok) throw new Error('Failed to fetch genres');
  const data = await res.json();
  return data.data || [];
}

export async function fetchTrending() {
  const res = await fetch(`${API_BASE_URL}/api/trending`);
  if (!res.ok) throw new Error('Failed to fetch trending');
  const data = await res.json();
  return data.data || null;
}

export async function fetchPlaylists() {
  const res = await fetch(`${API_BASE_URL}/api/playlists`);
  if (!res.ok) throw new Error('Failed to fetch playlists');
  const data = await res.json();
  return data.data || [];
}
