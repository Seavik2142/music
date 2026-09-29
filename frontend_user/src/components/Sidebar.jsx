import React, { useState } from 'react';

export default function Sidebar() {
  const [activeMenu, setActiveMenu] = useState('Home');

  const menuItems = [
    { name: 'Home', icon: 'fas fa-home' },
    { name: 'Discover', icon: 'fas fa-compass' },
    { name: 'Favorite', icon: 'fas fa-heart' },
    { name: 'Search', icon: 'fas fa-search' },
  ];

  const libraryItems = [
    { name: 'Singles', icon: 'fas fa-compact-disc' },
    { name: 'Albums', icon: 'fas fa-compact-disc' },
    { name: 'Artist', icon: 'fas fa-music' },
  ];

  const playlistItems = [
    { name: 'English Song', icon: 'fas fa-bookmark' },
    { name: 'Hindi Plays', icon: 'fas fa-bookmark' },
    { name: 'Bangla Songs', icon: 'fas fa-bookmark' },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <i className="logo-icon fab fa-soundcloud"></i>
        <span className="logo-text">SoundFly</span>
      </div>

      <nav className="nav-section">
        <p className="section-title">Menu</p>
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`nav-link ${activeMenu === item.name ? 'menu-active' : ''}`}
            onClick={() => setActiveMenu(item.name)}
          >
            <i className={item.icon}></i>
            {item.name}
          </button>
        ))}
      </nav>

      <nav className="nav-section">
        <p className="section-title">Library</p>
        {libraryItems.map((item) => (
          <button
            key={item.name}
            className="nav-link"
            onClick={() => setActiveMenu(item.name)}
          >
            <i className={item.icon}></i>
            {item.name}
          </button>
        ))}
      </nav>

      <nav className="nav-section">
        <p className="section-title">My Playlist</p>
        {playlistItems.map((item) => (
          <button
            key={item.name}
            className="nav-link"
            onClick={() => setActiveMenu(item.name)}
          >
            <i className={item.icon}></i>
            {item.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}
