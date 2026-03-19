import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../features/api/slice/authSlice'; // Your authSlice action
import { useUpdateUserMutation } from '../../features/api/user/userApi'; // Import from userApi.js (adjust path if needed)

const ChangeProfileDialog = ({ open, onClose, user }) => {
  const dispatch = useDispatch();
  const [updateUserMutation, { isLoading, error }] = useUpdateUserMutation(); // RTK Query hook
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [middleName, setMiddleName] = useState(user?.middle_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [suffix, setSuffix] = useState(user?.suffix || '');
  // Remove profile picture logic

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setMiddleName(user.middle_name || '');
      setLastName(user.last_name || '');
      setSuffix(user.suffix || '');
    }
  }, [user]);

  // Removed handleFileChange and handleRemovePicture

const handleSave = async () => {
  // Only send text fields, make suffix optional
  const userData = {
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
  };
  if (suffix && suffix.trim() !== '') {
    userData.suffix = suffix;
  }
  try {
    const result = await updateUserMutation({ id: user.id, data: userData }).unwrap();
    dispatch(updateUser(result.data));
    onClose();
  } catch (err) {
    console.error('Update failed:', err);
  }
};

  const handleCancel = () => {
    // Reset to original values
    setFirstName(user?.first_name || '');
    setMiddleName(user?.middle_name || '');
    setLastName(user?.last_name || '');
    setSuffix(user?.suffix || '');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Change Information</DialogTitle>
      <DialogContent>
        {error && <Typography color="error">Error: {error.data?.message || 'Update failed'}</Typography>}
        {/* Avatar and picture controls removed */}
        <TextField
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
          margin="normal"
          disabled={isLoading}
          sx={{
    // Optional: add more top padding to prevent label overlap
    '& .MuiInputLabel-root': {
      top: '2px',
      background: '#fff',
      padding: '0 4px',
    },
  }}
        />
        <TextField
          label="Middle Name"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          fullWidth
          margin="normal"
          disabled={isLoading}
          sx={{
    // Optional: add more top padding to prevent label overlap
    '& .MuiInputLabel-root': {
      top: '2px',
      background: '#fff',
      padding: '0 4px',
    },
  }}
        />
        <TextField
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
          margin="normal"
          disabled={isLoading}
          sx={{
    // Optional: add more top padding to prevent label overlap
    '& .MuiInputLabel-root': {
      top: '2px',
      background: '#fff',
      padding: '0 4px',
    },
  }}
        />
        <TextField
          label="Suffix (optional)"
          value={suffix}
          onChange={(e) => setSuffix(e.target.value)}
          fullWidth
          margin="normal"
          disabled={isLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#1976d2', // Custom border color
                borderWidth: 2,
              },
              '&:hover fieldset': {
                borderColor: '#115293', // Darker on hover
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1565c0', // Even darker when focused
              },
            },
            '& .MuiInputLabel-root': {
              top: '2px',
              background: '#fff',
              padding: '0 4px',
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={isLoading}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={isLoading} startIcon={isLoading ? <Box sx={{ display: 'flex', alignItems: 'center' }}><CircularProgress size={20} sx={{ color: 'white' }} /></Box> : null}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeProfileDialog;