import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_ROUTES } from '../constants/roles';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROLE_ROUTES[user.role] || '/login'} replace />;
  }

  return children;
}
