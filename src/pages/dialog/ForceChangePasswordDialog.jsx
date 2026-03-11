import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../features/api/slice/authSlice';
import { useUpdateUserMutation } from '../../features/api/user/userApi';

// Validation schema
const changePasswordSchema = yup.object().shape({
  new_password: yup.string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirm_password: yup.string()
    .required('Confirm password is required')
    .oneOf([yup.ref('new_password')], 'Passwords must match'),
});

export default function ForceChangePasswordDialog({ open, onClose }) {
  const user = useSelector(selectCurrentUser);
  const [apiLoading, setApiLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [updateUser] = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setApiLoading(true);

      // Update user password
      await updateUser({
        id: user.id,
        data: {
          password: data.new_password,
        },
      }).unwrap();

      // Show success message
      setSnackbar({
        open: true,
        message: 'Password changed successfully!',
        severity: 'success',
      });

      // Clear the flag from localStorage
      localStorage.removeItem('forceChangePassword');

      // Reset form and close
      reset();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error changing password:', error);

      let errorMessage = 'Failed to change password';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.errors) {
        const errorMessages = Object.entries(error.data.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join('; ');
        errorMessage = errorMessages || 'Validation failed';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setApiLoading(false);
    }
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleDialogClose = () => {
    // Don't allow closing without changing password
    // Do nothing on close button click
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleDialogClose} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown
      onBackdropClick={() => {}} // Prevent closing by clicking backdrop
    >
      <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50' }}>
        Welcome! Change Your Password
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Alert severity="info">
            This is your first login. Please change your password to secure your account.
          </Alert>

          {/* New Password */}
          <TextField
            {...register('new_password')}
            label="New Password"
            type="password"
            fullWidth
            error={!!errors.new_password}
            helperText={errors.new_password?.message}
            disabled={apiLoading}
            autoFocus
          />

          {/* Confirm Password */}
          <TextField
            {...register('confirm_password')}
            label="Confirm Password"
            type="password"
            fullWidth
            error={!!errors.confirm_password}
            helperText={errors.confirm_password?.message}
            disabled={apiLoading}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={apiLoading}
          startIcon={apiLoading && <CircularProgress size={20} />}
          fullWidth
        >
          {apiLoading ? 'Changing Password...' : 'Change Password'}
        </Button>
      </DialogActions>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          variant="filled" 
          onClose={handleCloseSnackbar}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
