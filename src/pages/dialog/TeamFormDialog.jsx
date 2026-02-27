import { useState, useEffect } from 'react';
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
  Snackbar,
  Alert,
} from '@mui/material';

// Validation schema
const teamValidationSchema = yup.object().shape({
  name: yup.string().trim().required('Team name is required'),
  code: yup.string().trim().required('Team code is required'),
});

/**
 * Unified Team Dialog Component
 * Handles both Create and Edit modes
 * 
 * @param {Object} props
 * @param {boolean} props.open - Dialog visibility
 * @param {function} props.onClose - Close handler
 * @param {Object} props.team - Team data (for edit mode, null for add mode)
 * @param {function} props.onSave - Save mutation function
 * @param {boolean} props.isLoading - Loading state
 */
export default function TeamFormDialog({ open, onClose, team = null, onSave, isLoading = false }) {
  const isEdit = !!team;
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(teamValidationSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      code: '',
    },
  });

  // Populate form when team is provided (edit mode)
  useEffect(() => {
    if (isEdit && team) {
      reset({
        name: team.name || '',
        code: team.code || '',
      }, { keepDirty: false, keepTouched: false });
    } else {
      reset({ name: '', code: '' }, { keepDirty: false, keepTouched: false });
    }
  }, [open, team, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        // For edit mode, pass team id
        await onSave({ ...data, id: team.id }).unwrap();
      } else {
        // For add mode, wrap in teams array (as per your API)
        const payload = { teams: [{ name: data.name.trim(), code: data.code.trim() }] };
        await onSave(payload).unwrap();
      }

      setSnackbar({
        open: true,
        message: isEdit ? 'Team updated successfully!' : 'Team created successfully!',
        severity: 'success',
      });

      setTimeout(() => {
        reset({ name: '', code: '' }, { keepDirty: false, keepTouched: false });
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error saving team:', error);
      let errorMessage = 'Failed to save team';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.errors) {
        // Handle field-specific errors
        const messages = Object.values(error.data.errors).flat();
        errorMessage = messages[0] || 'Validation failed';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleDialogClose = () => {
    reset({ name: '', code: '' }, { keepDirty: false, keepTouched: false });
    setSnackbar({ open: false, message: '', severity: 'success' });
    onClose();
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Team' : 'Add New Team'}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            {...register('code')}
            label="Team Code"
            fullWidth
            placeholder="e.g., FE-001"
            error={!!errors.code}
            helperText={errors.code?.message}
            disabled={isLoading}
          />
          <TextField
            {...register('name')}
            label="Team Name"
            fullWidth
            placeholder="e.g., Frontend Team"
            error={!!errors.name}
            helperText={errors.name?.message}
            disabled={isLoading}
            autoFocus
          />

          
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleDialogClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading && <CircularProgress size={20} />}
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            backgroundColor: snackbar.severity === 'success' ? '#4caf50' : '#f44336',
            color: '#fff',
            fontWeight: 'bold',
            '& .MuiAlert-icon': {
              color: '#fff',
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>    </Dialog>
  );
}
