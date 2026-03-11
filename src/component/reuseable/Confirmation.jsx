// Confirmation.jsx
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { CircularProgress, Box } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import Exclamation from './exclamation';


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
      <DialogTitle id="confirmation-dialog-title" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center', fontFamily: '"Oswald", sans-serif' }}>
        <Exclamation />
        {title}
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', fontFamily: '"Oswald", sans-serif' }}>
        <DialogContentText id="confirmation-dialog-description" sx={{fontFamily: '"Oswald", sans-serif'}}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', gap: 2, paddingLeft: 2, paddingRight: 2 }}>
        <Button onClick={() => {
          setLocalLoading(false);
          onClose();
        }} color="primary" disabled={isLoading || localLoading} sx={{
          fontFamily: '"Oswald", sans-serif',
          '&:hover': {
            backgroundColor: '#bde3fd',
            color: '#1565c0',
          }
        }}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary" autoFocus disabled={isLoading || localLoading} startIcon={(isLoading || localLoading) && <CircularProgress size={20} />} sx={{
          fontFamily: '"Oswald", sans-serif',
          '&:hover': {
            backgroundColor: '#bde3fd',
            color: '#1565c0',
          }
        }}>
          {isLoading || localLoading ? 'Confirming...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Confirmation;