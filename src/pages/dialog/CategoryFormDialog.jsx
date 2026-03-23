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
export default function CategoryFormDialog({ open, onClose, category = null, onSave, refetch, isLoading = false }) {
  const isEdit = !!category;
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [localLoading, setLocalLoading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    reset,
  } = useForm({
    resolver: yupResolver(categoryValidationSchema),
    mode: 'onSubmit', // ✅ Only validates after submit attempt
    defaultValues: {
      name: '',
    },
  });

  // Populate form when category is provided (edit mode)
  useEffect(() => {
    if (isEdit && category) {
      reset({ name: category.name || '' });
    } else {
      reset({ name: '' });
    }
  }, [open, category, isEdit, reset]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const onSubmit = async (data) => {
    setLocalLoading(true);
    try {
      if (isEdit) {
        await onSave({ ...data, id: category.id }).unwrap();
      } else {
        await onSave({ name: data.name.trim() }).unwrap();
      }

      // ✅ Success path — show success snackbar, refetch, then close
      setSnackbar({
        open: true,
        message: isEdit ? 'Category updated successfully!' : 'Category created successfully!',
        severity: 'success',
      });

      setJustSaved(true);
      reset();

      if (refetch) refetch(); // ✅ Refetch only on success

      setTimeout(() => {
        setLocalLoading(false);
        setJustSaved(false);
        onClose();
      }, 500);
    } catch (error) {
      // ❌ Error path — show error snackbar, do NOT refetch
      console.error('Error saving category:', error);
      const errorMessage =
        error?.data?.errors?.[0]?.detail ||
        error?.data?.message ||
        error?.message ||
        'Failed to save category. Please try again.';

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });

      setLocalLoading(false);
      // ❌ No refetch on error — dialog stays open so user can fix and retry
    }
  };

  const handleDialogClose = () => {
    if (localLoading || isLoading || justSaved) return;
    reset();
    setJustSaved(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: OSWALD, fontWeight: 600 }}>
        {isEdit ? 'Edit Category' : 'Create Category'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            {...register('name')}
            label="Category Name"
            fullWidth
            placeholder="e.g., Bug, Enhancement, Feature"
            error={isSubmitted && !!errors.name}         // ✅ Only show error after submit attempt
            helperText={isSubmitted ? errors.name?.message : ''}
            disabled={isLoading || localLoading}
            autoFocus
            sx={{ '& input, & label': { fontFamily: OSWALD } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleDialogClose}
          disabled={isLoading || localLoading || justSaved}
          sx={{ fontFamily: OSWALD }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isLoading || localLoading || justSaved}
          startIcon={(isLoading || localLoading || justSaved) && <CircularProgress size={20} />}
          sx={{
            backgroundColor: '#03346E',
            fontFamily: OSWALD,
            '&:hover': { backgroundColor: '#022E5B' },
          }}
        >
          {(isLoading || localLoading || justSaved)
            ? 'Saving...'
            : isEdit
            ? 'Update'
            : 'Create'}
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