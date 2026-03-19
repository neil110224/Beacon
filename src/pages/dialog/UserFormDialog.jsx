import { useState, useEffect } from 'react';
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
  Snackbar,
  Alert,
  Typography,
  Chip,
  Paper,
  IconButton,
  Autocomplete,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

import { useGetTeamsQuery } from '../../features/api/team/teamApi';
import { useGetChargingQuery } from '../../features/api/charging/chargingApi';
import { useGetRolesQuery, useUpdateRoleMutation } from '../../features/api/role/roleApi';
import { useDebounce } from '../../hooks/useDebounce';
import RoleFormDialog from './RoleFormDialog';

const OSWALD = '"Oswald", sans-serif';

// Validation schema factory function
const createUserValidationSchema = (isEdit) => {
  return yup.object().shape({
    first_name: yup.string().required('First name is required').trim(),
    middle_name: yup.string().nullable(),
    last_name: yup.string().required('Last name is required').trim(),
    suffix: yup.string().nullable(),
    username: yup.string().required('Username is required').trim(),
    password: yup.string().nullable(), // Optional for both add and edit modes
    role_id: yup.string().required('Role is required'),
    charging_id: yup.string().required('Charging is required'),
    team_id: yup.string().required('Team is required'),
  });
};

/**
 * Unified User Dialog Component
 * Handles both Create (Add) and Edit modes based on props
 * 
 * @param {Object} props
 * @param {boolean} props.open - Dialog visibility
 * @param {function} props.onClose - Close handler
 * @param {Object} props.user - User data (for edit mode, null for add mode)
 * @param {function} props.onSave - Save mutation function
 * @param {boolean} props.isLoading - Loading state
 */
