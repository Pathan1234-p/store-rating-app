import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/owner/dashboard')
      .then(({ data: d }) => setData(d))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;
  if (!data) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1 className="page-title">Store Owner Dashboard</h1>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="label">Store</div>
          <div className="value" style={{ fontSize: '1.25rem' }}>{data.store.name}</div>
        </div>
        <div className="stat-card">
          <div className="label">Average Rating</div>
          <div className="value">{data.averageRating.toFixed(1)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Raters</div>
          <div className="value">{data.raters.length}</div>
        </div>
      </div>

      <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Users Who Rated Your Store</h2>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Rating</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.raters.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">No ratings yet</td>
              </tr>
            ) : (
              data.raters.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td className="star-rating">{r.rating} / 5</td>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
