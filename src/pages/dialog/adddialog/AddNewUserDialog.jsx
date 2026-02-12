import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Slide,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

import { useGetRolesQuery } from "../../../features/api/role/roleApi";
import { useGetTeamsQuery } from "../../../features/api/team/teamApi";
import { useGetChargingQuery } from "../../../features/api/charging/chargingApi";

// Slide transition from right
function SlideTransition(props) {
  return <Slide {...props} direction="left" {...props} />;
}

const AddNewUserDialog = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    username: "",
    password: "",
    role_id: "",
    charging_id: "",
    team_id: "",
  });

  const [loading, setLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, success: true, message: "" });

  // Fetch roles, teams, and charging options
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
  const { data: teamsData, isLoading: teamsLoading } = useGetTeamsQuery();
  const { data: chargingData, isLoading: chargingLoading } = useGetChargingQuery();

  const roles = rolesData?.data || rolesData || [];
  const teams = teamsData?.data || teamsData || [];
  const chargingOptions = chargingData?.data || chargingData || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      role_id: formData.role_id ? parseInt(formData.role_id, 10) : null,
      charging_id: formData.charging_id ? parseInt(formData.charging_id, 10) : null,
      team_id: formData.team_id ? parseInt(formData.team_id, 10) : null,
    };

    try {
      setLoading(true);
      const result = await onSave(payload).unwrap(); // RTK mutation
      console.log("USER CREATED:", result);

      // Show success snackbar
      setSnackbar({
        open: true,
        success: true,
        message: "User added successfully!",
      });

      // Close the dialog
      onClose();

      // Reset form
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        username: "",
        password: "",
        role_id: "",
        charging_id: "",
        team_id: "",
      });
    } catch (err) {
      console.error("Failed to add user:", err);
      setSnackbar({
        open: true,
        success: false,
        message: "Failed to add user. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>

        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Middle Name"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Suffix"
              name="suffix"
              value={formData.suffix}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
            />

            {/* Role Select */}
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="role_id"
                value={rolesLoading ? "" : formData.role_id}
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

            {/* Charging Select */}
            <FormControl fullWidth>
              <InputLabel>Charging</InputLabel>
              <Select
                name="charging_id"
                value={chargingLoading ? "" : formData.charging_id}
                onChange={handleChange}
                disabled={chargingLoading}
              >
                {chargingLoading ? (
                  <MenuItem value="">
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  chargingOptions.map((charge) => (
                    <MenuItem key={charge.id} value={String(charge.id)}>
                      {charge.name} ({charge.code})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Team Select */}
            <FormControl fullWidth>
              <InputLabel>Team</InputLabel>
              <Select
                name="team_id"
                value={teamsLoading ? "" : formData.team_id}
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
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        onClose={handleSnackbarClose}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={SlideTransition}
        sx={{
          "& .MuiSnackbarContent-root": {
            bgcolor: snackbar.success ? "green" : "red",
            display: "flex",
            alignItems: "center",
            gap: 1,
          },
        }}
        message={
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {snackbar.success ? <CheckCircleIcon /> : <ErrorIcon />}
            {snackbar.message}
          </span>
        }
      />
    </>
  );
};

export default AddNewUserDialog;
