import React, { useState } from 'react'
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
} from '../../features/api/user/userApi'
import { useDebounce } from '../../hooks/useDebounce'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../features/api/slice/authSlice'

import DataTable from '../../component/reuseable/DataTable'
import Confirmation from '../../component/reuseable/Confirmation'
import UserFormDialog from '../dialog/UserFormDialog'
import Nodata from '../../component/reuseable/Nodata'

import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ArchiveIcon from '@mui/icons-material/Archive'
import RestoreIcon from '@mui/icons-material/Restore'
import EditIcon from '@mui/icons-material/Edit'
import Snackbar from '../../component/reuseable/Snackbar'
import MasterlistTab from '../../component/reuseable/MasterlistTab'
import '../contentscss/Users.scss'

const Users = () => {
  const currentUser = useSelector(selectCurrentUser)
  const userPermissions = currentUser?.role?.access_permissions || []
  const canAddUser = userPermissions.includes('Users.Add')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const open = Boolean(anchorEl)

  const { data, isLoading, isError, error, refetch } = useGetUsersQuery({
    status: showArchived ? 'inactive' : 'active',
    search: debouncedSearchTerm,
  })

  const [deleteUser, { isLoading: isArchiving }] = useDeleteUserMutation()
  const [createUser] = useCreateUserMutation()
  const [updateUser] = useUpdateUserMutation()

  const users = Array.isArray(data?.data?.data) ? data.data.data : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []

  const handleMenuClick = (event, user) => { setAnchorEl(event.currentTarget); setSelectedUser(user); }
  const handleMenuClose = () => { setAnchorEl(null); }
  const handleEdit = () => { setUserDialogOpen(true); handleMenuClose(); }
  const handleArchive = () => { if (!selectedUser) return; setConfirmDialogOpen(true); setAnchorEl(null); }
  const handleConfirmArchive = async () => {
    if (!selectedUser) return
    try {
      await deleteUser(selectedUser.id).unwrap()
      setConfirmDialogOpen(false)
      setSelectedUser(null)
      setSnackbarMessage(selectedUser.deleted_at ? 'User restored successfully!' : 'User archived successfully!')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (error) {
      const errorMessage = error?.data?.errors?.[0]?.detail || 'Failed to archive/unarchive user. Please try again.'
      console.error('Failed to archive/unarchive user:', error)
      setSnackbarMessage(errorMessage)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }
  const handleCancelConfirm = () => { setConfirmDialogOpen(false); setSelectedUser(null); }
  const handleTabChange = (event, newValue) => { setShowArchived(newValue === 1); }

  const columns = [
    { id: 'id', label: 'ID', align: 'center' },
    {
      id: 'name',
      label: 'Full Name',
      render: (row) =>
        `${row.first_name} ${row.middle_name || ''} ${row.last_name}`.trim(),
    },
    { id: 'username', label: 'Username' },
    {
      id: 'role',
      label: 'Role',
      render: (row) => row.role?.name || 'N/A',
    },
    {
      id: 'team',
      label: 'Team',
      render: (row) => row.team?.name || 'N/A',
    },
    {
      id: 'department',
      label: 'Department',
      render: (row) => row.charging?.name || 'N/A',
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      render: (row) => (
        <>
          <IconButton onClick={(e) => handleMenuClick(e, row)} className="usersActionButton">
            <MoreVertIcon className="usersMenuIcon" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open && selectedUser?.id === row.id}
            onClose={handleMenuClose}
            className="usersMenu"
            PaperProps={{ elevation: 3 }}
          >
            {row.deleted_at ? (
              <MenuItem onClick={handleArchive} disabled={isArchiving} className="usersMenuItem">
                <RestoreIcon fontSize="small" className="usersRestoreIcon" />
                Restore
              </MenuItem>
            ) : [
              <MenuItem key="edit" onClick={handleEdit} className="usersMenuItem">
                <EditIcon fontSize="small" className="usersEditIcon" />
                Edit
              </MenuItem>,
              <MenuItem key="archive" onClick={handleArchive} disabled={isArchiving} className="usersMenuItem">
                <ArchiveIcon fontSize="small" className="usersArchiveIcon" />
                Archive
              </MenuItem>
            ]}
          </Menu>
        </>
      ),
    },
  ]

  return (
    <>
      <Box className="usersContainer">
        <MasterlistTab
          showArchived={showArchived}
          onTabChange={handleTabChange}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search users..."
          canAdd={canAddUser}
          onAddClick={() => setUserDialogOpen(true)}
          addLabel="Add User"
          onRefresh={refetch}
        />

          {!isLoading && users.length === 0 && (
            <Box className="usersEmptyStateWrapper">
              <Box className="usersEmptyStateBox">
                <Box>
                  <Nodata />
                </Box>
                <Box className="usersEmptyTextBox">
                  <Typography variant="h6" className="usersEmptyTitle">Users</Typography>
                  <Typography variant="body2">{showArchived ? "Currently no users in the archive." : "No users data available."}</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {!isError && (
            <DataTable
              columns={columns}
              rows={users}
              totalCount={data?.data?.total}
              isLoading={isLoading || searchTerm !== debouncedSearchTerm}
              isError={isError}
              error={error}
              tableSx={{ 
                minWidth: 1200,
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

          <UserFormDialog
            key={userDialogOpen ? (selectedUser ? `edit-${selectedUser.id}` : 'add') : 'closed'}
            open={userDialogOpen}
            onClose={() => { setUserDialogOpen(false); setSelectedUser(null); }}
            user={selectedUser}
            onSave={selectedUser ? updateUser : createUser}
            isLoading={false}
          />

          <Confirmation
            open={confirmDialogOpen}
            onClose={handleCancelConfirm}
            onConfirm={handleConfirmArchive}
            title={selectedUser?.deleted_at ? "Confirm Restore" : "Confirm Archive"}
            message={selectedUser?.deleted_at ? "Are you sure you want to restore this user?" : "Are you sure you want to archive this user?"}
          />

          <Snackbar
            open={snackbarOpen}
            message={snackbarMessage}
            severity={snackbarSeverity}
            onClose={() => setSnackbarOpen(false)}
          />
        </Box>
      </>
    )
  }

export default Users
