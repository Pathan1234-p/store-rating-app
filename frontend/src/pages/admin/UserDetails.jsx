import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { ROLES } from '../../constants/roles';

const RoleBadge = ({ role }) => (
  <span className={`badge badge-${role}`}>{role}</span>
);

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/admin/users/${id}`)
      .then(({ data }) => setUser(data.user))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load user'));
  }, [id]);

  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;
  if (!user) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <Link to="/admin/users">&larr; Back to Users</Link>
      <h1 className="page-title">User Details</h1>
      <div className="panel">
        <div className="form-group">
          <label>Name</label>
          <p>{user.name}</p>
        </div>
        <div className="form-group">
          <label>Email</label>
          <p>{user.email}</p>
        </div>
        <div className="form-group">
          <label>Address</label>
          <p>{user.address}</p>
        </div>
        <div className="form-group">
          <label>Role</label>
          <p><RoleBadge role={user.role} /></p>
        </div>
        {user.role === ROLES.STORE_OWNER && (
          <>
            {user.storeName && (
              <div className="form-group">
                <label>Store</label>
                <p>{user.storeName}</p>
              </div>
            )}
            <div className="form-group">
              <label>Store Average Rating</label>
              <p className="star-rating">
                {user.storeAverageRating != null
                  ? `${user.storeAverageRating.toFixed(1)} / 5`
                  : 'No ratings yet'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
