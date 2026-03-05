// Confirmation.jsx
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { CircularProgress } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

const Confirmation = ({ open, onClose, onConfirm, title = "Confirm Action", message = "Are you sure?", isLoading = false }) => {
  const [localLoading, setLocalLoading] = useState(false);

  const handleConfirm = async () => {
    setLocalLoading(true);
    try {
      await onConfirm();
    } finally {
      setLocalLoading(false);
    }
  };
  return (
    <Dialog
      open={open}
      onClose={() => {
        setLocalLoading(false);
        onClose();
      }}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      sx={{
    '& .MuiDialog-paper': {
      width: '400px',
      maxWidth: '60vw',
      minHeight: '100px',
      p: 2,
    }
  }}
    >
      <DialogTitle id="confirmation-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon sx={{ color: '#ff9800' }} />
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-start',paddingLeft:2}}>
  <Button onClick={() => {
        setLocalLoading(false);
        onClose();
      }} color="primary" disabled={isLoading || localLoading} sx={{
      '&:hover': {
        backgroundColor: '#bde3fd',  // 👈 change hover background
        color: '#1565c0',            // 👈 change hover text color
      }
    }} >
    Cancel
  </Button>
  <Button onClick={handleConfirm} color="primary" autoFocus disabled={isLoading || localLoading} startIcon={(isLoading || localLoading) && <CircularProgress size={20} />} sx={{
      '&:hover': {
        backgroundColor: '#bde3fd',  // 👈 change hover background
        color: '#1565c0',            // 👈 change hover text color
      }
    }}>
    {isLoading || localLoading ? 'Confirming...' : 'Confirm'}
  </Button>
</DialogActions>
    </Dialog>
  );
};

export default Confirmation;