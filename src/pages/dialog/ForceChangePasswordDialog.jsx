import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,DialogTitle,DialogContent,DialogActions,Button,TextField,Box,CircularProgress,Alert,Snackbar,} from '@mui/material';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/api/slice/authSlice';
import { useUpdateUserMutation } from '../../features/api/user/userApi';

const changePasswordSchema = yup.object().shape({
  new_password: yup.string()
    .required('New password is required'),
  confirm_password: yup.string()
    .required('Confirm password is required')
    .oneOf([yup.ref('new_password')], 'Passwords must match'),
});

// ✅ Force label to always stay shrunk in ALL states — default, hover, focused, filled
const fieldSx = {
  '& .MuiInputLabel-root': {
    transform: 'translate(14px, -9px) scale(0.75) !important',
    backgroundColor: '#fff',
    px: 0.5,
  },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.75) !important',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    transform: 'translate(14px, -9px) scale(0.75) !important',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    top: 0,
  },
  '& legend': {
    display: 'none',
  },
};

export default function ForceChangePasswordDialog({ open, onClose }) {
  const user = useSelector(selectCurrentUser);
  const [apiLoading, setApiLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [updateUser] = useUpdateUserMutation();

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
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

      await updateUser({
        id: user.id,
        data: { password: data.new_password },
      }).unwrap();

      setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
      localStorage.removeItem('forceChangePassword');
      reset();

      setTimeout(() => onClose(), 1000);

    } catch (error) {
      console.error('Error changing password:', error);
      let errorMessage = 'Failed to change password';
      if (error?.data?.message) errorMessage = error.data.message;
      else if (error?.data?.errors) {
        errorMessage = Object.entries(error.data.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join('; ') || 'Validation failed';
      } else if (error?.message) errorMessage = error.message;
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setApiLoading(false);
    }
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Dialog open={open} onClose={() => {}} maxWidth="sm" fullWidth disableEscapeKeyDown>
      <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50' }}>
        Welcome! Change Your Password
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
          <Alert severity="info" sx={{ mb: 1 }}>
            Your username and password are the same. Please set a new password to secure your account.
          </Alert>

          <Controller
            name="new_password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="New Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                error={!!errors.new_password}
                helperText={errors.new_password?.message}
                disabled={apiLoading}
                autoFocus
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
              />
            )}
          />

          <Controller
            name="confirm_password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Confirm Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                error={!!errors.confirm_password}
                helperText={errors.confirm_password?.message}
                disabled={apiLoading}
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
              />
            )}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}