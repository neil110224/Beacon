import React, { useEffect, useState } from 'react';
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
  Chip,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Snackbar from '../../component/reuseable/Snackbar';
import './dialogscss/SystemFormDialog.scss';

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

import { useGetTeamsQuery } from '../../features/api/team/teamApi';

const systemValidationSchema = yup.object().shape({
  system_name: yup.string().required('System name is required').trim(),
  team_id: yup.array().min(1, 'At least one team is required'),
});

export default function SystemFormDialog({
  open,
  onClose,
  system = null,
  onSave,
  isLoading = false,
  onSuccess = null
}) {
  const isEdit = !!system;
  const [submitting, setSubmitting] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });

  const { data: teamsData, isLoading: teamsLoading } = useGetTeamsQuery({
    status: 'active',
    paginate: 'none',
    pagination: 'none'
  })

  const teams = React.useMemo(() => {
    if (!teamsData) return []
    if (Array.isArray(teamsData)) return teamsData
    if (Array.isArray(teamsData?.data?.data)) return teamsData.data.data
    if (Array.isArray(teamsData?.data)) return teamsData.data
    return []
  }, [teamsData])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    reset,
    control,
  } = useForm({
    resolver: yupResolver(systemValidationSchema),
    mode: 'onSubmit',
    defaultValues: { system_name: '', team_id: [] },
  });

  useEffect(() => {
    if (isEdit && system) {
      reset({
        system_name: system.system_name || '',
        team_id: Array.isArray(system.team_id)
          ? system.team_id.map(id => String(id))
          : system.team_id
            ? [String(system.team_id)]
            : [],
      });
    } else {
      reset({ system_name: '', team_id: [] });
    }
  }, [open, system, isEdit, reset]);

  // Reset submitting when dialog closes
  useEffect(() => {
    if (!open) setSubmitting(false);
  }, [open]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = {
        ...data,
        team_id: data.team_id.map(id => String(id)),
      };
      if (isEdit) {
        await onSave({ ...formData, id: system.id });
        setSnackbar({ open: true, message: 'System updated successfully!', severity: 'success' });
      } else {
        await onSave(formData);
        setSnackbar({ open: true, message: 'System added successfully!', severity: 'success' });
        if (onSuccess) onSuccess();
      }
      reset();
      setTimeout(() => {
        setSnackbar(s => ({ ...s, open: false }));
        onClose();
      }, 1200);
    } catch (error) {
      console.error('Error saving system:', error);
      setSnackbar({ open: true, message: 'Failed to save system', severity: 'error' });
      setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 1800);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    if (submitting) return; // ✅ prevent close while saving
    reset();
    onClose();
  };

  const busy = submitting || isLoading; // ✅ combined loading state

  return (
    <>
      <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth className="systemFormDialog">
      <DialogTitle className="systemFormDialogTitle">{isEdit ? 'Edit System' : 'Create New System'}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            {...register('system_name')}
            label="System Name"
            fullWidth
            error={isSubmitted && !!errors.system_name}
            helperText={isSubmitted ? errors.system_name?.message : ''}
            disabled={busy}
            required
            autoFocus
            className="systemFormDialogField"
          />

          {/* Team Multi-Select */}
          <Controller
            name="team_id"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                error={isSubmitted && !!errors.team_id}
                disabled={teamsLoading || busy}
                required
                className="systemFormDialogField"
              >
                <InputLabel>Team</InputLabel>
                <Select
                  {...field}
                  label="Team"
                  multiple
                  value={field.value || []}
                  onChange={e => field.onChange(e.target.value)}
                  renderValue={selected => (
                    <Paper
                      className="systemFormDialogChipsWrap"
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        listStyle: 'none',
                        p: 0.5,
                        m: 0,
                        minHeight: 40,
                        boxShadow: 'none',
                      }}
                      component="ul"
                    >
                      {Array.isArray(selected) && selected.map(id => {
                        const team = teams.find(t => String(t.id) === String(id));
                        return team ? (
                          <ListItem key={id}>
                            <Chip
                              label={team.name}
                              className="systemFormDialogChip"
                              onMouseDown={e => {
                                e.stopPropagation()
                                e.preventDefault()
                              }}
                              onDelete={e => {
                                e.stopPropagation()
                                e.preventDefault()
                                const newSelected = (field.value || []).filter(
                                  selId => String(selId) !== String(id)
                                )
                                field.onChange(newSelected)
                              }}
                              sx={{
                                fontWeight: 600,
                                fontFamily: 'Oswald, sans-serif',
                              }}
                              variant="outlined"
                            />
                          </ListItem>
                        ) : null;
                      })}
                    </Paper>
                  )}
                >
                  {teamsLoading ? (
                    <MenuItem value="">
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    teams.map(team => (
                      <MenuItem key={team.id} value={String(team.id)}>
                        {team.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            )}
          />
          {isSubmitted && errors.team_id && (
            <span className="systemFormDialogErrorText" style={{ fontSize: '0.75rem' }}>{errors.team_id.message}</span>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }} className="systemFormDialogActions">
        {/* ✅ Cancel disabled while saving */}
        <Button onClick={handleDialogClose} disabled={busy} className="systemFormDialogCancelBtn">
          Cancel
        </Button>
        {/* ✅ Save shows spinner while saving */}
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={busy}
          startIcon={busy ? <CircularProgress size={20} color="inherit" /> : null}
          className="systemFormDialogSaveBtn"
        >
          {busy ? 'Saving...' : isEdit ? 'Update' : 'CREATE'}
        </Button>
      </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      />
    </>
  );
}