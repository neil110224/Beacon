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
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setMiddleName(user.middle_name || '');
      setLastName(user.last_name || '');
      setSuffix(user.suffix || '');
      setProfilePicture(user.profile_picture || null);
    }
  }, [user]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setProfilePicture(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    setSelectedFile(null);
  };

const handleSave = async () => {
  // Send as regular JSON object, not FormData
  const userData = {
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    suffix: suffix,
  };

  // If you need to send the image, convert to base64
  if (selectedFile) {
    userData.profile_picture = profilePicture; // This is the base64 string
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
    setProfilePicture(user?.profile_picture || null);
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Change Profile</DialogTitle>
      <DialogContent>
        {error && <Typography color="error">Error: {error.data?.message || 'Update failed'}</Typography>}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={profilePicture}
            sx={{ width: 100, height: 100, mb: 1 }}
          />
          <Box>
            <Button variant="outlined" component="label" sx={{ mr: 1 }} disabled={isLoading}>
              Change Picture
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
            <Button variant="outlined" onClick={handleRemovePicture} disabled={isLoading}>
              Remove
            </Button>
          </Box>
        </Box>
        <TextField
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
          margin="normal"
          disabled={isLoading}
        />
        <TextField
          label="Middle Name"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          fullWidth
          margin="normal"
          disabled={isLoading}
        />
        <TextField
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
          margin="normal"
          disabled={isLoading}
        />
        <TextField
          label="Suffix"
          value={suffix}
          onChange={(e) => setSuffix(e.target.value)}
          fullWidth
          margin="normal"
          disabled={isLoading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={isLoading}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeProfileDialog;