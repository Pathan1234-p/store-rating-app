import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  parseApiErrors,
} from '../utils/validation';
import { ROLE_ROUTES } from '../constants/roles';

export default function Signup() {
  const { signup, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={ROLE_ROUTES[user.role] || '/'} replace />;
  }

  const validate = () => {
    const errs = {};
    const nameErr = validateName(form.name);
    if (nameErr) errs.name = nameErr;
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    const addrErr = validateAddress(form.address);
    if (addrErr) errs.address = addrErr;
    const passErr = validatePassword(form.password);
    if (passErr) errs.password = passErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    setLoading(true);
    try {
      const signedUpUser = await signup(form);
      navigate(ROLE_ROUTES[signedUpUser.role] || '/');
    } catch (err) {
      setError(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2>Sign Up</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name (20–60 characters)</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label>Address (max 400 characters)</label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          {errors.address && <div className="form-error">{errors.address}</div>}
        </div>
        <div className="form-group">
          <label>Password (8–16 chars, uppercase + special)</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      <p className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