export default function UserFormDialog({ open, onClose, user = null, onSave, isLoading = false }) {
  const isEdit = !!user;
  const [apiLoading, setApiLoading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState(null);
  const [chargingSearchInput, setChargingSearchInput] = useState('');

  // Debounce the charging search input
  const debouncedChargingSearch = useDebounce(chargingSearchInput, 300);

  // Fetch dropdown data
  const { data: rolesData, isLoading: rolesLoading, refetch: refetchRoles } = useGetRolesQuery({ status: 'active' });
  const { data: teamsData, isLoading: teamsLoading } = useGetTeamsQuery({ status: 'active' });
  
  // Build charging query params with search term
  const chargingQueryParams = {
    status: 'active',
    ...(debouncedChargingSearch && { term: debouncedChargingSearch })
  };
  const { data: chargingData, isLoading: chargingLoading } = useGetChargingQuery(chargingQueryParams);
  const [updateRole] = useUpdateRoleMutation();

  // Extract arrays from response
  const roles = Array.isArray(rolesData?.data) ? rolesData.data : Array.isArray(rolesData) ? rolesData : [];
  const teams = Array.isArray(teamsData?.data?.data) ? teamsData.data.data : Array.isArray(teamsData?.data) ? teamsData.data : Array.isArray(teamsData) ? teamsData : [];
  const allChargingOptions = Array.isArray(chargingData?.data) ? chargingData.data : Array.isArray(chargingData) ? chargingData : [];

  // No local filtering needed since we're searching in the database
  const filteredChargingOptions = allChargingOptions;

  // React Hook Form setup with dynamic validation schema
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(createUserValidationSchema(isEdit)),
    mode: 'onBlur',
    defaultValues: {
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

  // Auto-generate username for new user
  useEffect(() => {
    if (!isEdit) {
      const firstName = watch('first_name') || '';
      const lastName = watch('last_name') || '';
      let username = '';
      if (firstName) {
        // Get initials from all words in first name
        const initials = firstName
          .split(' ')
          .filter(Boolean)
          .map(word => word.charAt(0).toUpperCase())
          .join('');
        if (lastName) {
          username = `${initials}${lastName.replace(/\s/g, '')}`;
        } else {
          username = initials;
        }
      }
      setValue('username', username);
    }
    // eslint-disable-next-line
  }, [watch('first_name'), watch('last_name')]);

  // Watch role_id to get selected role data
  const selectedRoleId = watch('role_id');
  const selectedRole = roles.find(role => String(role.id) === String(selectedRoleId));

  // Populate form when user is provided (edit mode)
  useEffect(() => {
    if (isEdit && user) {
      reset({
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        suffix: user.suffix || '',
        username: user.username || '',
        password: '', // Don't populate password in edit mode
        role_id: String(user.role?.id || ''),
        charging_id: String(user.charging?.id || ''),
        team_id: String(user.team?.id || user.team || ''),
      });
    } else {
      // Reset for add mode
      reset({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        username: '',
        password: '',
        role_id: '',
        charging_id: '',
        team_id: '',
      });
    }
  }, [open, user, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      setApiLoading(true);

      // Prepare payload
      let payload = {
        ...data,
        role_id: data.role_id ? parseInt(data.role_id, 10) : null,
        charging_id: data.charging_id ? parseInt(data.charging_id, 10) : null,
        team_id: data.team_id ? parseInt(data.team_id, 10) : null,
      };

      // For add mode: if password is not provided, use username as password
      if (!isEdit && !payload.password) {
        payload.password = payload.username;
      }

      // Remove password if empty (for edit mode)
      if (isEdit && !payload.password) delete payload.password;

      // Call the mutation with the correct format
      // For edit mode, need to pass { id, data }; for create, just payload
      const result = isEdit 
        ? await onSave({ id: user.id, data: payload }).unwrap()
        : await onSave(payload).unwrap();

      // Show success message
      setSnackbar({
        open: true,
        message: isEdit ? 'User updated successfully!' : 'User created successfully!',
        severity: 'success',
      });

      // For new user creation, set flag for force password change on first login
      // Use user ID (from response) to create a unique flag per user
      if (!isEdit) {
        console.log('New user created, result:', result); // Debug log
        
        // Try to get user ID from result (could be result.id, result.data.id, etc.)
        const userId = result?.id || result?.data?.id;
        const username = result?.username || data?.username;
        
        if (userId) {
          localStorage.setItem(`forceChangePassword_${userId}`, 'true');
          sessionStorage.setItem(`forceChangePassword_${userId}`, 'true');
          console.log(`Set password change flag for user ID: ${userId}`);
        } else if (username) {
          // Fallback to username if ID isn't available
          localStorage.setItem(`forceChangePassword_${username}`, 'true');
          sessionStorage.setItem(`forceChangePassword_${username}`, 'true');
          console.log(`Set password change flag for username: ${username}`);
        }
      }

      // Reset form and close
      setJustSaved(true);
      reset();
      setTimeout(() => {
        setJustSaved(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error saving user:', error);

      // Extract error message from API response
      let errorMessage = 'Failed to save user';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.errors) {
        // Handle field-specific errors
        const errorMessages = Object.entries(error.data.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join('; ');
        errorMessage = errorMessages || 'Validation failed';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setApiLoading(false);
    }
  };

  const handleDialogClose = () => {
    reset();
    setChargingSearchInput('');
    setSnackbar({ open: false, message: '', severity: 'success' });
    setJustSaved(false);
    onClose();
  };

  const handleEditRole = () => {
    if (user?.role) {
      setSelectedRoleForEdit(user.role);
      setRoleDialogOpen(true);
    }
  };

  const handleRoleDialogClose = () => {
    setRoleDialogOpen(false);
    setSelectedRoleForEdit(null);
    // Refetch roles to get updated permissions
    refetchRoles();
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Dialog key={user ? `edit-${user.id}` : 'add'} open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: OSWALD, fontWeight: 600 }}>{user ? 'Edit User' : 'Add New User'}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* First Name */}
          <TextField
            {...register('first_name')}
            label="First Name"
            fullWidth
            error={!!errors.first_name}
            helperText={errors.first_name?.message}
            disabled={apiLoading || isLoading}
            sx={{ '& input, & label': { fontFamily: OSWALD } }}
          />

          {/* Middle Name */}
          <TextField
            {...register('middle_name')}
            label="Middle Name"
            fullWidth
            disabled={apiLoading || isLoading}
            sx={{ '& input, & label': { fontFamily: OSWALD } }}
          />

          {/* Last Name */}
          <TextField
            {...register('last_name')}
            label="Last Name"
            fullWidth
            error={!!errors.last_name}
            helperText={errors.last_name?.message}
            disabled={apiLoading || isLoading}
            sx={{ '& input, & label': { fontFamily: OSWALD } }}
          />

          {/* Suffix */}
          <TextField
            {...register('suffix')}
            label="Suffix (optional)"
            fullWidth
            disabled={apiLoading || isLoading}
            sx={{ '& input, & label': { fontFamily: OSWALD } }}
          />

          {/* Username */}
          <TextField
            {...register('username')}
            label="Username"
            fullWidth
            error={!!errors.username}
            helperText={errors.username?.message}
            disabled={apiLoading || isLoading}
            sx={{ '& input, & label': { fontFamily: OSWALD } }}
            InputLabelProps={{ shrink: true }}
          />

          {/* Password - Only show in Add mode */}
          {!isEdit && (
            <TextField
              {...register('password')}
              label="Password (optional - will use username if empty)"
              type="password"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={apiLoading || isLoading}
              sx={{ '& input, & label': { fontFamily: OSWALD } }}
            />
          )}

          {/* Role Select - Dropdown for both Add and Edit modes */}
          <Controller
            name="role_id"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.role_id} disabled={rolesLoading || apiLoading || isLoading}>
                <InputLabel sx={{ fontFamily: OSWALD }}>Role</InputLabel>
                <Select
                  {...field}
                  label="Role"
                  sx={{ fontFamily: OSWALD }}
                >
                  {rolesLoading ? (
                    <MenuItem value="" sx={{ fontFamily: OSWALD }}>
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
          {errors.role_id && <span style={{ color: 'red', fontSize: '0.75rem', fontFamily: OSWALD }}>{errors.role_id.message}</span>}

          {/* Charging Autocomplete */}
          <Controller
            name="charging_id"
            control={control}
            render={({ field: { value, onChange } }) => {
              const selectedCharge = allChargingOptions.find(c => String(c.id) === String(value));
              return (
                <Autocomplete
                  options={filteredChargingOptions}
                  getOptionLabel={(option) => `${option.name} (${option.code})`}
                  value={selectedCharge || null}
                  onChange={(event, newValue) => {
                    onChange(newValue ? String(newValue.id) : '');
                  }}
                  inputValue={chargingSearchInput}
                  onInputChange={(event, newInputValue) => {
                    setChargingSearchInput(newInputValue);
                  }}
                  disabled={chargingLoading || apiLoading || isLoading}
                  loading={chargingLoading}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Charging"
                      error={!!errors.charging_id}
                      helperText={errors.charging_id?.message}
                      placeholder="Search by name or code..."
                      sx={{ '& input, & label': { fontFamily: OSWALD } }}
                    />
                  )}
                />
              );
            }}
          />

          {/* Team Select */}
          <Controller
            name="team_id"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.team_id} disabled={teamsLoading || apiLoading || isLoading}>
                <InputLabel sx={{ fontFamily: OSWALD }}>Team</InputLabel>
                <Select
                  {...field}
                  label="Team"
                  sx={{ fontFamily: OSWALD }}
                >
                  {teamsLoading ? (
                    <MenuItem value="" sx={{ fontFamily: OSWALD }}>
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
          {errors.team_id && <span style={{ color: 'red', fontSize: '0.75rem', fontFamily: OSWALD }}>{errors.team_id.message}</span>}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleDialogClose} disabled={apiLoading || isLoading || justSaved} sx={{ fontFamily: OSWALD }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={apiLoading || isLoading || justSaved}
          startIcon={(apiLoading || isLoading || justSaved) && <CircularProgress size={20} />}
          sx={{ fontFamily: OSWALD }}
        >
          {apiLoading || isLoading || justSaved ? 'Saving...' : isEdit ? 'Update' : 'Save'}
        </Button>
      </DialogActions>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={handleCloseSnackbar} sx={{ fontFamily: OSWALD }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Role Form Dialog for editing the user's role */}
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
