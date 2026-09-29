import React, { useState, useEffect } from 'react';
import AdminSidebar from './components/AdminSidebar';
import ArtistSidebar from './components/ArtistSidebar';
import Navbar from './components/Navbar';
import StatCards from './components/StatCards';
import ChartsSection from './components/ChartsSection';
import SongsTable from './components/SongsTable';
import AlbumsView from './components/AlbumsView';
import ArtistProfileView from './components/ArtistProfileView';
import AdminOverview from './components/AdminOverview';
import ContentManagementView from './components/ContentManagementView';
import UsersView from './components/UsersView';
import FinancialManagementView from './components/FinancialManagementView';
import DisputesView from './components/DisputesView';
import AdminProfileSettingsView from './components/AdminProfileSettingsView';
import SongModal from './components/SongModal';
import CreateUserModal from './components/CreateUserModal';
import AccessDenied from './components/AccessDenied';
import AuthLoginForm from './components/AuthLoginForm';
import {
  checkBackendHealth,
  loginUser,
  getCurrentUser,
  getAuthToken,
  getSongs,
  addSong,
  updateSong,
  deleteSong,
  getAlbums,
  addAlbum,
  deleteAlbum,
  getGenres,
  getUsers,
  createAdminUser,
  deleteUser,
  getRoles,
  adminDeleteSong,
  removeAuthToken,
  getPendingContent,
  updateSongApproval,
  toggleSongPlayback,
  createAdminGenre,
  deleteAdminGenre,
  updateUserStatus,
  updateUserRoles,
  verifyArtistStatus,
  getFinancialOverview,
  getSubscriptions,
  getAds,
  createAd,
  toggleAd,
  deleteAd,
  getRoyalties,
  processRoyaltyPayout,
  getDisputes,
  updateDisputeStatus,
  createDisputeTicket,
} from './services/api';
import './App.css';

