import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAdmin } from '../../features/admin/adminSlice';

/** Redirects to the login page unless the admin has a valid, unexpired token. */
export default function RequireAdmin({ children }) {
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();

  if (!isAdmin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return children;
}
