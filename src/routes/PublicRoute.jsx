import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * PublicRoute Component (for Public Pages like Login)
 * 
 * This wrapper component prevents authenticated users from accessing public pages.
 * - If NOT authenticated: renders the requested component (e.g., Login page)
 * - If authenticated: redirects to dashboard
 * 
 * Usage:
 * <PublicRoute element={<Login />} redirectTo="/Dashboard" />
 */
const PublicRoute = ({ element, redirectTo = "/Dashboard" }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  // If user is already logged in, redirect them away from public pages
  if (isAuthenticated && token && user) {
    return <Navigate to={redirectTo} replace />;
  }

  // User is not authenticated, show the public page (e.g., Login)
  return element;
};

export default PublicRoute;
