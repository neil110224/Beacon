import * as React from 'react';
import MuiSnackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

export default function Snackbar({ open, message, severity, onClose }) {
  return (
    <MuiSnackbar
      open={open}
      onClose={onClose}
      autoHideDuration={1200}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </MuiSnackbar>
  );
}
