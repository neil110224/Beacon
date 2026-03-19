import React, { useState, useMemo } from "react";
import { Box, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/api/slice/authSlice";
import Nodata from '../../component/reuseable/Nodata'
import { useDebounce } from "../../hooks/useDebounce";
import DataTable from "../../component/reuseable/DataTable";
import Snackbar from "../../component/reuseable/Snackbar";
import ChargingFormDialog from "../dialog/ChargingFormDialog";
import "../contentscss/Charging.scss";
import { useGetChargingQuery } from "../../features/api/charging/chargingApi";
import MasterlistTab from "../../component/reuseable/MasterlistTab";

const Charging = () => {
  const currentUser = useSelector(selectCurrentUser);
  const userPermissions = currentUser?.role?.access_permissions || [];
  
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  

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

  const chargingData = Array.isArray(chargingResponse?.data) ? chargingResponse.data : Array.isArray(chargingResponse) ? chargingResponse : [];

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return chargingData;
    return chargingData.filter(item => item.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  }, [chargingData, debouncedSearchTerm]);

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
    { id: "id", label: "ID", sx: { pr: 2 } },
    { id: "name", label: "Name", sx: { pr: 2 } },
    { id: "code", label: "Code", sx: { pr: 2 } },
    { id: "company_name", label: "Company Name", sx: { pr: 2 } },
    { id: "business_unit_name", label: "Business Unit Name", sx: { pr: 2 } },
    { id: "department_name", label: "Department Name", sx: { pr: 2 } },
    { id: "unit_name", label: "Unit Name", sx: { pr: 2 } },
    { id: "sub_unit_name", label: "Sub Unit Name", sx: { pr: 2 } },
    { id: "location_name", label: "Location Name", sx: { pr: 2 } },
    {
      id: "created_at",
      label: "Created At",
      render: (row) => formatDate(row.created_at),
      sx: { pr: 2 }
    },
    {
      id: "updated_at",
      label: "Updated At",
      render: (row) => formatDate(row.updated_at),
      sx: { pr: 2 }
    },
  ];

  // Only show empty state if there is no data to show, otherwise show DataTable
  const showEmptyState = (!isLoading && ((isError && error?.errors?.[0]?.status === 404) || (!isError && filteredData.length === 0)));

  return (
    <Box className="chargingContainer">
      <MasterlistTab
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search Charging..."
        onRefresh={refetch}
        hideTabs={true}
        showCreateButton={false}
      />

      {showEmptyState ? (
        <Box className="chargingEmptyStateWrapper">
          <Box className="chargingEmptyStateBox">
            <Box style={{ width: 300, margin: '0 auto' }}>
              <Nodata />
            </Box>
            <Box className="chargingEmptyTextBox">
              <Typography variant="h6" className="chargingEmptyTitle">
                Charging
              </Typography>
              <Typography variant="body2">
                {isError && error?.errors?.[0]?.status === 404
                  ? error?.errors?.[0]?.detail || "Charging not found."
                  : (searchTerm
                      ? `No results found for "${searchTerm}".`
                      : (showArchived
                          ? "Currently no charging records in the archive."
                          : "No charging data available."))}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <DataTable
          columns={columns}
          rows={filteredData}
          totalCount={filteredData.length}
          isLoading={isLoading || searchTerm !== debouncedSearchTerm || isTabSwitching}
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