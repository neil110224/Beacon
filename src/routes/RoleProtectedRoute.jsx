import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * Advanced ProtectedRoute with Role-Based Access Control
 * 
 * Checks:
 * 1. User is authenticated
 * 2. User has required role (if specified)
 * 3. User has required permission (if specified)
 * 
 * Usage:
 * <RoleProtectedRoute element={<Dashboard />} requiredRole="admin" />
 * <RoleProtectedRoute element={<Users />} requiredPermission="manage_users" />
 */
const RoleProtectedRoute = ({ 
  element, 
  requiredRole = null,           // e.g., "admin", "moderator"
  requiredPermission = null,     // e.g., "manage_users", "edit_categories"
  fallbackRoute = "/Dashboard"   // Where to redirect if permission denied
}) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  // Check authentication
  if (!isAuthenticated || !token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check required role
  if (requiredRole && user.role_name !== requiredRole) {
    console.warn(`Access denied: User role "${user.role_name}" doesn't match required role "${requiredRole}"`);
    return <Navigate to={fallbackRoute} replace />;
  }

  // Check required permission
  if (requiredPermission) {
    const userPermissions = user.access_permissions || [];
    if (!userPermissions.includes(requiredPermission)) {
      console.warn(`Access denied: User doesn't have permission "${requiredPermission}"`);
      return <Navigate to={fallbackRoute} replace />;
    }
  }

  // All checks passed, render component
  return element;
};

export default RoleProtectedRoute;
