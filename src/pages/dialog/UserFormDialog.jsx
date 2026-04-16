import { useState } from 'react';
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
  Autocomplete,
} from '@mui/material';
import './dialogscss/UserFormdialog.scss';

import { useLazyGetTeamsQuery } from '../../features/api/team/teamApi';
import { useLazyGetChargingQuery } from '../../features/api/charging/chargingApi';
import { useLazyGetRolesQuery, useUpdateRoleMutation } from '../../features/api/role/roleApi';
import RoleFormDialog from './RoleFormDialog';

const OSWALD = '"Oswald", sans-serif';

const userValidationSchema = yup.object().shape({
  first_name: yup.string().required('First name is required').trim(),
  middle_name: yup.string().nullable(),
  last_name: yup.string().required('Last name is required').trim(),
  suffix: yup.string().nullable(),
  username: yup.string().required('Username is required').trim(),
  password: yup.string().nullable(),
  role_id: yup.string().required('Role is required'),
  charging_id: yup.string().required('Charging is required'),
  team_id: yup.string().required('Team is required'),
});

const generateUsername = (firstName, lastName) => {
  if (!firstName) return '';
  const initials = firstName
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  return lastName ? `${initials}${lastName.replace(/\s/g, '')}` : initials;
};


export default function UserFormDialog({ open, onClose, user = null, onSave, isLoading = false, onShowSnackbar }) {
  const isEdit = !!user;
  const [apiLoading, setApiLoading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState(null);
  const [chargingSearchInput, setChargingSearchInput] = useState('');
  // Track if fetch has already been called for each select
  const [hasFetchedRoles, setHasFetchedRoles] = useState(false);
  const [hasFetchedTeams, setHasFetchedTeams] = useState(false);
  const [hasFetchedCharging, setHasFetchedCharging] = useState(false);

  const [fetchRoles, { data: rolesData, isLoading: rolesLoading }] = useLazyGetRolesQuery();
  const [fetchTeams, { data: teamsData, isLoading: teamsLoading }] = useLazyGetTeamsQuery();
  const [fetchCharging, { data: chargingData, isLoading: chargingLoading }] = useLazyGetChargingQuery();

  const [updateRole] = useUpdateRoleMutation();

  // Only fetch all options in create mode. In edit, use the user's current values.
  const roles = Array.isArray(rolesData?.data)
    ? rolesData.data
    : Array.isArray(rolesData)
      ? rolesData
      : (isEdit && user && user.role ? [user.role] : []);

  const teams = Array.isArray(teamsData?.data?.data)
    ? teamsData.data.data
    : Array.isArray(teamsData?.data)
      ? teamsData.data
      : Array.isArray(teamsData)
        ? teamsData
        : (isEdit && user && user.team ? [user.team] : []);

  const allChargingOptions = Array.isArray(chargingData?.data)
    ? chargingData.data
    : Array.isArray(chargingData)
      ? chargingData
      : (isEdit && user && user.charging ? [user.charging] : []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm({
    resolver: yupResolver(userValidationSchema),
    mode: 'onBlur',
    defaultValues: isEdit && user
      ? {
          first_name: user.first_name || '',
          middle_name: user.middle_name || '',
          last_name: user.last_name || '',
          suffix: user.suffix || '',
          username: user.username || '',
          password: '',
          role_id: String(user.role?.id || ''),
          charging_id: String(user.charging?.id || ''),
          team_id: String(user.team?.id || user.team || ''),
        }
      : {
          first_name: '',
          middle_name: '',
          last_name: '',
          suffix: '',
          username: '',
          password: '',
          role_id: '',
          charging_id: '',
          team_id: '',
        },
  });

  const handleRoleFieldOpen = () => {
    if (!hasFetchedRoles) {
      fetchRoles({ status: 'active' });
      setHasFetchedRoles(true);
    }
  };

  const handleTeamFieldOpen = () => {
    if (!hasFetchedTeams) {
      fetchTeams({ status: 'active' });
      setHasFetchedTeams(true);
    }
  };

  const handleChargingFieldFocus = () => {
    if (!hasFetchedCharging) {
      fetchCharging({ status: 'active' });
      setHasFetchedCharging(true);
    }
  };

  // Reset fetch flags when dialog is closed
  // Only one handleDialogClose should exist. Remove duplicate below.

  const handleChargingInputChange = (_, newInputValue) => {
    setChargingSearchInput(newInputValue);
    // Do not fetch here; only update input value. Fetching will be handled on focus.
  };

  const onSubmit = async (data) => {
    try {
      setApiLoading(true);

      const payload = {
        ...data,
        role_id: data.role_id ? parseInt(data.role_id, 10) : null,
        charging_id: data.charging_id ? parseInt(data.charging_id, 10) : null,
        team_id: data.team_id ? parseInt(data.team_id, 10) : null,
      };

      if (!isEdit && !payload.password) payload.password = payload.username;
      if (isEdit && !payload.password) delete payload.password;

      const result = isEdit
        ? await onSave({ id: user.id, data: payload }).unwrap()
        : await onSave(payload).unwrap();

      if (onShowSnackbar) {
        onShowSnackbar({
          message: isEdit ? 'User updated successfully!' : 'User created successfully!',
          severity: 'success',
        });
      }

      if (!isEdit) {
        const userId = result?.id || result?.data?.id;
        const username = result?.username || data?.username;
        const key = userId ? `forceChangePassword_${userId}` : username ? `forceChangePassword_${username}` : null;
        if (key) {
          localStorage.setItem(key, 'true');
          sessionStorage.setItem(key, 'true');
        }
      }

      setJustSaved(true);
      reset();
      setTimeout(() => {
        setJustSaved(false);
        onClose();
      }, 500);
    } catch (error) {
      let errorMessage = 'Failed to save user';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.errors) {
        errorMessage = Object.entries(error.data.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join('; ') || 'Validation failed';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      if (onShowSnackbar) onShowSnackbar({ message: errorMessage, severity: 'error' });
    } finally {
      setApiLoading(false);
    }
  };

  const handleDialogClose = () => {
    reset();
    setChargingSearchInput('');
    setJustSaved(false);
    setHasFetchedCharging(false);
    setHasFetchedRoles(false);
    setHasFetchedTeams(false);
    onClose();
  };

  const handleRoleDialogClose = () => {
    setRoleDialogOpen(false);
    setSelectedRoleForEdit(null);
    fetchRoles({ status: 'active' });
  };

  const isDisabled = apiLoading || isLoading;

  return (
    <Dialog key={user ? `edit-${user.id}` : 'add'} open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth className="userFormDialog">
      <DialogTitle sx={{ fontFamily: OSWALD, fontWeight: 600 }} className="userFormDialogTitle">
        {isEdit ? 'Edit User' : 'Add New User'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            {...register('first_name')}
            label="First Name"
            fullWidth
            error={!!errors.first_name}
            helperText={errors.first_name?.message}
            disabled={isDisabled}
            className="userFormDialogField"
            sx={{ '& input, & label': { fontFamily: OSWALD } }}
            onChange={(e) => {
              setValue('first_name', e.target.value);
              if (!isEdit) {
                setValue('username', generateUsername(e.target.value, control._formValues.last_name));
              }
            }}
          />

          <TextField
            {...register('middle_name')}
            label="Middle Name"
            fullWidth
            disabled={isDisabled}
            className="userFormDialogField"
            sx={{ '& input, & label': { fontFamily: OSWALD } }}
          />

          <TextField
            {...register('last_name')}
            label="Last Name"
            fullWidth
            error={!!errors.last_name}
            helperText={errors.last_name?.message}
            disabled={isDisabled}
            className="userFormDialogField"
            sx={{ '& input, & label': { fontFamily: OSWALD } }}
            onChange={(e) => {
              setValue('last_name', e.target.value);
              if (!isEdit) {
                setValue('username', generateUsername(control._formValues.first_name, e.target.value));
              }
            }}
          />

          <TextField
            {...register('suffix')}
            label="Suffix (optional)"
            fullWidth
            disabled={isDisabled}
            className="userFormDialogField"
            sx={{ '& input, & label': { fontFamily: OSWALD } }}
          />

          <TextField
            {...register('username')}
            label="Username"
            fullWidth
            error={!!errors.username}
            helperText={errors.username?.message}
            disabled={isDisabled}
            className="userFormDialogField"
            sx={{ '& input, & label': { fontFamily: OSWALD } }}
            InputLabelProps={{ shrink: true }}
          />

          {!isEdit && (
            <TextField
              {...register('password')}
              label="Password (optional - will use username if empty)"
              type="password"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isDisabled}
              className="userFormDialogField"
              sx={{ '& input, & label': { fontFamily: OSWALD } }}
            />
          )}

          <Controller
            name="role_id"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.role_id} disabled={rolesLoading || isDisabled} className="userFormDialogField">
                <InputLabel sx={{ fontFamily: OSWALD }}>Role</InputLabel>
                <Select {...field} label="Role" sx={{ fontFamily: OSWALD }} onOpen={handleRoleFieldOpen}>
                  {rolesLoading ? (
                    <MenuItem value="">
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    roles.map((role) => (
                      <MenuItem key={role.id} value={String(role.id)} sx={{ fontFamily: OSWALD }}>
                        {role.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            )}
          />
          {errors.role_id && (
            <span className="userFormDialogErrorText" style={{ fontSize: '0.75rem', fontFamily: OSWALD }}>
              {errors.role_id.message}
            </span>
          )}

          <Controller
            name="charging_id"
            control={control}
            render={({ field: { value, onChange } }) => {
              const selectedCharge = allChargingOptions.find(c => String(c.id) === String(value));
              return (
                <Autocomplete
                  options={allChargingOptions}
                  getOptionLabel={(option) => `${option.name} (${option.code})`}
                  value={selectedCharge || null}
                  onChange={(_, newValue) => onChange(newValue ? String(newValue.id) : '')}
                  inputValue={chargingSearchInput}
                  onInputChange={handleChargingInputChange}
                  disabled={isDisabled}
                  loading={chargingLoading}
                  loadingText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2 }}>
                      <CircularProgress size={20} />
                      Loading...
                    </Box>
                  }
                  fullWidth
                  className="userFormDialogField"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Charging"
                      error={!!errors.charging_id}
                      helperText={errors.charging_id?.message}
                      placeholder="Search by name or code..."
                      sx={{ '& input, & label': { fontFamily: OSWALD } }}
                      onFocus={handleChargingFieldFocus}
                    />
                  )}
                />
              );
            }}
          />

          <Controller
            name="team_id"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.team_id} disabled={teamsLoading || isDisabled} className="userFormDialogField">
                <InputLabel sx={{ fontFamily: OSWALD }}>Team</InputLabel>
                <Select {...field} label="Team" sx={{ fontFamily: OSWALD }} onOpen={handleTeamFieldOpen}>
                  {teamsLoading ? (
                    <MenuItem value="">
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    teams.map((team) => (
                      <MenuItem key={team.id} value={String(team.id)} sx={{ fontFamily: OSWALD }}>
                        {team.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            )}
          />
          {errors.team_id && (
            <span className="userFormDialogErrorText" style={{ fontSize: '0.75rem', fontFamily: OSWALD }}>
              {errors.team_id.message}
            </span>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }} className="userFormDialogActions">
        <Button onClick={handleDialogClose} disabled={isDisabled || justSaved} sx={{ fontFamily: OSWALD }} className="userFormDialogCancelBtn">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isDisabled || justSaved}
          startIcon={(isDisabled || justSaved) && <CircularProgress size={20} />}
          sx={{ fontFamily: OSWALD }}
          className="userFormDialogSaveBtn"
        >
          {isDisabled || justSaved ? 'Saving...' : isEdit ? 'Update' : 'CREATE'}
        </Button>
      </DialogActions>

      {isEdit && selectedRoleForEdit && (
        <RoleFormDialog
          key={`role-edit-${selectedRoleForEdit.id}`}
          open={roleDialogOpen}
          onClose={handleRoleDialogClose}
          role={selectedRoleForEdit}
          onSave={updateRole}
          isLoading={false}
        />
      )}
    </Dialog>
  );
}