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
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/api/slice/authSlice";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import AddIcon from "@mui/icons-material/Add";
import { useDebounce } from "../../hooks/useDebounce";
import DataTable from "../../component/reuseable/DataTable";
import Confirmation from "../../component/reuseable/Confirmation";
import Snackbar from "../../component/reuseable/Snackbar";
import ChargingFormDialog from "../dialog/ChargingFormDialog";
import {
  useGetChargingQuery,
  useDeleteChargingMutation,
  useCreateChargingMutation,
} from "../../features/api/charging/chargingApi";

const Charging = () => {
  const currentUser = useSelector(selectCurrentUser);
  const userPermissions = currentUser?.role?.access_permissions || [];
  const canAddCharging = userPermissions.includes('Charging.Add');
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showArchived, setShowArchived] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [chargingDialogOpen, setChargingDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const open = Boolean(anchorEl);

  const {
    data: chargingResponse,
    isLoading,
    isError,
    error,
  } = useGetChargingQuery({ 
    status: showArchived ? "inactive" : "active",
    term: debouncedSearchTerm,
  });

  const [deleteCharging, { isLoading: isDeleting }] = useDeleteChargingMutation();
  const [createCharging] = useCreateChargingMutation();

  const chargingData = Array.isArray(chargingResponse?.data)
    ? chargingResponse.data
    : Array.isArray(chargingResponse)
    ? chargingResponse
    : [];

  // Filter charging data by debounced search term
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return chargingData;
    return chargingData.filter(item =>
      item.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [chargingData, debouncedSearchTerm]);

  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setShowArchived(newValue === 1);
  };

  const handleArchiveClick = () => {
    if (!selectedRow) return;
    setConfirmDialogOpen(true);
    setAnchorEl(null);
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
      setSelectedRow(null);
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
    setSelectedRow(null);
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
    { id: "code", label: "Code" },
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
        {canAddCharging && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedRow(null);
              setChargingDialogOpen(true);
            }}
            sx={{
              backgroundColor: '#2c3e50',
              textTransform: 'none',
              borderRadius: '8px',
              padding: '6px 20px',
              fontWeight: 500,
              '&:hover': { backgroundColor: '#34495e' },
            }}
          >
            Create
          </Button>
        )}
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
          isLoading={isLoading || searchTerm !== debouncedSearchTerm}
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
        ) : (
          <MenuItem
            onClick={handleArchiveClick}
            disabled={isDeleting}
            sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
          >
            <ArchiveIcon fontSize="small" sx={{ mr: 1.5, color: '#ed6c02' }} />
            Archive
          </MenuItem>
        )}
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

      {/* Charging Form Dialog (Add only) */}
      <ChargingFormDialog
        key="add-charging"
        open={chargingDialogOpen}
        onClose={() => {
          setChargingDialogOpen(false);
          setSelectedRow(null);
        }}
        charging={null}  // Always null for add mode only
        onSave={createCharging}
        isLoading={false}
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