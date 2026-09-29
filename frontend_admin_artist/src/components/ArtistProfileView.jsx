import React, { useState } from 'react';

export default function ArtistProfileView() {
  const [profile, setProfile] = useState({
    name: 'Rahman Nayan',
    stageName: 'SoundFly Creator',
    bio: 'Music producer, electronic and indie artist exploring contemporary ambient and melodic pop soundscapes. Streaming worldwide.',
    location: 'Jakarta, Indonesia',
    followers: '452,800',
    monthlyListeners: '7,340,000',
    avatar: '/images/avatar.jpg',
    banner: '/images/layout.jpg',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...profile });

  const handleSave = (e) => {
    e.preventDefault();
    setProfile({ ...tempProfile });
    setIsEditing(false);
  };

  return (
    <div className="artist-profile-page">
      <div
        className="profile-banner"
        style={{ backgroundImage: `url(${profile.banner})` }}
      >
        <div className="banner-overlay"></div>
      </div>

      <div className="profile-header-card">
        <div className="profile-main-info">
          <img src={profile.avatar} alt={profile.name} className="profile-avatar-large" />
          <div className="profile-titles">
            <div className="name-row">
              <h2>{profile.name}</h2>
              <span className="verified-badge">
                <i className="fas fa-check-circle"></i> Verified Artist
              </span>
            </div>
            <p className="profile-handle">@{profile.stageName}</p>
            <p className="profile-location">
              <i className="fas fa-map-marker-alt"></i> {profile.location}
            </p>
          </div>
        </div>

        <button
          className="btn-edit-profile"
          onClick={() => {
            setTempProfile({ ...profile });
            setIsEditing(!isEditing);
          }}
        >
          <i className="fas fa-user-edit"></i>
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="edit-profile-card">
          <h3>Update Artist Profile</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Artist Name</label>
              <input
                type="text"
                value={tempProfile.name}
                onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={tempProfile.location}
                onChange={(e) => setTempProfile({ ...tempProfile, location: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Biography</label>
            <textarea
              rows="3"
              value={tempProfile.bio}
              onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
            ></textarea>
          </div>
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </form>
      ) : (
        <div className="profile-body-grid">
          <div className="profile-bio-card">
            <h3>About the Artist</h3>
            <p>{profile.bio}</p>

            <div className="artist-metrics-row">
              <div className="metric-box">
                <span className="metric-num">{profile.monthlyListeners}</span>
                <span className="metric-label">Monthly Listeners</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">{profile.followers}</span>
                <span className="metric-label">Followers</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">#28</span>
                <span className="metric-label">Global Creator Rank</span>
              </div>
            </div>
          </div>

          <div className="profile-links-card">
            <h3>Connected Platforms</h3>
            <div className="social-links-list">
              <div className="social-item">
                <i className="fab fa-spotify" style={{ color: '#1DB954' }}></i>
                <span>Spotify for Artists</span>
                <span className="badge-connected">Connected</span>
              </div>
              <div className="social-item">
                <i className="fab fa-soundcloud" style={{ color: '#FF5500' }}></i>
                <span>SoundCloud Pro</span>
                <span className="badge-connected">Connected</span>
              </div>
              <div className="social-item">
                <i className="fab fa-apple" style={{ color: '#FA243C' }}></i>
                <span>Apple Music for Artists</span>
                <span className="badge-connected">Connected</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
