import React, { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, CircularProgress } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import { useGetRolesQuery } from '../../features/api/role/roleApi';
import DataTable from '../../component/reuseable/DataTable'; // adjust the path

const Role = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const open = Boolean(anchorEl);

  const { data, isLoading, isError, error, refetch } = useGetRolesQuery();

  const handleMenuOpen = (event, role) => {
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRole(null);
  };

  const handleEdit = () => {
    console.log('Edit role:', selectedRole);
    // Add your edit logic here (e.g., open edit dialog)
    handleMenuClose();
  };

  const handleArchive = () => {
    console.log('Archive role:', selectedRole);
    // Add your archive logic here
    handleMenuClose();
  };

  const roles = data?.data || [];

  // Define columns for DataTable
  const columns = [
    { id: 'id', label: 'ID', align: 'center' },
    { id: 'name', label: 'ROLES' },
    {
      id: 'created_at',
      label: 'Created At',
      render: (row) => new Date(row.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (row) => (
        <>
          <IconButton onClick={(e) => handleMenuOpen(e, row)}>
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open && selectedRole?.id === row.id}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEdit}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={handleArchive}>
              <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
              Archive
            </MenuItem>
          </Menu>
        </>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error: {error?.message || 'Failed to fetch departments'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>

      <DataTable
        columns={columns}
        rows={roles}
        totalCount={roles.length}
        isLoading={isLoading}
        isError={isError}
        error={error}
        tableSx={{ minWidth: 800 }}
        headSx={{ '& th': { fontWeight: 'bold' } }}
      />
      </Box>
  );
};

export default Role;
