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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

// Slide transition from right
function SlideTransition(props) {
  return <Slide {...props} direction="left" {...props} />;
}

const AddNewCategoryDialog = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
  });

  const [loading, setLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, success: true, message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: "",
    });
    // Close the dialog
    onClose();
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setSnackbar({
        open: true,
        success: false,
        message: "Please fill in the category name",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await onSave(formData).unwrap();
      console.log("CATEGORY CREATED:", result);

      // Show success snackbar
      setSnackbar({
        open: true,
        success: true,
        message: "Category added successfully!",
      });

      // Close the dialog
      onClose();

      // Reset form
      setFormData({
        name: "",
      });
    } catch (err) {
      console.error("Failed to add category:", err);
      setSnackbar({
        open: true,
        success: false,
        message: "Failed to add category. Please try again.",
      });
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

export default AddNewCategoryDialog;
