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
const chargingValidationSchema = yup.object().shape({
  code: yup.string().trim().required('Code is required'),
  name: yup.string().trim().required('Name is required'),
});

/**
 * Unified Charging Dialog Component
 * Handles both Create and Edit modes
 * 
 * @param {Object} props
 * @param {boolean} props.open - Dialog visibility
 * @param {function} props.onClose - Close handler
 * @param {Object} props.charging - Charging data (for edit mode, null for add mode)
 * @param {function} props.onSave - Save mutation function
 * @param {boolean} props.isLoading - Loading state
 */
export default function ChargingFormDialog({ open, onClose, charging = null, onSave, isLoading = false }) {
  const isEdit = !!charging;
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [localLoading, setLocalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(chargingValidationSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      code: '',
    },
  });

  // Populate form when charging is provided (edit mode)
  useEffect(() => {
    if (isEdit && charging) {
      reset({
        name: charging.name || '',
        code: charging.code || '',
      }, { keepDirty: false, keepTouched: false });
    } else {
      reset({ name: '', code: '' }, { keepDirty: false, keepTouched: false });
    }
  }, [open, charging, isEdit, reset]);

  const onSubmit = async (data) => {
    setLocalLoading(true);
    try {
      if (isEdit) {
        // For edit mode
        await onSave({ ...data, id: charging.id }).unwrap();
      } else {
        // For add mode, wrap in departments array (as per your API)
        const payload = {
          departments: [
            {
              name: data.name.trim(),
              code: data.code.trim(),
            },
          ],
        };
        await onSave(payload).unwrap();
      }

      setSnackbar({
        open: true,
        message: isEdit ? 'Charging updated successfully!' : 'Charging created successfully!',
        severity: 'success',
      });

      setTimeout(() => {
        setLocalLoading(false);
        reset({ name: '', code: '' }, { keepDirty: false, keepTouched: false });
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error saving charging:', error);
      setLocalLoading(false);

      let errorMessage = 'Failed to save charging';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.errors) {
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
    setLocalLoading(false);
    onClose();
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50' }}>
        {isEdit ? 'Edit Charging' : 'Add New Charging'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            {...register('code')}
            label="Code"
            fullWidth
            placeholder="e.g., 10019"
            error={!!errors.code}
            helperText={errors.code?.message}
            disabled={isLoading}
          />

          <TextField
            {...register('name')}
            label="Name"
            fullWidth
            placeholder="e.g., Standard Charging"
            error={!!errors.name}
            helperText={errors.name?.message}
            disabled={isLoading}
            autoFocus
          />

          
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleDialogClose} disabled={isLoading || localLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isLoading || localLoading}
          startIcon={(isLoading || localLoading) && <CircularProgress size={20} />}
          sx={{
            backgroundColor: '#2c3e50',
            '&:hover': { backgroundColor: '#34495e' },
          }}
        >
          {isLoading || localLoading ? 'Saving...' : isEdit ? 'Update' : 'Save'}
        </Button>
      </DialogActions>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