export default function App() {
  const [currentTab, setCurrentTab] = useState('artist-dashboard');
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [genres, setGenres] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pendingSongs, setPendingSongs] = useState([]);
  const [financialOverview, setFinancialOverview] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [ads, setAds] = useState([]);
  const [royalties, setRoyalties] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [backendStatus, setBackendStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Shared Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Modal & Preview state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [activePreview, setActivePreview] = useState(null);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    const health = await checkBackendHealth();
    setBackendStatus(health.connected);

    try {
      const [
        fetchedSongs,
        fetchedAlbums,
        fetchedGenres,
        fetchedUsers,
        fetchedRoles,
        pendingContent,
        finOverview,
        fetchedSubs,
        fetchedAds,
        fetchedRoyalties,
        fetchedDisputes,
      ] = await Promise.all([
        getSongs().catch(() => []),
        getAlbums().catch(() => []),
        getGenres().catch(() => []),
        getUsers().catch(() => []),
        getRoles().catch(() => []),
        getPendingContent().catch(() => ({ songs: [], albums: [] })),
        getFinancialOverview().catch(() => null),
        getSubscriptions().catch(() => []),
        getAds().catch(() => []),
        getRoyalties().catch(() => []),
        getDisputes().catch(() => []),
      ]);

      setSongs(fetchedSongs);
      setAlbums(fetchedAlbums);
      setGenres(fetchedGenres);
      setUsers(fetchedUsers);
      setRoles(fetchedRoles);
      setPendingSongs(pendingContent.songs || []);
      setFinancialOverview(finOverview);
      setSubscriptions(fetchedSubs);
      setAds(fetchedAds);
      setRoyalties(fetchedRoyalties);
      setDisputes(fetchedDisputes);
    } catch (err) {
      console.warn('Data load note:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const health = await checkBackendHealth();
        setBackendStatus(health.connected);

        const token = getAuthToken();
        if (token) {
          const user = await getCurrentUser();
          if (user) {
            setCurrentUser(user);
            const userRoles = user.roles || [];
            if (userRoles.includes('admin')) {
              setCurrentTab('admin-dashboard');
            } else {
              setCurrentTab('artist-dashboard');
            }
            await loadData();
          } else {
            removeAuthToken();
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.warn('Initial session check note:', err.message);
      } finally {
        setIsAuthChecking(false);
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleLogin = async (usernameOrEmail, password) => {
    const res = await loginUser(usernameOrEmail, password);
    if (res.user) {
      setCurrentUser(res.user);
      const userRoles = res.user.roles || [];
      showToast(`Welcome, ${res.user.full_name || res.user.username}!`);

      // Auto-route based on the user's role:
      if (userRoles.includes('admin')) {
        setCurrentTab('admin-dashboard');
      } else if (userRoles.includes('artist')) {
        setCurrentTab('artist-dashboard');
      }

      // Reload data under the new role permissions
      await loadData();
    }
    return res;
  };

  // ==========================================
  // 1. CONTENT & MUSIC MANAGEMENT HANDLERS
  // ==========================================
  const handleApproveSong = async (songId) => {
    try {
      await updateSongApproval(songId, 'approved');
      setPendingSongs((prev) => prev.filter((s) => s.id !== songId));
      setSongs((prev) =>
        prev.map((s) => (s.id === songId ? { ...s, status: 'approved' } : s))
      );
      showToast('Track approved & verified. Published to live catalog.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRejectSong = async (songId, reason) => {
    try {
      await updateSongApproval(songId, 'rejected', reason);
      setPendingSongs((prev) => prev.filter((s) => s.id !== songId));
      setSongs((prev) =>
        prev.map((s) => (s.id === songId ? { ...s, status: 'rejected' } : s))
      );
      showToast(`Track rejected: ${reason}`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleTogglePlayback = async (songId, isEnabled) => {
    try {
      await toggleSongPlayback(songId, isEnabled);
      setSongs((prev) =>
        prev.map((s) => (s.id === songId ? { ...s, is_enabled: isEnabled } : s))
      );
      showToast(`Playback ${isEnabled ? 'enabled' : 'disabled platform-wide'}.`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddGenre = async (genreData) => {
    try {
      const res = await createAdminGenre(genreData);
      if (res.data) {
        setGenres((prev) => [...prev, res.data]);
        showToast(`Genre "${genreData.name}" created successfully.`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteGenre = async (genreId, name) => {
    if (window.confirm(`Delete music genre "${name || 'selected'}"?`)) {
      try {
        await deleteAdminGenre(genreId);
        setGenres((prev) => prev.filter((g) => g.id !== genreId));
        showToast(`Genre deleted from platform taxonomy.`);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  // ==========================================
  // 2. USER & ROLE GOVERNANCE HANDLERS
  // ==========================================
  const handleVerifyArtist = async (userId, isVerified) => {
    try {
      await verifyArtistStatus(userId, isVerified);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_verified_artist: isVerified } : u))
      );
      showToast(isVerified ? 'Artist granted official Verified Artist blue badge.' : 'Artist badge revoked.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleUserStatus = async (userId, isActive, reason = '') => {
    try {
      await updateUserStatus(userId, isActive, reason);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: isActive, suspension_reason: reason } : u))
      );
      showToast(isActive ? 'Account reactivated successfully.' : `Account suspended: ${reason}`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateRoles = async (userId, newRoles) => {
    try {
      await updateUserRoles(userId, newRoles);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, roles: newRoles } : u))
      );
      showToast(`User role updated to: ${newRoles.join(', ')}`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const res = await createAdminUser(userData);
      if (res.data) {
        setUsers((prev) => [...prev, res.data]);
        showToast(res.message || `User @${userData.username} created successfully.`);
      }
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteUser = async (userId, username, email) => {
    if (email?.toLowerCase() === 'iks214262@gmail.com') {
      showToast('Action Forbidden: Cannot delete Super Administrator account.', 'error');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete user @${username}?`)) {
      try {
        await deleteUser(userId);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        showToast(`User @${username} deleted permanently.`);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  // ==========================================
  // 3. SYSTEM & FINANCIAL MANAGEMENT HANDLERS
  // ==========================================
  const handleToggleAd = async (adId) => {
    try {
      const res = await toggleAd(adId);
      setAds((prev) =>
        prev.map((a) => (a.id === adId ? res.data : a))
      );
      showToast(`Ad campaign ${res.data?.is_active ? 'activated' : 'paused'}.`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateAd = async (adData) => {
    try {
      const res = await createAd(adData);
      setAds((prev) => [res.data, ...prev]);
      showToast(`Ad placement "${adData.title}" created.`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAd = async (adId) => {
    if (window.confirm('Delete this advertising placement?')) {
      try {
        await deleteAd(adId);
        setAds((prev) => prev.filter((a) => a.id !== adId));
        showToast('Advertisement campaign removed.');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleProcessPayout = async (payoutId) => {
    try {
      const res = await processRoyaltyPayout(payoutId);
      setRoyalties((prev) =>
        prev.map((r) => (r.id === payoutId ? res.data : r))
      );
      showToast(res.message || 'Royalty payout marked as Paid.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ==========================================
  // 4. MODERATION & DISPUTE HANDLERS
  // ==========================================
  const handleUpdateDisputeStatus = async (disputeId, status, resolutionNote = '') => {
    try {
      const res = await updateDisputeStatus(disputeId, status, resolutionNote);
      setDisputes((prev) =>
        prev.map((d) => (d.id === disputeId ? res.data : d))
      );
      showToast(res.message || `Dispute ticket marked as ${status.toUpperCase()}.`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateDispute = async (ticketData) => {
    try {
      const res = await createDisputeTicket(ticketData);
      setDisputes((prev) => [res.data, ...prev]);
      showToast(res.message || 'Dispute ticket filed successfully.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Artist Track & Album Handlers
  const handleOpenAdd = () => {
    setEditingSong(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (song) => {
    setEditingSong(song);
    setIsModalOpen(true);
  };

  const handleSaveSong = async (songData) => {
    if (editingSong) {
      const res = await updateSong(editingSong.id, songData);
      setSongs((prev) =>
        prev.map((s) => (s.id === editingSong.id ? res.data : s))
      );
      showToast(`Track "${songData.title}" updated successfully.`);
    } else {
      const res = await addSong(songData);
      setSongs((prev) => [res.data, ...prev]);
      showToast(`Track "${songData.title}" uploaded to catalog queue.`);
    }
  };

  const handleDeleteSong = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteSong(id);
        setSongs((prev) => prev.filter((s) => s.id !== id));
        if (activePreview?.id === id) setActivePreview(null);
        showToast(`Track "${title}" deleted.`);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleAdminTakedown = async (id, title) => {
    if (window.confirm(`[ADMIN] Confirm moderation takedown of "${title}"?`)) {
      try {
        await adminDeleteSong(id);
        setSongs((prev) => prev.filter((s) => s.id !== id));
        if (activePreview?.id === id) setActivePreview(null);
        showToast(`[ADMIN] Track "${title}" permanently removed from catalog.`);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleAddAlbum = async (albumData) => {
    try {
      const res = await addAlbum(albumData);
      setAlbums((prev) => [...prev, res.data]);
      showToast(`Album "${albumData.name}" created.`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAlbum = async (id, name) => {
    if (window.confirm(`Delete album "${name}"?`)) {
      try {
        await deleteAlbum(id);
        setAlbums((prev) => prev.filter((a) => a.id !== id));
        showToast(`Album "${name}" deleted.`);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setCurrentUser(null);
    showToast('Signed out of session.');
  };

  // Distinct Route Permissions Guard
  const userRoles = currentUser?.roles || [];
  const isArtistRoute = currentTab.startsWith('artist-');
  const isAdminRoute = currentTab.startsWith('admin-');
  const hasArtistAccess = userRoles.includes('artist');
  const hasAdminAccess = userRoles.includes('admin');
  const openDisputesCount = disputes.filter((d) => d.status === 'open').length;

  // Loading State during Session Authentication Verification
  if (isAuthChecking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#070a12',
          color: '#38bdf8',
          fontSize: '0.88rem',
          fontFamily: 'Inter, sans-serif',
          gap: '12px',
        }}
      >
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.4rem', color: '#00c896' }}></i>
        <span style={{ color: '#94a3b8' }}>Connecting to SoundFly Portal...</span>
      </div>
    );
  }

  // 🔒 UNAUTHENTICATED STATE: Render Gmail & Password Auth Form Directly
  if (!currentUser) {
    return (
      <div className="admin-app" style={{ minHeight: '100vh', width: '100%', background: '#070a12' }}>
        {toast && (
          <div className={`admin-toast ${toast.type}`}>
            <i
              className={`fas ${
                toast.type === 'success'
                  ? 'fa-check-circle'
                  : 'fa-exclamation-triangle'
              }`}
            ></i>
            <span>{toast.message}</span>
          </div>
        )}
        <AuthLoginForm
          onLogin={handleLogin}
          showToast={showToast}
        />
      </div>
    );
  }

  return (
    <div className="admin-app">
      {isAdminRoute ? (
        <AdminSidebar
          currentTab={currentTab === 'admin-catalog' ? 'admin-content' : currentTab}
          setCurrentTab={setCurrentTab}
          currentUser={currentUser}
          backendStatus={backendStatus}
          pendingCount={pendingSongs.length}
          disputeCount={openDisputesCount}
          onLogout={handleLogout}
        />
      ) : (
        <ArtistSidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          currentUser={currentUser}
          onOpenAddSong={handleOpenAdd}
          onLogout={handleLogout}
        />
      )}

      <div className="admin-main">
        <Navbar
          currentTab={currentTab}
          backendStatus={backendStatus}
          onOpenAddSong={handleOpenAdd}
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigateProfile={() => setCurrentTab(isAdminRoute ? 'admin-settings' : 'artist-profile')}
        />

        <main className="admin-content">
          {toast && (
            <div className={`admin-toast ${toast.type}`}>
              <i
                className={`fas ${
                  toast.type === 'success'
                    ? 'fa-check-circle'
                    : 'fa-exclamation-triangle'
                }`}
              ></i>
              <span>{toast.message}</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* 🔒 ROLE-BASED ACCESS GUARDS                           */}
          {/* ==================================================== */}
          {isArtistRoute && !hasArtistAccess ? (
            <AccessDenied
              requiredRole="artist"
              userRoles={userRoles}
              onLogout={handleLogout}
              onGoDashboard={() => setCurrentTab('admin-dashboard')}
            />
          ) : isAdminRoute && !hasAdminAccess ? (
            <AccessDenied
              requiredRole="admin"
              userRoles={userRoles}
              onLogout={handleLogout}
              onGoDashboard={() => setCurrentTab('artist-dashboard')}
            />
          ) : (
            <>
              {/* ==================================================== */}
              {/* 🎨 ARTIST ROUTES                                      */}
              {/* ==================================================== */}
              {currentTab === 'artist-dashboard' && (
                <div className="tab-dashboard">
                  <StatCards
                    songCount={songs.length}
                    albumCount={albums.length}
                    genreCount={genres.length}
                  />
                  <ChartsSection />
                  <div className="dashboard-section-header">
                    <h3>My Recent Releases</h3>
                    <button
                      className="link-action"
                      onClick={() => setCurrentTab('artist-songs')}
                    >
                      Open Full Track Manager →
                    </button>
                  </div>
                  <SongsTable
                    songs={songs.slice(0, 4)}
                    onOpenAdd={handleOpenAdd}
                    onOpenEdit={handleOpenEdit}
                    onDelete={handleDeleteSong}
                    activePreview={activePreview}
                    setActivePreview={setActivePreview}
                  />
                </div>
              )}

              {currentTab === 'artist-songs' && (
                <div className="tab-songs">
                  <SongsTable
                    songs={songs}
                    onOpenAdd={handleOpenAdd}
                    onOpenEdit={handleOpenEdit}
                    onDelete={handleDeleteSong}
                    activePreview={activePreview}
                    setActivePreview={setActivePreview}
                  />
                </div>
              )}

              {currentTab === 'artist-albums' && (
                <AlbumsView
                  albums={albums}
                  onAddAlbum={handleAddAlbum}
                  onDeleteAlbum={handleDeleteAlbum}
                />
              )}

              {currentTab === 'artist-profile' && <ArtistProfileView />}

              {/* ==================================================== */}
              {/* 🛡️ ADMIN ROUTES                                       */}
              {/* ==================================================== */}
              {/* 4. Platform Analytics & Moderation: Master Dashboard */}
              {currentTab === 'admin-dashboard' && (
                <AdminOverview
                  onNavigate={(targetTab) => setCurrentTab(targetTab)}
                  pendingCount={pendingSongs.length}
                  disputeCount={openDisputesCount}
                />
              )}

              {/* 1. Content & Music Management (Approval, Global Control, Genres) */}
              {(currentTab === 'admin-content' || currentTab === 'admin-catalog') && (
                <ContentManagementView
                  songs={songs}
                  pendingSongs={pendingSongs}
                  genres={genres}
                  onApproveSong={handleApproveSong}
                  onRejectSong={handleRejectSong}
                  onTogglePlayback={handleTogglePlayback}
                  onDeleteSong={handleAdminTakedown}
                  onAddGenre={handleAddGenre}
                  onDeleteGenre={handleDeleteGenre}
                  activePreview={activePreview}
                  setActivePreview={setActivePreview}
                />
              )}

              {/* 2. User & Role Management (Role Assignment, Artist Verification, Suspension) */}
              {currentTab === 'admin-users' && (
                <UsersView
                  users={users}
                  roles={roles}
                  onOpenCreateUser={() => setIsCreateUserModalOpen(true)}
                  onDeleteUser={handleDeleteUser}
                  onToggleStatus={handleToggleUserStatus}
                  onVerifyArtist={handleVerifyArtist}
                  onUpdateRoles={handleUpdateRoles}
                  currentUser={currentUser}
                />
              )}

              {/* 3. System & Financial Management (Subscriptions, Ads, Royalty Payouts) */}
              {currentTab === 'admin-financial' && (
                <FinancialManagementView
                  financialStats={financialOverview}
                  subscriptions={subscriptions}
                  ads={ads}
                  royalties={royalties}
                  onToggleAd={handleToggleAd}
                  onCreateAd={handleCreateAd}
                  onDeleteAd={handleDeleteAd}
                  onProcessPayout={handleProcessPayout}
                />
              )}

              {/* 4. Platform Moderation: Report & Dispute Resolution */}
              {currentTab === 'admin-disputes' && (
                <DisputesView
                  disputes={disputes}
                  onUpdateDisputeStatus={handleUpdateDisputeStatus}
                  onCreateDispute={handleCreateDispute}
                  onTakedownSong={handleAdminTakedown}
                />
              )}

              {/* 5. System Governance: Profile & Platform Settings */}
              {(currentTab === 'admin-settings' || currentTab === 'admin-profile') && (
                <AdminProfileSettingsView
                  currentUser={currentUser}
                  onUpdateCurrentUser={(updatedUser) => {
                    setCurrentUser(updatedUser);
                  }}
                  showToast={showToast}
                  onLogout={handleLogout}
                  initialSubtab={currentTab === 'admin-settings' ? 'settings' : 'profile'}
                />
              )}
            </>
          )}
        </main>
      </div>

      <SongModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSong}
        editingSong={editingSong}
      />

      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onSave={handleCreateUser}
      />
    </div>
  );
}
