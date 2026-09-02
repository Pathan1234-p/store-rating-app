import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Store Rating Platform</Link>
      <ul className="navbar-links">
        {!isAuthenticated ? (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </>
        ) : (
          <>
            {user.role === ROLES.ADMIN && (
              <>
                <li><Link to="/admin">Dashboard</Link></li>
                <li><Link to="/admin/users">Users</Link></li>
                <li><Link to="/admin/stores">Stores</Link></li>
              </>
            )}
            {user.role === ROLES.USER && (
              <li><Link to="/stores">Stores</Link></li>
            )}
            {user.role === ROLES.STORE_OWNER && (
              <li><Link to="/owner">Dashboard</Link></li>
            )}
            <li><Link to="/password">Change Password</Link></li>
            <li>
              <button onClick={handleLogout}>Logout ({user.name})</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
