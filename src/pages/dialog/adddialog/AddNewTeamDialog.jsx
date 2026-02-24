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

const AddNewTeamDialog = ({ open, onClose, onSave, isLoading }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState(""); // ✅ Added state for code

  const handleSubmit = () => {
    if (!name.trim() || !code.trim()) return;

    const payload = { teams: [{ name: name.trim(), code: code.trim() }] };
    console.log("CREATE TEAM PAYLOAD:", payload);
    onSave(payload);
    
    // Reset form after submission
    setName("");
    setCode("");
  };

  const handleClose = () => {
    setName("");
    setCode("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Team</DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Team Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            autoFocus
          />
          <TextField
            label="Team Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
            required
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !name.trim() || !code.trim()} // ✅ Disable if code is empty
          startIcon={isLoading && <CircularProgress size={20} />}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNewTeamDialog;