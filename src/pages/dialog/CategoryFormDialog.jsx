import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {Dialog,DialogTitle,DialogContent,DialogActions,Button,TextField,Box,CircularProgress,} from '@mui/material';
import './dialogscss/CategoryFormDialog.scss';
const OSWALD = '"Oswald", sans-serif';

// Validation schema
const categoryValidationSchema = yup.object().shape({
  name: yup.string().required('Category name is required').trim(),
});

/**
 * @param {Object} props
 * @param {boolean} props.open - Dialog visibility
 * @param {function} props.onClose - Close handler
 * @param {Object} props.category - Category data (for edit mode, null for add mode)
 * @param {function} props.onSave - Save mutation function
 * @param {boolean} props.isLoading - Loading state
 */
export default function CategoryFormDialog({ open, onClose, category = null, onSave, refetch, isLoading = false, onShowSnackbar }) {
  const isEdit = !!category;
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


  const onSubmit = async (data) => {
    setLocalLoading(true);
    try {
      if (isEdit) {
        await onSave({ ...data, id: category.id }).unwrap();
      } else {
        await onSave({ name: data.name.trim() }).unwrap();
      }

      // ✅ Success path — notify parent, refetch, then close
      if (onShowSnackbar) {
        onShowSnackbar({
          message: isEdit ? 'Category updated successfully!' : 'Category created successfully!',
          severity: 'success',
        });
      }
      setJustSaved(true);
      reset();
      if (refetch) refetch();
      setTimeout(() => {
        setLocalLoading(false);
        setJustSaved(false);
        onClose();
      }, 500);
    } catch (error) {
      // ❌ Error path — notify parent, do NOT refetch
      console.error('Error saving category:', error);
      const errorMessage =
        error?.data?.errors?.[0]?.detail ||
        error?.data?.message ||
        error?.message ||
        'Failed to save category. Please try again.';
      if (onShowSnackbar) {
        onShowSnackbar({
          message: errorMessage,
          severity: 'error',
        });
      }
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
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth className="categoryFormDialog">
      <DialogTitle sx={{ fontFamily: OSWALD, fontWeight: 600 }} className="categoryFormDialogTitle">
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
            className="categoryFormDialogField"
            sx={{ '& input, & label': { fontFamily: OSWALD } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }} className="categoryFormDialogActions">
        <Button
          onClick={handleDialogClose}
          disabled={isLoading || localLoading || justSaved}
          sx={{ fontFamily: OSWALD }}
          className="categoryFormDialogCancelBtn"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isLoading || localLoading || justSaved}
          startIcon={(isLoading || localLoading || justSaved) && <CircularProgress size={20} />}
          sx={{ fontFamily: OSWALD }}
          className="categoryFormDialogSaveBtn"
        >
          {(isLoading || localLoading || justSaved)
            ? 'Saving...'
            : isEdit
            ? 'Update'
            : 'Create'}
        </Button>
      </DialogActions>

      {/* Snackbar removed; now handled in parent Category.jsx */}
    </Dialog>
  );
}