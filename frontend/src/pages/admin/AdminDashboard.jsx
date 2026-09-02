import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;
  if (!stats) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1 className="page-title">Admin Dashboard</h1>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="label">Total Users</div>
          <div className="value">{stats.totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Stores</div>
          <div className="value">{stats.totalStores}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Ratings</div>
          <div className="value">{stats.totalRatings}</div>
        </div>
      </div>
    </div>
  );
}
