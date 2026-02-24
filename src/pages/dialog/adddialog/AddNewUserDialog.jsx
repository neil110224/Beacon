import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
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
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery({ status: 'active' });
  const { data: teamsData, isLoading: teamsLoading } = useGetTeamsQuery({ status: 'active' });
  const { data: chargingData, isLoading: chargingLoading } = useGetChargingQuery({ status: 'active' });

  const roles = Array.isArray(rolesData?.data) ? rolesData.data : Array.isArray(rolesData) ? rolesData : [];
  const teams = Array.isArray(teamsData?.data) ? teamsData.data : Array.isArray(teamsData) ? teamsData : [];
  const chargingOptions = Array.isArray(chargingData?.data) ? chargingData.data : Array.isArray(chargingData) ? chargingData : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleCancel = () => {
    // Reset form data
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
    // Close the dialog
    onClose();
  };

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
      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
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
            <TextField
              label="Role"
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              select
              fullWidth
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
            </TextField>

            {/* Charging Select */}
            <TextField
              label="Charging"
              name="charging_id"
              value={formData.charging_id}
              onChange={handleChange}
              select
              fullWidth
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
            </TextField>

            {/* Team Select */}
            <TextField
              label="Team"
              name="team_id"
              value={formData.team_id}
              onChange={handleChange}
              select
              fullWidth
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
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancel} disabled={loading}>
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
