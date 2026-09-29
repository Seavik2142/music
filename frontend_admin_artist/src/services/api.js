const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Token Storage Helpers
export function getAuthToken() {
  return localStorage.getItem('soundfly_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('soundfly_token', token);
  } else {
    localStorage.removeItem('soundfly_token');
  }
}

export function removeAuthToken() {
  localStorage.removeItem('soundfly_token');
}

// Request helper that automatically attaches Bearer token
async function authFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }

  return data;
}

// ==========================================
// 🔐 SHARED AUTHENTICATION SERVICE (/api/auth)
// ==========================================

export async function loginUser(emailOrUsername, password = '123') {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const data = await authFetch('/api/auth/me');
    return data?.user || null;
  } catch (err) {
    removeAuthToken();
    return null;
  }
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

// ==========================================
// 🎨 DISTINCT ARTIST API SERVICE (/api/artist)
// Requires [artist] role
// ==========================================

export async function getSongs() {
  const data = await authFetch('/api/artist/songs');
  return data.data || [];
}

export async function addSong(songData) {
  return await authFetch('/api/artist/songs', {
    method: 'POST',
    body: JSON.stringify(songData),
  });
}

export async function updateSong(id, songData) {
  return await authFetch(`/api/artist/songs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(songData),
  });
}

export async function deleteSong(id) {
  return await authFetch(`/api/artist/songs/${id}`, {
    method: 'DELETE',
  });
}

export async function getAlbums() {
  const data = await authFetch('/api/artist/albums');
  return data.data || [];
}

export async function addAlbum(albumData) {
  return await authFetch('/api/artist/albums', {
    method: 'POST',
    body: JSON.stringify(albumData),
  });
}

export async function deleteAlbum(id) {
  return await authFetch(`/api/artist/albums/${id}`, {
    method: 'DELETE',
  });
}

export async function getArtistProfile() {
  const data = await authFetch('/api/artist/profile');
  return data.data || null;
}

export async function updateArtistProfile(profileData) {
  return await authFetch('/api/artist/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

export async function getArtistStats() {
  const data = await authFetch('/api/artist/stats');
  return data.data || null;
}

// ==========================================
// 🛡️ DISTINCT ADMIN API SERVICE (/api/admin)
// Requires [admin] role
// ==========================================

export async function getUsers() {
  const data = await authFetch('/api/admin/users');
  return data.data || [];
}

export async function createAdminUser(userData) {
  return await authFetch('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function updateUserStatus(userId, isActive, reason = '') {
  return await authFetch(`/api/admin/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ is_active: isActive, suspension_reason: reason }),
  });
}

export async function updateUserRoles(userId, roles) {
  return await authFetch(`/api/admin/users/${userId}/roles`, {
    method: 'PUT',
    body: JSON.stringify({ roles }),
  });
}

export async function verifyArtistStatus(userId, isVerified) {
  return await authFetch(`/api/admin/users/${userId}/verify-artist`, {
    method: 'PUT',
    body: JSON.stringify({ is_verified_artist: isVerified }),
  });
}

export async function deleteUser(userId) {
  return await authFetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function getRoles() {
  const data = await authFetch('/api/admin/roles');
  return data.data || [];
}

export async function getAdminStats() {
  const data = await authFetch('/api/admin/stats');
  return data.data || null;
}

export async function getAdminSongs() {
  const data = await authFetch('/api/admin/songs');
  return data.data || [];
}

export async function getPendingContent() {
  const data = await authFetch('/api/admin/content/pending');
  return data.data || { songs: [], albums: [] };
}

export async function updateSongApproval(songId, status, reason = '') {
  return await authFetch(`/api/admin/songs/${songId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, reason }),
  });
}

export async function toggleSongPlayback(songId, isEnabled) {
  return await authFetch(`/api/admin/songs/${songId}/toggle-playback`, {
    method: 'PUT',
    body: JSON.stringify({ is_enabled: isEnabled }),
  });
}

export async function adminDeleteSong(songId) {
  return await authFetch(`/api/admin/songs/${songId}`, {
    method: 'DELETE',
  });
}

export async function getAdminGenres() {
  const data = await authFetch('/api/admin/genres');
  return data.data || [];
}

export async function createAdminGenre(genreData) {
  return await authFetch('/api/admin/genres', {
    method: 'POST',
    body: JSON.stringify(genreData),
  });
}

export async function updateAdminGenre(genreId, genreData) {
  return await authFetch(`/api/admin/genres/${genreId}`, {
    method: 'PUT',
    body: JSON.stringify(genreData),
  });
}

export async function deleteAdminGenre(genreId) {
  return await authFetch(`/api/admin/genres/${genreId}`, {
    method: 'DELETE',
  });
}

export async function getFinancialOverview() {
  const data = await authFetch('/api/admin/financial/overview');
  return data.data || null;
}

export async function getSubscriptions() {
  const data = await authFetch('/api/admin/subscriptions');
  return data.data || [];
}

export async function getAds() {
  const data = await authFetch('/api/admin/ads');
  return data.data || [];
}

export async function createAd(adData) {
  return await authFetch('/api/admin/ads', {
    method: 'POST',
    body: JSON.stringify(adData),
  });
}

export async function toggleAd(adId) {
  return await authFetch(`/api/admin/ads/${adId}/toggle`, {
    method: 'PUT',
  });
}

export async function deleteAd(adId) {
  return await authFetch(`/api/admin/ads/${adId}`, {
    method: 'DELETE',
  });
}

export async function getRoyalties() {
  const data = await authFetch('/api/admin/royalties');
  return data.data || [];
}

export async function processRoyaltyPayout(payoutId) {
  return await authFetch(`/api/admin/royalties/${payoutId}/pay`, {
    method: 'PUT',
  });
}

export async function getDisputes() {
  const data = await authFetch('/api/admin/disputes');
  return data.data || [];
}

export async function updateDisputeStatus(disputeId, status, resolutionNote = '') {
  return await authFetch(`/api/admin/disputes/${disputeId}`, {
    method: 'PUT',
    body: JSON.stringify({ status, resolution_note: resolutionNote }),
  });
}

export async function createDisputeTicket(ticketData) {
  return await authFetch('/api/admin/disputes', {
    method: 'POST',
    body: JSON.stringify(ticketData),
  });
}

// ==========================================
// ⚙️ ADMIN PROFILE & PLATFORM SETTINGS
// ==========================================

export async function updateAdminProfile(profileData) {
  const data = await authFetch('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  if (data?.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function changeAdminPassword(passwordData) {
  return await authFetch('/api/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  });
}

export async function updateUserCredentials(userId, credentials) {
  return await authFetch(`/api/admin/users/${userId}/credentials`, {
    method: 'PUT',
    body: JSON.stringify(credentials),
  });
}

export async function getSystemSettings() {
  const data = await authFetch('/api/admin/settings');
  return data.data || {};
}

export async function updateSystemSettings(settingsData) {
  return await authFetch('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  });
}

// ==========================================
// 🌐 PUBLIC / SHARED SERVICE
// ==========================================

export async function getGenres() {
  const res = await fetch(`${API_BASE_URL}/api/genres`);
  if (!res.ok) throw new Error('Failed to fetch genres');
  const data = await res.json();
  return data.data || [];
}
