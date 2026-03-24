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

const OSWALD = '"Oswald", sans-serif';

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
export default function TeamFormDialog({ open, onClose, team = null, onSave, isLoading = false, onShowSnackbar }) {
  const isEdit = !!team;
  const [justSaved, setJustSaved] = useState(false);

  const {
  register,
  handleSubmit,
  formState: { errors, isSubmitted }, // ✅
  reset,
} = useForm({
  resolver: yupResolver(teamValidationSchema),
  mode: 'onSubmit', // ✅
  defaultValues: { name: '', code: '' },
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

      if (onShowSnackbar) {
        onShowSnackbar({
          message: isEdit ? 'Team updated successfully!' : 'Team created successfully!',
          severity: 'success',
        });
      }

      setJustSaved(true);
      setTimeout(() => {
        reset({ name: '', code: '' }, { keepDirty: false, keepTouched: false });
        setJustSaved(false);
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

      if (onShowSnackbar) {
        onShowSnackbar({
          message: errorMessage,
          severity: 'error',
        });
      }
    }
  };

  const handleDialogClose = () => {
    if (justSaved) return;
    reset({ name: '', code: '' }, { keepDirty: false, keepTouched: false });
    setJustSaved(false);
    onClose();
  };


  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: OSWALD, fontWeight: 600 }}>{isEdit ? 'Edit Team' : 'Add New Team'}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            {...register('code')}
            id="team-code"
            name="code"
            label="Team Code"
            fullWidth
            placeholder="e.g., FE-001"
            error={isSubmitted && !!errors.code}
            helperText={isSubmitted ? errors.code?.message : ''}
            disabled={isLoading}
            autoComplete="organization"
            sx={{ '& input, & label': { fontFamily: OSWALD } }}
          />
          <TextField
            {...register('name')}
            id="team-name"
            name="name"
            label="Team Name"
            fullWidth
            placeholder="e.g., Frontend Team"
            error={isSubmitted && !!errors.name}
            helperText={isSubmitted ? errors.name?.message : ''}
            disabled={isLoading}
            autoFocus
            autoComplete="organization-title"
            sx={{ '& input, & label': { fontFamily: OSWALD } }}
          />

          
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleDialogClose} disabled={isLoading || justSaved} sx={{ fontFamily: OSWALD }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isLoading || justSaved}
          startIcon={(isLoading || justSaved) && <CircularProgress size={20} />}
          sx={{
            backgroundColor: '#03346E',
            fontFamily: OSWALD,
            '&:hover': { backgroundColor: '#022E5B' },
          }}
        >
          {(isLoading || justSaved) ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
      {/* Snackbar removed; now handled in parent Team.jsx */}
    </Dialog>
  );
}
