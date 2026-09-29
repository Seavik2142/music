import React from 'react';

export default function StatCards({ songCount, albumCount, genreCount }) {
  const stats = [
    {
      label: 'Catalog Tracks',
      value: songCount,
      change: '+2 this week',
      isPositive: true,
      icon: 'fas fa-music',
      color: '#00C896',
    },
    {
      label: 'Total Stream Plays',
      value: '7.34M',
      change: '+14.2% vs last month',
      isPositive: true,
      icon: 'fas fa-play-circle',
      color: '#2D659B',
    },
    {
      label: 'Published Albums',
      value: albumCount,
      change: '+1 recent release',
      isPositive: true,
      icon: 'fas fa-compact-disc',
      color: '#8685EF',
    },
    {
      label: 'Active Genres',
      value: genreCount,
      change: 'Covering global styles',
      isPositive: true,
      icon: 'fas fa-globe-americas',
      color: '#FF6F91',
    },
  ];

  return (
    <div className="stat-grid">
      {stats.map((stat, i) => (
        <div key={i} className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
            <i className={stat.icon}></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">{stat.label}</span>
            <h2 className="stat-value">{stat.value}</h2>
            <span className={`stat-change ${stat.isPositive ? 'positive' : 'negative'}`}>
              <i className="fas fa-arrow-up"></i> {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
