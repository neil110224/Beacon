import React, { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useChangePasswordMutation } from '../../features/api/user/userApi'; // 👈 adjust path if needed

const Changepassword = ({ open, onClose, user }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      const res = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      }).unwrap();
      setSnackbar({ open: true, message: res?.message || 'Password changed successfully', severity: 'success' });
      handleDialogClose();
    } catch (err) {
      setError(err?.data?.message || err?.data?.detail || 'Failed to change password.');
      setSnackbar({ open: true, message: err?.data?.message || err?.data?.detail || 'Failed to change password.', severity: 'error' });
    }
  };

  const handleDialogClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog open={open} onClose={handleDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Oswald", sans-serif' }}>Change Password</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                fullWidth
                required
                autoFocus
                sx={{ fontFamily: '"Oswald", sans-serif' }}
                InputLabelProps={{ sx: { fontFamily: '"Oswald", sans-serif' } }}
                inputProps={{ style: { fontFamily: 'Oswald, sans-serif' } }}
              />
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                fullWidth
                required
                sx={{ fontFamily: '"Oswald", sans-serif' }}
                InputLabelProps={{ sx: { fontFamily: '"Oswald", sans-serif' } }}
                inputProps={{ style: { fontFamily: 'Oswald, sans-serif' } }}
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                fullWidth
                required
                sx={{ fontFamily: '"Oswald", sans-serif' }}
                InputLabelProps={{ sx: { fontFamily: '"Oswald", sans-serif' } }}
                inputProps={{ style: { fontFamily: 'Oswald, sans-serif' } }}
              />
              {error && (
                <Box color="error.main" fontSize={14} mt={1} sx={{ fontFamily: '"Oswald", sans-serif' }}>
                  {error}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="secondary" disabled={isLoading} sx={{ fontFamily: '"Oswald", sans-serif' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading} sx={{ fontFamily: '"Oswald", sans-serif', bgcolor: '#03346E' }}>
              {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Change Password'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', fontFamily: '"Oswald", sans-serif' }} elevation={6} variant="filled">
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default Changepassword;