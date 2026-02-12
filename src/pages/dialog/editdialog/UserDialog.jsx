import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useGetRolesQuery } from '../../../features/api/role/roleApi';
import { useGetTeamsQuery } from '../../../features/api/team/teamApi';
import { useGetChargingQuery } from '../../../features/api/charging/chargingApi'; // Add this import

export default function EditUserDialog({ open, onClose, user, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    username: '',
    role_id: '',
    charging_id: '',
    team_id: '',
  });

  // Fetch roles, teams, and charging
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
  const { data: teamsData, isLoading: teamsLoading } = useGetTeamsQuery();
  const { data: chargingData, isLoading: chargingLoading } = useGetChargingQuery(); // Add this

  // Extract roles, teams, and charging from response
  const roles = rolesData?.data || rolesData || [];
  const teams = teamsData?.data || teamsData || [];
  const chargingOptions = chargingData?.data || chargingData || []; // Add this

  // Reset form when user changes or dialog opens
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        suffix: user.suffix || '',
        username: user.username || '',
        role_id: String(user.role?.id || ''),
        charging_id: String(user.charging?.id || ''),
        team_id: String(user.team?.id || user.team || ''),
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // Convert back to numbers if your API expects them
    const dataToSend = {
      ...formData,
      role_id: formData.role_id ? parseInt(formData.role_id, 10) : null,
      charging_id: formData.charging_id ? parseInt(formData.charging_id, 10) : null,
      team_id: formData.team_id ? parseInt(formData.team_id, 10) : null,
    };
    onSave(dataToSend);
  };

  const handleCancel = () => {
    onClose();
  };



  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Middle Name"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Suffix"
              name="suffix"
              value={formData.suffix}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </Grid>

          {/* Role Select */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="role_id"
                value={rolesLoading ? '' : formData.role_id}
                onChange={handleChange}
                disabled={rolesLoading}
              >
                {rolesLoading ? (
                  <MenuItem value="">
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  roles.map((role) => (
                    <MenuItem key={role.id} value={String(role.id)}>
                      {role.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Charging Select - UPDATED */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Charging</InputLabel>
              <Select
                name="charging_id"
                value={chargingLoading ? '' : formData.charging_id}
                onChange={handleChange}
                disabled={chargingLoading}
              >
                {chargingLoading ? (
                  <MenuItem value="">
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  chargingOptions.map((charging) => (
                    <MenuItem key={charging.id} value={String(charging.id)}>
                      {charging.name} ({charging.code})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Team Select */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Team</InputLabel>
              <Select
                name="team_id"
                value={teamsLoading ? '' : formData.team_id}
                onChange={handleChange}
                disabled={teamsLoading}
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
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}  
          startIcon={isLoading && <CircularProgress size={20} />}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}