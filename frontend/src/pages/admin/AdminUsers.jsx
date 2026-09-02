import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  parseApiErrors,
} from '../../utils/validation';
import { ROLES } from '../../constants/roles';

const RoleBadge = ({ role }) => (
  <span className={`badge badge-${role}`}>{role}</span>
);

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: ROLES.USER });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const params = { sortBy, sortOrder, ...filters };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

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
    const passErr = validatePassword(form.password);
    if (passErr) errs.password = passErr;
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/users', form);
      setSuccess('User created successfully');
      setForm({ name: '', email: '', address: '', password: '', role: ROLES.USER });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(parseApiErrors(err));
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role', label: 'Role', sortable: true, render: (row) => <RoleBadge role={row.role} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => <Link to={`/admin/users/${row.id}`}>View</Link>,
    },
  ];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Users</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="panel">
          <h3>Create User</h3>
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
                <label>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value={ROLES.USER}>Normal User</option>
                  <option value={ROLES.ADMIN}>Admin</option>
                  <option value={ROLES.STORE_OWNER}>Store Owner</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              {formErrors.password && <div className="form-error">{formErrors.password}</div>}
            </div>
            <button type="submit" className="btn btn-primary">Create User</button>
          </form>
        </div>
      )}

      <div className="filter-bar">
        <input placeholder="Filter by name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input placeholder="Filter by email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        <input placeholder="Filter by address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All Roles</option>
          <option value={ROLES.ADMIN}>Admin</option>
          <option value={ROLES.USER}>Normal</option>
          <option value={ROLES.STORE_OWNER}>Owner</option>
        </select>
      </div>

      <SortableTable
        columns={columns}
        data={users}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </div>
  );
}
