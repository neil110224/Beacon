import React, { useState } from "react";
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
  Slide,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

const AddNewCategoryDialog = ({ open, onClose, onSave, onSuccess, onError }) => {
  const [formData, setFormData] = useState({ name: "" });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, success: true, message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    setFormData({ name: "" });
    onClose();
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      // Show validation error in parent snackbar
      if (onError) onError("Please fill in the category name");
      return;
    }

    try {
      setLoading(true);
      const result = await onSave(formData).unwrap();
      console.log("CATEGORY CREATED:", result);

      // Notify parent of success
      if (onSuccess) onSuccess("Category added successfully!");

      onClose();
      setFormData({ name: "" });
    } catch (err) {
      console.error("Failed to add category:", err);

      // Notify parent of error
      if (onError) onError("Failed to add category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Category</DialogTitle>

        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., Bug, Enhancement, Feature"
            />
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
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              backgroundColor: '#2c3e50',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#34495e' },
            }}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inline Snackbar for validation errors */}
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

export default AddNewCategoryDialog;