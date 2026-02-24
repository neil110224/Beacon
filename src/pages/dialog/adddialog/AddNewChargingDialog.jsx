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
} from "@mui/material";

const AddNewChargingDialog = ({ open, onClose, onSave, onSuccess, onError }) => {
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.code.trim()) newErrors.code = "Code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setFormData({ name: "", code: "" });
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Wrap payload to match API expectation
    const payload = {
      departments: [
        {
          name: formData.name.trim(),
          code: formData.code.trim(),
        },
      ],
    };

    try {
      setLoading(true);
      const result = await onSave(payload).unwrap();
      console.log("CHARGING CREATED:", result);

      if (onSuccess) onSuccess("Charging record added successfully!");

      setFormData({ name: "", code: "" });
      setErrors({});
      onClose();
    } catch (err) {
      console.error("Failed to add charging:", err);
      
      // Show Laravel validation errors if available
      const laravelErrors = err?.data?.errors;
      if (laravelErrors) {
        const mapped = {};
        // Handle nested errors like departments.0.name
        Object.entries(laravelErrors).forEach(([key, messages]) => {
          if (key.includes("name")) mapped.name = messages[0];
          if (key.includes("code")) mapped.code = messages[0];
        });
        if (Object.keys(mapped).length > 0) {
          setErrors(mapped);
          return;
        }
      }

      const message = err?.data?.message || "Failed to add charging record. Please try again.";
      if (onError) onError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: "#2c3e50" }}>
        Add New Charging
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            placeholder="e.g., Standard Charging"
            error={Boolean(errors.name)}
            helperText={errors.name}
            disabled={loading}
          />
          <TextField
            label="Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            fullWidth
            placeholder="e.g., 10019"
            error={Boolean(errors.code)}
            helperText={errors.code}
            disabled={loading}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleCancel}
          disabled={loading}
          sx={{ textTransform: "none", color: "#666" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{
            backgroundColor: "#2c3e50",
            textTransform: "none",
            borderRadius: "8px",
            px: 3,
            "&:hover": { backgroundColor: "#34495e" },
          }}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNewChargingDialog;