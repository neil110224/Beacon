import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Alert,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DataTable from "../../component/reuseable/DataTable";
import Confirmation from "../../component/reuseable/Confirmation";
import Snackbar from "../../component/reuseable/Snackbar";
import AddNewChargingDialog from "../dialog/adddialog/AddNewChargingDialog";
import {
  useGetChargingQuery,
  useDeleteChargingMutation,
  useCreateChargingMutation,
} from "../../features/api/charging/chargingApi";

const Charging = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const open = Boolean(anchorEl);

  const {
    data: chargingResponse,
    isLoading,
    isError,
    error,
  } = useGetChargingQuery({ status: showArchived ? "inactive" : "active" });

  const [deleteCharging, { isLoading: isDeleting }] = useDeleteChargingMutation();
  const [createCharging] = useCreateChargingMutation();

  const chargingData = Array.isArray(chargingResponse?.data)
    ? chargingResponse.data
    : Array.isArray(chargingResponse)
    ? chargingResponse
    : [];

  const filteredData = useMemo(() => {
    if (!Array.isArray(chargingData)) return [];
    return chargingData.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, chargingData]);

  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleTabChange = (event, newValue) => {
    setShowArchived(newValue === 1);
  };

  const handleArchiveClick = () => {
    if (!selectedRow) return;
    setConfirmDialogOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!selectedRow) return;
    try {
      await deleteCharging(selectedRow.id).unwrap();
      const action = selectedRow.deleted_at ? "restored" : "archived";
      setSnackbar({
        open: true,
        message: `Charging record ${action} successfully!`,
        severity: "success",
      });
      handleClose();
      setConfirmDialogOpen(false);
    } catch (err) {
      console.error("Failed to archive/restore:", err);
      setSnackbar({
        open: true,
        message: "Failed to archive/restore charging record",
        severity: "error",
      });
      setConfirmDialogOpen(false);
    }
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    { id: "id", label: "ID" },
    { id: "name", label: "Name" },
    {
      id: "created_at",
      label: "Created At",
      render: (row) => formatDate(row.created_at),
    },
    {
      id: "updated_at",
      label: "Updated At",
      render: (row) => formatDate(row.updated_at),
    },
    {
      id: "actions",
      label: "",
      align: "center",
      render: (row) => (
        <IconButton
          onClick={(e) => handleMenuClick(e, row)}
          sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
        >
          <MoreVertIcon sx={{ fontSize: '1.2rem', color: '#5f6368' }} />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Search Bar and Add Button */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <TextField
          placeholder="Search charging..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9e9e9e' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: '#fff',
              '&:hover fieldset': { borderColor: '#2c3e50' },
              '&.Mui-focused fieldset': { borderColor: '#2c3e50' },
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
          sx={{
            backgroundColor: '#2c3e50',
            textTransform: 'none',
            borderRadius: '8px',
            padding: '6px 20px',
            fontWeight: 500,
            '&:hover': { backgroundColor: '#34495e' },
          }}
        >
          Add
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={showArchived ? 1 : 0}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              minHeight: 42,
              color: '#666',
              '&.Mui-selected': { color: '#2c3e50' },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2c3e50',
              height: 2,
            },
          }}
        >
          <Tab label="Active" />
          <Tab label="Archived" />
        </Tabs>
      </Box>

      {/* Empty / Error State */}
      {!isLoading && chargingData.length === 0 && (
        <Box mb={2}>
          <Alert severity="info">
            {showArchived
              ? "Currently no charging records in the archive."
              : "No charging data available."}
          </Alert>
        </Box>
      )}

      {/* Table */}
      {chargingData.length > 0 && !isError && (
        <DataTable
          columns={columns}
          rows={filteredData}
          totalCount={filteredData.length}
          isLoading={isLoading}
          isError={isError}
          tableSx={{
            minWidth: 800,
            '& .MuiTableCell-root': {
              padding: '10px 14px',
              fontSize: '0.875rem',
              color: '#2c3e50',
            },
            '& .MuiTableBody-root .MuiTableRow-root': { cursor: 'default' },
          }}
          headSx={{
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            '& th': {
              fontWeight: 600,
              color: '#ffffff !important',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '14px',
            },
          }}
        />
      )}

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: '8px', mt: 1, minWidth: 160 },
        }}
      >
        {selectedRow?.deleted_at ? (
          <MenuItem
            onClick={handleArchiveClick}
            disabled={isDeleting}
            sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
          >
            <RestoreIcon fontSize="small" sx={{ mr: 1.5, color: '#2e7d32' }} />
            Restore
          </MenuItem>
        ) : [
          <MenuItem
            key="edit"
            onClick={() => { handleClose(); }}
            sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1.5, color: '#1976d2' }} />
            Edit
          </MenuItem>,
          <MenuItem
            key="archive"
            onClick={handleArchiveClick}
            disabled={isDeleting}
            sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
          >
            <ArchiveIcon fontSize="small" sx={{ mr: 1.5, color: '#ed6c02' }} />
            Archive
          </MenuItem>,
        ]}
      </Menu>

      {/* Archive / Restore Confirmation */}
      {selectedRow && (
        <Confirmation
          open={confirmDialogOpen}
          onClose={handleConfirmDialogClose}
          onConfirm={handleConfirmArchive}
          title={`Confirm ${selectedRow.deleted_at ? 'Restore' : 'Archive'}`}
          message={`Are you sure you want to ${selectedRow.deleted_at ? 'restore' : 'archive'} this charging record?`}
        />
      )}

      {/* Add Charging Dialog */}
      <AddNewChargingDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={(data) => createCharging(data)}
        onSuccess={(message) => setSnackbar({ open: true, message, severity: "success" })}
        onError={(message) => setSnackbar({ open: true, message, severity: "error" })}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />
    </Box>
  );
};

export default Charging;