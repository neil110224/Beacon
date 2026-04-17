import React, { useState } from 'react'
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useResetPasswordMutation,
} from '../../features/api/user/userApi'
import { useDebounce } from '../../hooks/useDebounce'

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
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import Snackbar from '../../component/reuseable/Snackbar'
import MasterlistTab from '../../component/reuseable/MasterlistTab'
import '../contentscss/Users.scss'

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [isTabSwitching, setIsTabSwitching] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
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
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation()

  const users = Array.isArray(data?.data?.data) ? data.data.data : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []

  const handleMenuClick = (event, user) => { setAnchorEl(event.currentTarget); setSelectedUser(user); }
  const handleMenuClose = () => { setAnchorEl(null); setSelectedUser(null); }
  const handleEdit = () => { setUserDialogOpen(true); handleMenuClose(); }
  const handleArchive = () => { if (!selectedUser) return; setConfirmDialogOpen(true); setAnchorEl(null); }

  const handleResetPassword = () => {
    if (!selectedUser) return
    setResetPasswordDialogOpen(true)
    setAnchorEl(null)
  }

  const handleConfirmResetPassword = async () => {
    if (!selectedUser) return
    try {
      await resetPassword(selectedUser.id).unwrap()
      setResetPasswordDialogOpen(false)
      setSelectedUser(null)
      setSnackbarMessage('Password reset successfully!')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (error) {
      const errorMessage = error?.data?.errors?.[0]?.detail || 'Failed to reset password. Please try again.'
      console.error('Failed to reset password:', error)
      setSnackbarMessage(errorMessage)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleCancelResetPassword = () => {
    setResetPasswordDialogOpen(false)
    setSelectedUser(null)
  }

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

  const handleTabChange = (event, newValue) => {
    setIsTabSwitching(true)
    setShowArchived(newValue === 1)
    setTimeout(() => setIsTabSwitching(false), 600)
  }

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
            onClick={(e) => e.stopPropagation()}
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
              <MenuItem key="reset-password" onClick={handleResetPassword} disabled={isResetting} className="usersMenuItem">
                <RestartAltIcon fontSize="small" className="usersResetPasswordIcon" />
                Reset Password
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

  const showNoData = !isLoading && !isError && users.length === 0 && searchTerm && !showArchived;
  const showArchiveNoData = !isLoading && !isError && users.length === 0 && searchTerm && showArchived;
  const showDefaultNoData = !isLoading && !isError && users.length === 0 && !searchTerm;

  // Only show one empty state at a time
  let emptyState = null;
  if (showNoData) {
    emptyState = (
      <Box className="usersEmptyStateWrapper">
        <Box className="usersEmptyStateBox">
          <Box style={{ width: 300, margin: '0 auto' }}><Nodata /></Box>
          <Box className="usersEmptyTextBox">
            <Typography variant="h6" className="usersEmptyTitle">Users</Typography>
            <Typography variant="body2">Currently no "{searchTerm}" data.</Typography>
          </Box>
        </Box>
      </Box>
    );
  } else if (showArchiveNoData) {
    emptyState = (
      <Box className="usersEmptyStateWrapper">
        <Box className="usersEmptyStateBox">
          <Box style={{ width: 300, margin: '0 auto' }}><Nodata /></Box>
          <Box className="usersEmptyTextBox">
            <Typography variant="h6" className="usersEmptyTitle">Users</Typography>
            <Typography variant="body2">Currently no "{searchTerm}" data in the archive.</Typography>
          </Box>
        </Box>
      </Box>
    );
  } else if (showDefaultNoData) {
    emptyState = (
      <Box className="usersEmptyStateWrapper">
        <Box className="usersEmptyStateBox">
          <Box style={{ width: 300, margin: '0 auto' }}><Nodata /></Box>
          <Box className="usersEmptyTextBox">
            <Typography variant="h6" className="usersEmptyTitle">Users</Typography>
            <Typography variant="body2">{showArchived ? "Currently no users in the archive." : "No users data available."}</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box className="usersContainer">
        <MasterlistTab
          showArchived={showArchived}
          onTabChange={handleTabChange}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search users..."
          canAdd={true}
          onAddClick={() => setUserDialogOpen(true)}
          addLabel="CREATE"
          onRefresh={refetch}
        />


        {emptyState}

        {!emptyState && (
          <DataTable
            columns={columns}
            rows={users}
            totalCount={data?.data?.total}
            isLoading={isLoading || searchTerm !== debouncedSearchTerm || isTabSwitching}
            isError={isError}
            error={error}
            tableSx={{ 
              minWidth: 1200,
              '& .MuiTableCell-root': { padding: '14px 16px', fontSize: '0.875rem', color: '#2c3e50' },
              '& .MuiTableBody-root .MuiTableRow-root': { cursor: 'default' }
            }}
            headSx={{ 
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              '& th': { fontWeight: 600, color: '#ffffff !important', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '16px' }
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
          onShowSnackbar={({ message, severity }) => {
            setSnackbarMessage(message);
            setSnackbarSeverity(severity);
            setSnackbarOpen(true);
          }}
        />

        <Confirmation
          open={confirmDialogOpen}
          onClose={handleCancelConfirm}
          onConfirm={handleConfirmArchive}
          title={selectedUser?.deleted_at ? "Confirm Restore" : "Confirm Archive"}
          message={selectedUser?.deleted_at ? "Are you sure you want to restore this user?" : "Are you sure you want to archive this user?"}
        />

        <Confirmation
          open={resetPasswordDialogOpen}
          onClose={handleCancelResetPassword}
          onConfirm={handleConfirmResetPassword}
          title="Reset Password"
          message="Are you sure you want to reset the password? It will be set back to the user's username."
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