import { useEffect, useState } from 'react';
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
} from '@mui/material';
import Snackbar from '../../component/reuseable/Snackbar';

const OSWALD = '"Oswald", sans-serif';

// Validation schema
const categoryValidationSchema = yup.object().shape({
  name: yup.string().required('Category name is required').trim(),
});

/**
 * Unified Category Dialog Component
 * Handles both Create and Edit modes
 * 
 * @param {Object} props
 * @param {boolean} props.open - Dialog visibility
 * @param {function} props.onClose - Close handler
 * @param {Object} props.category - Category data (for edit mode, null for add mode)
 * @param {function} props.onSave - Save mutation function
 * @param {boolean} props.isLoading - Loading state
 */
export default function CategoryFormDialog({ open, onClose, category = null, onSave, isLoading = false }) {
  const isEdit = !!category;
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(categoryValidationSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
    },
  });

  // Populate form when category is provided (edit mode)
  useEffect(() => {
    if (isEdit && category) {
      reset({
        name: category.name || '',
      });
    } else {
      reset({ name: '' });
    }
  }, [open, category, isEdit, reset]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        // For edit mode
        await onSave({ ...data, id: category.id }).unwrap();
      } else {
        // For add mode
        await onSave({ name: data.name.trim() }).unwrap();
      }

      setSnackbar({
        open: true,
        message: 'Category created/updated successfully!',
        severity: 'success',
      });

      reset();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error saving category:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to save category';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleDialogClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: OSWALD, fontWeight: 600 }}>{isEdit ? 'Edit Category' : 'Add New Category'}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            {...register('name')}
            label="Category Name"
            fullWidth
            placeholder="e.g., Bug, Enhancement, Feature"
            error={!!errors.name}
            helperText={errors.name?.message}
            disabled={isLoading}
            autoFocus
            sx={{ '& input, & label': { fontFamily: OSWALD } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleDialogClose} disabled={isLoading} sx={{ fontFamily: OSWALD }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading && <CircularProgress size={20} />}
          sx={{
            backgroundColor: '#2c3e50',
            fontFamily: OSWALD,
            '&:hover': { backgroundColor: '#34495e' },
          }}
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Save'}
        </Button>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </Dialog>
  );
}
