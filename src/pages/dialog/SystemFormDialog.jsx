import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useGetTeamsQuery } from '../../features/api/team/teamApi';

// Validation schema
const systemValidationSchema = yup.object().shape({
  system_name: yup.string().required('System name is required').trim(),
  team_id: yup.string().required('Team is required'),
});

/**
 * Unified System Dialog Component
 * Handles both Create and Edit modes
 * 
 * @param {Object} props
 * @param {boolean} props.open - Dialog visibility
 * @param {function} props.onClose - Close handler
 * @param {Object} props.system - System data (for edit mode, null for add mode)
 * @param {function} props.onSave - Save mutation function
 * @param {boolean} props.isLoading - Loading state
 * @param {function} props.onSuccess - Success callback (for add mode)
 */
export default function SystemFormDialog({
  open, 
  onClose, 
  system = null, 
  onSave, 
  isLoading = false,
  onSuccess = null 
}) {
  const isEdit = !!system;

  // Fetch teams
  const { data: teamsData, isLoading: teamsLoading } = useGetTeamsQuery({ status: 'active' });

  const teams = Array.isArray(teamsData?.data) ? teamsData.data : Array.isArray(teamsData) ? teamsData : [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    resolver: yupResolver(systemValidationSchema),
    mode: 'onBlur',
    defaultValues: {
      system_name: '',
      team_id: '',
    },
  });

  // Populate form when system is provided (edit mode)
  useEffect(() => {
    if (isEdit && system) {
      reset({
        system_name: system.system_name || '',
        team_id: String(system.team_id || ''),
      });
    } else {
      reset({ system_name: '', team_id: '' });
    }
  }, [open, system, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        // For edit mode
        await onSave({ ...data, id: system.id }).unwrap();
      } else {
        // For add mode
        await onSave(data).unwrap();
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }

      reset();
      onClose();
    } catch (error) {
      console.error('Error saving system:', error);
    }
  };

  const handleDialogClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit System' : 'Add New System'}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            {...register('system_name')}
            label="System Name"
            fullWidth
            error={!!errors.system_name}
            helperText={errors.system_name?.message}
            disabled={isLoading}
            required
            autoFocus
          />

          {/* Team Select */}
          <Controller
            name="team_id"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.team_id} disabled={teamsLoading || isLoading} required>
                <InputLabel>Team</InputLabel>
                <Select
                  {...field}
                  label="Team"
                >
                  {teamsLoading ? (
                    <MenuItem value="">
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    teams.map((team) => (
                      <MenuItem key={team.id} value={String(team.id)}>
                        {team.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            )}
          />
          {errors.team_id && <span style={{ color: 'red', fontSize: '0.75rem' }}>{errors.team_id.message}</span>}
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
    </Dialog>
  );
}
