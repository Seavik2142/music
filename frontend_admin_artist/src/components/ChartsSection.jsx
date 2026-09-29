import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function ChartsSection() {
  const lineData = {
    labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Monthly Streams (Millions)',
        data: [3.8, 4.4, 5.1, 5.9, 6.7, 7.34],
        fill: true,
        borderColor: '#2D659B',
        backgroundColor: 'rgba(45, 101, 155, 0.18)',
        tension: 0.35,
        pointBackgroundColor: '#00C896',
        pointBorderColor: '#ffffff',
        pointRadius: 5,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#d7d7d7',
          font: { family: 'Plus Jakarta Sans', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#151515',
        titleColor: '#ffffff',
        bodyColor: '#d7d7d7',
        borderColor: '#303030',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#888888' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#888888' },
      },
    },
  };

  const doughnutData = {
    labels: ['Pop', 'Podcast', 'Rock', 'Classical', 'HipHop', 'Desi', 'British'],
    datasets: [
      {
        data: [35, 10, 15, 8, 18, 7, 7],
        backgroundColor: [
          '#00C896',
          '#8685EF',
          '#474554',
          '#93E2E4',
          '#ACA7CB',
          '#FF6F91',
          '#0089BA',
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#d7d7d7',
          font: { family: 'Plus Jakarta Sans', size: 11 },
          boxWidth: 14,
        },
      },
    },
  };

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Streaming Growth & Trends</h3>
            <span className="chart-subtitle">Listening metrics over the past 6 months</span>
          </div>
          <span className="badge-live">Live Stats</span>
        </div>
        <div className="chart-container line-chart">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Audience Genre Distribution</h3>
            <span className="chart-subtitle">Breakdown by musical style</span>
          </div>
        </div>
        <div className="chart-container doughnut-chart">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
}
