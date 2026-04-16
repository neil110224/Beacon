import AppRoutes from "./routes/AppRoutes";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout, setCredentials } from "./features/api/slice/authSlice";
import Snackbar from "./component/reuseable/Snackbar";


function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [forceChangePasswordOpen, setForceChangePasswordOpen] = useState(false);

  // Check for login success flag and show snackbar when location changes
  useEffect(() => {
    const loginSuccess = localStorage.getItem('loginSuccess');
    if (loginSuccess) {
      setSnackbarSeverity('success');
      setSnackbarMessage('Login Successful!');
      setSnackbarOpen(true);
      // Clear the flag so it doesn't show again on page refresh
      localStorage.removeItem('loginSuccess');
    }
  }, [location]);

  // Check if user needs to change password on first login
  useEffect(() => {
    if (user && (user.id || user.username)) {
      // Try with user ID first
      const forceChangePasswordKey = user.id ? `forceChangePassword_${user.id}` : null;
      const forceChangePasswordKeyByUsername = user.username ? `forceChangePassword_${user.username}` : null;
      
      const shouldChangePassword = 
        (forceChangePasswordKey && (localStorage.getItem(forceChangePasswordKey) === 'true' || sessionStorage.getItem(forceChangePasswordKey) === 'true')) ||
        (forceChangePasswordKeyByUsername && (localStorage.getItem(forceChangePasswordKeyByUsername) === 'true' || sessionStorage.getItem(forceChangePasswordKeyByUsername) === 'true'));
      
      if (shouldChangePassword) {
        setForceChangePasswordOpen(true);
      }
    }
  }, [user]);

  // Block navigation if force password change is required
  useEffect(() => {
    if (forceChangePasswordOpen) {
      const handleBeforeUnload = (e) => {
        // Warn user if they try to leave before changing password
        // Note: Modern browsers don't show custom messages, but we can still prevent some navigations
        e.preventDefault();
        e.returnValue = true;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [forceChangePasswordOpen]);

  // Tab management: Track active tabs and clear data when any tab closes
  useEffect(() => {
    // Create unique ID for this tab
    const tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('tabId', tabId);

    // Add this tab to the active tabs list
    const addTabToActiveList = () => {
      try {
        const activeTabsStr = localStorage.getItem('activeTabs') || '[]';
        const activeTabs = JSON.parse(activeTabsStr);
        if (!activeTabs.includes(tabId)) {
          activeTabs.push(tabId);
          localStorage.setItem('activeTabs', JSON.stringify(activeTabs));
        }
      } catch (error) {
        localStorage.setItem('activeTabs', JSON.stringify([tabId]));
      }
    };

    // Signal all tabs to logout when this tab closes
    const handleBeforeUnload = () => {
      try {
        // Remove this tab from active list
        const activeTabsStr = localStorage.getItem('activeTabs') || '[]';
        const activeTabs = JSON.parse(activeTabsStr);
        const updatedTabs = activeTabs.filter(id => id !== tabId);

        localStorage.setItem('activeTabs', JSON.stringify(updatedTabs));
      } catch (error) {
        console.error('Error managing tabs on close:', error);
      }
    };

    // Add tab to list when component mounts
    addTabToActiveList();

    // Listen for tab close
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);




  // Monitor token on every location change - redirect if missing on protected routes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isLoginPage = location.pathname.toLowerCase().includes('/login');
    
    // If on a protected route and no token, redirect to login
    if (!token && !isLoginPage) {
      dispatch(logout());
      navigate('/login', { replace: true });
    }
  }, [location.pathname, dispatch, navigate]);

  // Sync Redux state with localStorage when other tabs log in/out
  useEffect(() => {
    const handleStorageSync = (e) => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const isLoginPage = location.pathname.toLowerCase().includes('/login');
      
      // If token exists and was just added by another tab
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          // Update Redux state with the credentials from other tab
          dispatch(setCredentials({ user: userData, token: token }));
          
          // Check if this user needs password change
          if (userData && (userData.id || userData.username)) {
            const keyById = userData.id ? `forceChangePassword_${userData.id}` : null;
            const keyByUsername = userData.username ? `forceChangePassword_${userData.username}` : null;
            
            const shouldChangePassword = 
              (keyById && (localStorage.getItem(keyById) === 'true' || sessionStorage.getItem(keyById) === 'true')) ||
              (keyByUsername && (localStorage.getItem(keyByUsername) === 'true' || sessionStorage.getItem(keyByUsername) === 'true'));
            
            if (shouldChangePassword) {
              setForceChangePasswordOpen(true);
            }
          }
          
          // If on login page, redirect to dashboard since we're now logged in
          if (isLoginPage) {
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          console.error('Error syncing credentials:', error);
        }
      }
      
      // If token was cleared (logout from another tab)
      if (!token && !isLoginPage) {
        dispatch(logout());
        navigate('/login', { replace: true });
      }

      // If activeTabs was updated, sync that too
      if (e && e.key === 'activeTabs') {
        // This helps detect when other tabs close
        const activeTabsStr = localStorage.getItem('activeTabs') || '[]';
        try {
          const activeTabs = JSON.parse(activeTabsStr);
          // If we're the only tab left, nothing else happens (other tabs are closed)
          // If multiple tabs, they all stay synced
        } catch (error) {
          console.error('Error syncing activeTabs:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageSync);
    return () => {
      window.removeEventListener('storage', handleStorageSync);
    };
  }, [location.pathname, dispatch, navigate]);

  // Sync on app load: if token exists in localStorage but Redux state is empty, sync it
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // If we have token and user in localStorage but not in Redux, sync them
    if (token && userStr && !user) {
      try {
        const userData = JSON.parse(userStr);
        dispatch(setCredentials({ user: userData, token: token }));
        
        // Check if this user needs password change
        if (userData && (userData.id || userData.username)) {
          const keyById = userData.id ? `forceChangePassword_${userData.id}` : null;
          const keyByUsername = userData.username ? `forceChangePassword_${userData.username}` : null;
          
          const shouldChangePassword = 
            (keyById && (localStorage.getItem(keyById) === 'true' || sessionStorage.getItem(keyById) === 'true')) ||
            (keyByUsername && (localStorage.getItem(keyByUsername) === 'true' || sessionStorage.getItem(keyByUsername) === 'true'));
          
          if (shouldChangePassword) {
            setForceChangePasswordOpen(true);
          }
        }
        
        // If on login page, redirect to dashboard
        const isLoginPage = location.pathname.toLowerCase().includes('/login');
        if (isLoginPage) {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error syncing credentials on load:', error);
      }
    }
  }, [dispatch, navigate, user, location.pathname]);

  // Apply persisted theme mode on initial app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode') || 'dark';
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(savedTheme === 'light' ? 'theme-light' : 'theme-dark');
    if (!localStorage.getItem('themeMode')) {
      localStorage.setItem('themeMode', savedTheme);
    }
  }, []);

  return (
    <div className="app-container">
      <AppRoutes/>
      <Snackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ marginTop: '80px' }}
      />
    </div>
  );
}

export default App;