import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Alert,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import DataTable from "../../component/reuseable/DataTable";
import {
  useGetChargingQuery,
  useUpdateChargingMutation,
} from "../../features/api/charging/chargingApi";

const Charging = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const open = Boolean(anchorEl);

  // ✅ Fetch only ACTIVE records (default behavior)
  const {
    data: chargingResponse,
    isLoading,
    isError,
    error,
  } = useGetChargingQuery({ status: "active" });

  // ✅ Use update mutation for soft delete
  const [updateCharging] = useUpdateChargingMutation();

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

  // ✅ ARCHIVE FUNCTION (Soft Delete)
  const handleArchive = async () => {
    if (!selectedRow) return;

    const confirmArchive = window.confirm(
      "Are you sure you want to archive this record?"
    );

    if (!confirmArchive) return;

    try {
      await updateCharging({
        id: selectedRow.id,
        data: {
          ...selectedRow,
          status: "archived", // 👈 This makes it soft deleted
        },
      }).unwrap();
    } catch (err) {
      console.error("Archive failed:", err);
    }

    handleClose();
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
        <IconButton onClick={(e) => handleMenuClick(e, row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
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
      />

      {/* ✅ Dropdown Menu */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleArchive}>Archive</MenuItem>
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
