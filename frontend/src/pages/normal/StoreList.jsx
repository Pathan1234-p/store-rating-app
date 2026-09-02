import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import { parseApiErrors } from '../../utils/validation';

function RatingButtons({ store, onRated }) {
  const [selected, setSelected] = useState(store.userRating || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRate = async (value) => {
    setSelected(value);
    setLoading(true);
    setError('');
    try {
      if (store.userRating != null) {
        await api.put(`/stores/${store.id}/ratings`, { rating: value });
      } else {
        await api.post(`/stores/${store.id}/ratings`, { rating: value });
      }
      onRated();
    } catch (err) {
      setError(parseApiErrors(err));
      setSelected(store.userRating || 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="rating-controls">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`rating-btn ${selected === n ? 'selected' : ''}`}
            onClick={() => handleRate(n)}
            disabled={loading}
            title={`Rate ${n}`}
          >
            {n}
          </button>
        ))}
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

export default function StoreList() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState('');

  const fetchStores = useCallback(async () => {
    try {
      const params = { sortBy, sortOrder, ...filters };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const { data } = await api.get('/stores', { params });
      setStores(data.stores);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores');
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  return (
    <div className="container">
      <h1 className="page-title">Stores</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-bar">
        <input
          placeholder="Search by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          placeholder="Search by address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="address">Sort by Address</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {stores.length === 0 ? (
        <div className="empty-state">No stores found</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Store Name</th>
                <th>Address</th>
                <th>Overall Rating</th>
                <th>Your Rating</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.address}</td>
                  <td className="star-rating">{store.averageRating.toFixed(1)} / 5</td>
                  <td>
                    {store.userRating != null
                      ? <span className="star-rating">{store.userRating} / 5</span>
                      : <span style={{ color: 'var(--text-muted)' }}>Not rated</span>}
                  </td>
                  <td>
                    <RatingButtons store={store} onRated={fetchStores} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
