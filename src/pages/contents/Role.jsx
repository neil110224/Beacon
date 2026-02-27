import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  CircularProgress,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/api/slice/authSlice';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import SearchIcon from '@mui/icons-material/Search';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import { useDebounce } from '../../hooks/useDebounce';
import { useGetRolesQuery, useDeleteRoleMutation, useCreateRoleMutation, useUpdateRoleMutation } from '../../features/api/role/roleApi';
import DataTable from '../../component/reuseable/DataTable';
import RoleFormDialog from '../dialog/RoleFormDialog';

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

  const handleEdit = () => {
    // Keep selectedRole while opening dialog
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

  // Filter roles by debounced search term
  const filteredRoles = useMemo(() => {
    if (!debouncedSearchTerm) return roles;
    return roles.filter(role =>
      role.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [roles, debouncedSearchTerm]);

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
          ? permissions.slice(0, 2).join(', ') + (permissions.length > 2 ? '...' : '')
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
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <MoreVertIcon sx={{ fontSize: '1.2rem', color: '#5f6368' }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open && selectedRole?.id === row.id}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                borderRadius: '8px',
                mt: 1,
                minWidth: 160,
              }
            }}
          >
            {row.deleted_at ? (
              // Archived role - show only Restore
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
              // Active role - show Edit and Archive
              <MenuItem 
                key="edit"
                onClick={handleEdit}
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
          Error: {error?.message || 'Failed to fetch Role'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Search Bar and Add Button */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <TextField
          placeholder="Search roles..."
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
        {canAddRole && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedRole(null);
              setRoleDialogOpen(true);
            }}
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

      {/* Role Form Dialog (Add/Edit) */}
      <RoleFormDialog
        key={selectedRole ? `edit-${selectedRole.id}` : 'add'}
        open={roleDialogOpen}
        onClose={() => {
          setRoleDialogOpen(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
        onSave={selectedRole ? updateRole : createRole}
        isLoading={false}
      />
      </Box>
  );
};

export default Role;
