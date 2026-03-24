import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Route wrapper that redirects unauthenticated users to /login.
 * Shows nothing while the auth store is hydrating from localStorage.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // or a full-page spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
