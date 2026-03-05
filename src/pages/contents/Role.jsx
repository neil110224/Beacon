import React, { useState, useMemo } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem} 
from '@mui/material';
import nodataImg from '../../assets/alh.png'
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
import LighthouseLoader from '../../component/reuseable/Loading';
import MasterlistTab from '../../component/reuseable/MasterlistTab';
import '../contentscss/Role.scss';

const Role = () => {
  const currentUser = useSelector(selectCurrentUser);
  const userPermissions = currentUser?.role?.access_permissions || [];
  const canAddRole = userPermissions.includes('Role.Add');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showArchived, setShowArchived] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const open = Boolean(anchorEl);

  const { data, isLoading, isError, error } = useGetRolesQuery({
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

  const handleEdit = () => {
    setRoleDialogOpen(true);
    setAnchorEl(null);
  };

  const handleArchive = async () => {
    if (!selectedRole) return;

    try {
      await deleteRole(selectedRole.id).unwrap();
      handleMenuClose();
    } catch (err) {
      console.error('Failed to archive/restore role:', err);
    }
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
            onClick={(e) => handleMenuOpen(e, row)}
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
                onClick={handleArchive}
                disabled={isDeleting}
                className="roleMenuItem"
              >
                <RestoreIcon fontSize="small" className="roleRestoreIcon" />
                Restore
              </MenuItem>
            ) : [
              <MenuItem key="edit" onClick={handleEdit} className="roleMenuItem">
                <EditIcon fontSize="small" className="roleEditIcon" />
                Edit
              </MenuItem>,
              <MenuItem key="archive" onClick={handleArchive} disabled={isDeleting} className="roleMenuItem">
                <ArchiveIcon fontSize="small" className="roleArchiveIcon" />
                Archive
              </MenuItem>
            ]}
          </Menu>
        </>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box className="roleLoadingContainer">
        <LighthouseLoader text="Loading roles..." />
      </Box>
    );
  }

  return (
    <Box className="roleContainer">
      <MasterlistTab
        showArchived={showArchived}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search roles..."
        canAdd={canAddRole}
        onAddClick={() => { setSelectedRole(null); setRoleDialogOpen(true); }}
        addLabel="Create"
      />

      {!isLoading && filteredRoles.length === 0 && (
        <Box className="roleEmptyStateWrapper">
          <Box className="roleEmptyStateBox">
            <Box component="img" src={nodataImg} alt="No data" className="roleEmptyImage" />
            <Box className="roleEmptyTextBox">
              <Typography variant="h6" className="roleEmptyTitle">Roles</Typography>
              <Typography variant="body2">{showArchived ? "Currently no roles in the archive." : "No roles data available."}</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {filteredRoles.length > 0 && !isError && (
        <DataTable
          columns={columns}
          rows={filteredRoles}
          totalCount={filteredRoles.length}
          isLoading={isLoading || searchTerm !== debouncedSearchTerm}
          isError={isError}
          error={error}
          tableSx={{ 
            minWidth: 800,
            '& .MuiTableCell-root': {
              padding: '14px 16px',
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
    </Box>
  );
};

export default Role;
