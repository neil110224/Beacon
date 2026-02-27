import AppRoutes from "./routes/AppRoutes";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Snackbar from "./component/reuseable/Snackbar";

function App() {
  const location = useLocation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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