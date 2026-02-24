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

import { useGetTeamsQuery } from "../../../features/api/team/teamApi";

// Slide transition from right
function SlideTransition(props) {
  return <Slide {...props} direction="left" {...props} />;
}

const AddNewSystemDialog = ({ open, onClose, onSave, onSuccess }) => {
  const [formData, setFormData] = useState({
    system_name: "",
    team_id: "",
  });

  const [loading, setLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, success: true, message: "" });

  // Fetch teams
  const { data: teamsData, isLoading: teamsLoading } = useGetTeamsQuery({ status: 'active' });

  const teams = Array.isArray(teamsData?.data) ? teamsData.data : Array.isArray(teamsData) ? teamsData : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleCancel = () => {
    // Reset form data
    setFormData({
      system_name: "",
      team_id: "",
    });
    // Close the dialog
    onClose();
  };

  const handleSubmit = async () => {
    if (!formData.system_name.trim() || !formData.team_id) {
      setSnackbar({
        open: true,
        success: false,
        message: "Please fill in all required fields",
      });
      return;
    }

    const payload = {
      ...formData,
    };

    try {
      setLoading(true);
      const result = await onSave(payload).unwrap(); // RTK mutation
      console.log("SYSTEM CREATED:", result);

      // Show success snackbar
      setSnackbar({
        open: true,
        success: true,
        message: "System added successfully!",
      });

      // Refetch systems list
      if (onSuccess) {
        onSuccess();
      }

      // Close the dialog
      onClose();

      // Reset form
      setFormData({
        system_name: "",
        team_id: "",
      });
    } catch (err) {
      console.error("Failed to add system:", err);
      setSnackbar({
        open: true,
        success: false,
        message: "Failed to add system. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Add New System</DialogTitle>

        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="System Name"
              name="system_name"
              value={formData.system_name}
              onChange={handleChange}
              fullWidth
              required
            />

            {/* Team Select */}
            <TextField
              label="Team"
              name="team_id"
              value={formData.team_id}
              onChange={handleChange}
              select
              fullWidth
              required
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
            disabled={loading || !formData.system_name.trim() || !formData.team_id}
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

export default AddNewSystemDialog;