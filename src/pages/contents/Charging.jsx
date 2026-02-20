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
import {
  useGetChargingQuery,
  useDeleteChargingMutation,
} from "../../features/api/charging/chargingApi";

const Charging = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const open = Boolean(anchorEl);

  // ✅ Fetch records based on archived status
  const {
    data: chargingResponse,
    isLoading,
    isError,
    error,
  } = useGetChargingQuery({ status: showArchived ? "inactive" : "active" });

  // ✅ Use delete mutation for soft delete/restore
  const [deleteCharging, { isLoading: isDeleting }] = useDeleteChargingMutation();

  const chargingData = chargingResponse?.data || [];

  // ✅ Search filter
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

  // ✅ ARCHIVE/RESTORE FUNCTION (Soft Delete)
  const handleArchive = async () => {
    if (!selectedRow) return;

    try {
      await deleteCharging(selectedRow.id).unwrap();
      handleClose();
    } catch (err) {
      console.error("Failed to archive/restore:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      id: "id",
      label: "ID",
    },
    {
      id: "name",
      label: "Name",
    },
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
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
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
              '&:hover fieldset': {
                borderColor: '#2c3e50',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#2c3e50',
              },
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: '#2c3e50',
            textTransform: 'none',
            borderRadius: '8px',
            padding: '6px 20px',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: '#34495e',
            },
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
              '&.Mui-selected': {
                color: '#2c3e50',
              },
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

      {/* ❌ Error Message */}
      {isError && (
        <Box mb={2}>
          <Alert severity="error">
            {error?.data?.message || "Failed to load charging data"}
          </Alert>
        </Box>
      )}

      {/* ✅ Table */}
      <DataTable
        columns={columns}
        rows={filteredData}
        totalCount={filteredData.length}
        isLoading={isLoading}
        isError={isError}
        error={error}
        tableSx={{ 
          minWidth: 800,
          '& .MuiTableCell-root': {
            padding: '10px 14px',
            fontSize: '0.875rem',
            color: '#2c3e50',
          },
          '& .MuiTableBody-root .MuiTableRow-root': {
            cursor: 'default',
          }
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
          }
        }}
      />

      {/* ✅ Dropdown Menu */}
      <Menu 
        anchorEl={anchorEl} 
        open={open} 
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: '8px',
            mt: 1,
            minWidth: 160,
          }
        }}
      >
        {selectedRow?.deleted_at ? (
          // Archived charging - show only Restore
          <MenuItem 
            onClick={handleArchive}
            disabled={isDeleting}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <RestoreIcon fontSize="small" sx={{ mr: 1.5, color: '#2e7d32' }} />
            Restore
          </MenuItem>
        ) : [
          // Active charging - show Edit and Archive
          <MenuItem 
            key="edit"
            onClick={() => { handleClose(); /* Add your edit logic here */ }}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1.5, color: '#1976d2' }} />
            Edit
          </MenuItem>,
          <MenuItem 
            key="archive"
            onClick={handleArchive}
            disabled={isDeleting}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <ArchiveIcon fontSize="small" sx={{ mr: 1.5, color: '#ed6c02' }} />
            Archive
          </MenuItem>
        ]}
      </Menu>

      {/* ✅ Total Count */}
      <Box mt={2}>
        <Typography variant="body2" color="text.secondary">
          Total Records: {filteredData.length}
        </Typography>
      </Box>
    </Box>
  );
};

export default Charging;
