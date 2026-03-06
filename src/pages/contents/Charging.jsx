import React, { useState, useMemo } from "react";
import { Box, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/api/slice/authSlice";
import Nodata from '../../component/reuseable/Nodata'
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import { useDebounce } from "../../hooks/useDebounce";
import DataTable from "../../component/reuseable/DataTable";
import Confirmation from "../../component/reuseable/Confirmation";
import Snackbar from "../../component/reuseable/Snackbar";
import ChargingFormDialog from "../dialog/ChargingFormDialog";
import "../contentscss/Charging.scss";
import {
  useGetChargingQuery,
  useDeleteChargingMutation,
  useCreateChargingMutation,
} from "../../features/api/charging/chargingApi";
import MasterlistTab from "../../component/reuseable/MasterlistTab";

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
    refetch,
  } = useGetChargingQuery({ 
    status: showArchived ? "inactive" : "active",
    term: debouncedSearchTerm,
  });

  const [deleteCharging, { isLoading: isDeleting }] = useDeleteChargingMutation();
  const [createCharging] = useCreateChargingMutation();

  const chargingData = Array.isArray(chargingResponse?.data) ? chargingResponse.data : Array.isArray(chargingResponse) ? chargingResponse : [];

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return chargingData;
    return chargingData.filter(item => item.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  }, [chargingData, debouncedSearchTerm]);

  const handleMenuClick = (event, row) => { setAnchorEl(event.currentTarget); setSelectedRow(row); };
  const handleClose = () => { setAnchorEl(null); };
  const handleTabChange = (event, newValue) => { setShowArchived(newValue === 1); };
  const handleArchiveClick = () => { if (!selectedRow) return; setConfirmDialogOpen(true); setAnchorEl(null); };

  const handleConfirmArchive = async () => {
    if (!selectedRow) return;
    try {
      await deleteCharging(selectedRow.id).unwrap();
      const action = selectedRow.deleted_at ? "restored" : "archived";
      setSnackbar({ open: true, message: `Charging record ${action} successfully!`, severity: "success" });
      setSelectedRow(null);
      setConfirmDialogOpen(false);
    } catch (err) {
      console.error("Failed to archive/restore:", err);
      setSnackbar({ open: true, message: "Failed to archive/restore charging record", severity: "error" });
      setConfirmDialogOpen(false);
    }
  };

  const handleConfirmDialogClose = () => { setConfirmDialogOpen(false); setSelectedRow(null); };
  const handleSnackbarClose = () => { setSnackbar((prev) => ({ ...prev, open: false })); };

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
        <IconButton className="chargingActionButton" onClick={(e) => handleMenuClick(e, row)}>
          <MoreVertIcon className="chargingMenuIcon" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box className="chargingContainer">
      <MasterlistTab
  showArchived={showArchived}
  onTabChange={handleTabChange}
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="Search Charging..."
  canAdd={canAddCharging}
  onAddClick={() => setChargingDialogOpen(true)}
  addLabel="Add Charging"
  onRefresh={refetch}
/>

      {!isLoading && chargingData.length === 0 && (
        <Box className="chargingEmptyStateWrapper">
          <Box className="chargingEmptyStateBox">
            <Box>
              <Nodata />
            </Box>
            <Box className="chargingEmptyTextBox">
              <Typography variant="h6" className="chargingEmptyTitle">
                Charging
              </Typography>
              <Typography variant="body2">
                {showArchived
                  ? "Currently no charging records in the archive."
                  : "No charging data available."}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {!isError && (
        <DataTable
          columns={columns}
          rows={filteredData}
          totalCount={filteredData.length}
          isLoading={isLoading || searchTerm !== debouncedSearchTerm}
          isError={isError}
          tableSx={{
            minWidth: 800,
            '& .MuiTableCell-root': { padding: '10px 14px', fontSize: '0.875rem', color: '#2c3e50' },
            '& .MuiTableBody-root .MuiTableRow-root': { cursor: 'default' },
          }}
          headSx={{
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            '& th': { fontWeight: 600, color: '#ffffff !important', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '14px' },
          }}
        />
      )}

      <Menu
        className="chargingMenu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ elevation: 3, sx: { borderRadius: '8px', mt: 1, minWidth: 160 } }}
      >
        {selectedRow?.deleted_at ? (
          <MenuItem onClick={handleArchiveClick} disabled={isDeleting}>
            <RestoreIcon fontSize="small" className="chargingMenuItemRestore" sx={{ mr: 1.5 }} />
            Restore
          </MenuItem>
        ) : (
          <MenuItem onClick={handleArchiveClick} disabled={isDeleting}>
            <ArchiveIcon fontSize="small" className="chargingMenuItemArchive" sx={{ mr: 1.5 }} />
            Archive
          </MenuItem>
        )}
      </Menu>

      {selectedRow && (
        <Confirmation
          open={confirmDialogOpen}
          onClose={handleConfirmDialogClose}
          onConfirm={handleConfirmArchive}
          title={`Confirm ${selectedRow.deleted_at ? 'Restore' : 'Archive'}`}
          message={`Are you sure you want to ${selectedRow.deleted_at ? 'restore' : 'archive'} this charging record?`}
        />
      )}

      <ChargingFormDialog
        key="add-charging"
        open={chargingDialogOpen}
        onClose={() => { setChargingDialogOpen(false); setSelectedRow(null); }}
        charging={null}
        onSave={createCharging}
        isLoading={false}
      />

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