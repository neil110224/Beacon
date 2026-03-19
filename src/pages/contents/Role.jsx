import React, { useState, useMemo } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } 
from '@mui/material';
import nodataImg from '../../assets/alh.png'
import Nodata from '../../component/reuseable/Nodata';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/api/slice/authSlice';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import RestoreIcon from '@mui/icons-material/Restore';
import { useDebounce } from '../../hooks/useDebounce';
import { useGetRolesQuery, useDeleteRoleMutation, useCreateRoleMutation, useUpdateRoleMutation } from '../../features/api/role/roleApi';
import DataTable from '../../component/reuseable/DataTable';
import RoleFormDialog from '../dialog/RoleFormDialog';
import MasterlistTab from '../../component/reuseable/MasterlistTab';
import Confirmation from '../../component/reuseable/Confirmation';
import Snackbar from '../../component/reuseable/Snackbar';
import '../contentscss/Role.scss';

const Role = () => {
  const currentUser = useSelector(selectCurrentUser);
  const userPermissions = currentUser?.role?.access_permissions || [];
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showArchived, setShowArchived] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const open = Boolean(anchorEl);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isTabSwitching, setIsTabSwitching] = useState(false) // ← add this

  const { data, isLoading, isError, error, refetch } = useGetRolesQuery({
    status: showArchived ? 'inactive' : 'active',
    term: debouncedSearchTerm,
  });
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();

  const handleMenuOpen = (event, role) => {
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRole(null);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setRoleDialogOpen(true);
    setAnchorEl(null);
  };

  const handleRowClick = (row) => {
    setSelectedRole(row);
    setRoleDialogOpen(true);
  };

  const handleArchiveClick = (e) => {
    e.stopPropagation();
    setConfirmDialogOpen(true);
    setAnchorEl(null);
  };

  const handleConfirmArchive = async () => {
    if (!selectedRole) return;

    try {
      await deleteRole(selectedRole.id).unwrap();
      setSelectedRole(null);
      setConfirmDialogOpen(false);
      setSnackbarMessage(selectedRole.deleted_at ? 'Role restored successfully' : 'Role archived successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      const errorMessage = err?.data?.errors?.[0]?.detail || 'Failed to archive/restore role';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setConfirmDialogOpen(false);
    }
  };

  const handleConfirmCancel = () => {
    setConfirmDialogOpen(false);
    setSelectedRole(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setShowArchived(newValue === 1);
  };

  const roles = Array.isArray(data) ? data : [];

  const filteredRoles = useMemo(() => 
    !debouncedSearchTerm ? roles : roles.filter(role =>
      role.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  , [roles, debouncedSearchTerm]);

  // Define columns for DataTable
  const columns = [
    { id: 'id', label: 'ID', align: 'center' },
    { id: 'name', label: 'ROLES' },
    {
      id: 'access_permissions',
      label: 'Permissions',
      render: (row) => {
        const permissions = row.access_permissions || [];
        return permissions.length > 0 
          ? `${permissions.slice(0, 2).join(', ')}${permissions.length > 2 ? '...' : ''}`
          : 'None';
      }
    },
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
          <IconButton 
            onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, row); }}
            className="roleActionButton"
          >
            <MoreVertIcon className="roleMenuIcon" />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open && selectedRole?.id === row.id}
            onClose={handleMenuClose}
            className="roleMenu"
            PaperProps={{ elevation: 3 }}
          >
            {row.deleted_at ? (
              <MenuItem 
                onClick={(e) => handleArchiveClick(e)}
                disabled={isDeleting}
                className="roleMenuItem"
              >
                <RestoreIcon fontSize="small" className="roleRestoreIcon" />
                Restore
              </MenuItem>
            ) : [
              <MenuItem key="edit" onClick={(e) => handleEdit(e)} className="roleMenuItem">
                <EditIcon fontSize="small" className="roleEditIcon" />
                Edit
              </MenuItem>,
              <MenuItem key="archive" onClick={(e) => handleArchiveClick(e)} disabled={isDeleting} className="roleMenuItem">
                <ArchiveIcon fontSize="small" className="roleArchiveIcon" />
                Archive
              </MenuItem>
            ]}
          </Menu>
        </>
      ),
    },
  ];

  return (
    <Box className="roleContainer">
      <MasterlistTab
        showArchived={showArchived}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search roles..."
        canAdd={true}
        onAddClick={() => { setSelectedRole(null); setRoleDialogOpen(true); }}
        addLabel="Create"
        onRefresh={refetch}
      />

      {((!isLoading && filteredRoles.length === 0 && !isError) || (isError && showArchived)) && (
        <Box className="roleEmptyStateWrapper">
          <Box className="roleEmptyStateBox">
            <Box style={{ width: 300, margin: '0 auto' }}>
              <Nodata />
            </Box>
            <Box className="roleEmptyTextBox">
              <Typography variant="h6" className="roleEmptyTitle">Roles</Typography>
              <Typography variant="body2">{showArchived ? "Currently no roles in the archive." : "No roles data available."}</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {!isError && filteredRoles.length > 0 && (
        <DataTable
          columns={columns}
          rows={filteredRoles}
          totalCount={filteredRoles.length}
          isLoading={isLoading || searchTerm !== debouncedSearchTerm || isTabSwitching}
          isError={isError}
          error={error}
          onRowClick={handleRowClick}
          tableSx={{ 
            minWidth: 800,
            '& .MuiTableCell-root': {
              padding: '14px 16px',
              fontSize: '0.875rem',
              color: '#2c3e50',
            },
          }}
          headSx={{ 
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            '& th': { 
              fontWeight: 600,
              color: '#ffffff !important',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '16px',
            }
          }}
        />
      )}

      <RoleFormDialog
        key={selectedRole ? `edit-${selectedRole.id}` : 'add'}
        open={roleDialogOpen}
        onClose={() => { setRoleDialogOpen(false); setSelectedRole(null); }}
        role={selectedRole}
        onSave={selectedRole ? updateRole : createRole}
        isLoading={false}
      />

      {/* Confirmation Dialog */}
      <Confirmation
        open={confirmDialogOpen}
        onClose={handleConfirmCancel}
        onConfirm={handleConfirmArchive}
        title={selectedRole?.deleted_at ? 'Restore Role' : 'Archive Role'}
        message={`Are you sure you want to ${selectedRole?.deleted_at ? 'restore' : 'archive'} the role "${selectedRole?.name}"?`}
        isLoading={isDeleting}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </Box>
  );
};

export default Role;
