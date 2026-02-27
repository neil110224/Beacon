import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

/**
 * ProtectedRoute Component
 * 
 * This wrapper component checks if a user is authenticated and has the required permission.
 * - If authenticated AND has permission: renders the requested component
 * - If authenticated BUT no permission: shows "No Permission" page or redirects to Dashboard
 * - If NOT authenticated: redirects to login page
 * 
 * Usage:
 * <ProtectedRoute element={<Dashboard />} permission="Dashboard" redirectOnFail={true} />
 */
const ProtectedRoute = ({ element, permission, redirectOnFail = true }) => {
  // Get authentication state from Redux
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  // Check if user is truly authenticated (token exists and is not just in localStorage)
  const isUserLoggedIn = isAuthenticated && token && user;

  if (!isUserLoggedIn) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // If permission is required, check if user has it
  if (permission) {
    const userPermissions = user?.role?.access_permissions || [];
    const hasPermission = userPermissions.includes(permission);

    if (!hasPermission) {
      // If redirectOnFail is true, redirect to Dashboard
      if (redirectOnFail) {
        return <Navigate to="/Dashboard" replace />;
      }

      // Otherwise show "No Permission" page
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <LockIcon sx={{ fontSize: '60px', color: '#d32f2f' }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#333' }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            You don't have permission to access this page
          </Typography>
        </Box>
      );
    }
  }

  // User is authenticated and has permission, render the component
  return element;
};

export default ProtectedRoute;
