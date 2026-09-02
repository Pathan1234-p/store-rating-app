import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';
import {
  validateName,
  validateEmail,
  validateAddress,
  parseApiErrors,
} from '../../utils/validation';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStores = useCallback(async () => {
    try {
      const params = { sortBy, sortOrder, ...filters };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const { data } = await api.get('/admin/stores', { params });
      setStores(data.stores);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores');
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const validateForm = () => {
    const errs = {};
    const nameErr = validateName(form.name);
    if (nameErr) errs.name = nameErr;
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    const addrErr = validateAddress(form.address);
    if (addrErr) errs.address = addrErr;
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setError('');
    setSuccess('');
    try {
      const payload = { ...form };
      if (!payload.owner_id) delete payload.owner_id;
      else payload.owner_id = parseInt(payload.owner_id, 10);
      await api.post('/admin/stores', payload);
      setSuccess('Store created successfully');
      setForm({ name: '', email: '', address: '', owner_id: '' });
      setShowForm(false);
      fetchStores();
    } catch (err) {
      setError(parseApiErrors(err));
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'averageRating',
      label: 'Rating (avg)',
      render: (row) => (
        <span className="star-rating">{row.averageRating.toFixed(1)} / 5</span>
      ),
    },
  ];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Stores</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Store'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="panel">
          <h3>Create Store</h3>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {formErrors.name && <div className="form-error">{formErrors.name}</div>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                {formErrors.email && <div className="form-error">{formErrors.email}</div>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                {formErrors.address && <div className="form-error">{formErrors.address}</div>}
              </div>
              <div className="form-group">
                <label>Owner ID (optional)</label>
                <input
                  type="number"
                  value={form.owner_id}
                  onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
                  placeholder="User ID of store owner"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Create Store</button>
          </form>
        </div>
      )}

      <div className="filter-bar">
        <input placeholder="Filter by name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input placeholder="Filter by email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        <input placeholder="Filter by address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
      </div>

      <SortableTable
        columns={columns}
        data={stores}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </div>
  );
}
