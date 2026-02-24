import React, { useState, useEffect } from 'react'
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useCreateUserMutation,   // ✅ ADD THIS
} from '../../features/api/user/userApi'

import DataTable from '../../component/reuseable/DataTable'
import Confirmation from '../../component/reuseable/Confirmation'
import AddNewUserDialog from '../dialog/adddialog/AddNewUserDialog' // ✅ MAKE SURE PATH IS CORRECT
import EditUserDialog from '../dialog/editdialog/UserDialog'

import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchIcon from '@mui/icons-material/Search'
import ArchiveIcon from '@mui/icons-material/Archive'
import RestoreIcon from '@mui/icons-material/Restore'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import Snackbar from '../../component/reuseable/snackbar'

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
console.log(
"seearch", searchTerm
)
  const open = Boolean(anchorEl)

  // ✅ FETCH USERS
  const { data, isLoading, isError, error } = useGetUsersQuery({
    status: showArchived ? 'inactive' : 'active',
    // paginate: 10,
    // pagination: "none"
    search: searchTerm,
  })

  // ✅ DELETE
  const [deleteUser, { isLoading: isArchiving }] = useDeleteUserMutation()

  // ✅ CREATE USER (THIS WAS MISSING)
  const [createUser] = useCreateUserMutation()

  useEffect(() => {
    const handleArchiveToggle = (event) => {
      setShowArchived(event.detail.showArchived)
    }

    window.addEventListener('archiveToggle', handleArchiveToggle)

    return () => {
      window.removeEventListener('archiveToggle', handleArchiveToggle)
    }
  }, [])

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget)
    setSelectedUser(user)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedUser(null)
  }

  const handleEdit = () => {
    setEditDialogOpen(true)
    handleMenuClose()
  }

  const handleArchive = () => {
    // Show confirmation dialog (don't close menu yet, we need selectedUser)
    setConfirmDialogOpen(true)
  }

  const handleConfirmArchive = async () => {
    if (!selectedUser) return

    try {
      await deleteUser(selectedUser.id).unwrap()
      setConfirmDialogOpen(false)
      handleMenuClose()
      setSnackbarMessage(selectedUser.deleted_at ? 'User restored successfully!' : 'User archived successfully!')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (err) {
      console.error('Failed to archive/unarchive user:', err)
      setSnackbarMessage('Failed to archive/unarchive user. Please try again.')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleCancelConfirm = () => {
    setConfirmDialogOpen(false)
    handleMenuClose()
  }

  const handleTabChange = (event, newValue) => {
    setShowArchived(newValue === 1)
  }

  // Client-side filtering based on search term
  // const filteredUsers = React.useMemo(() => {
  //   const allUsers = data?.data || []
  //   if (!searchTerm.trim()) return allUsers
    
  //   return allUsers.filter(user => {
  //     const fullName = `${user.first_name} ${user.middle_name || ''} ${user.last_name}`.toLowerCase()
  //     const username = user.username?.toLowerCase() || ''
  //     const role = user.role?.name?.toLowerCase() || ''
  //     const team = user.team?.name?.toLowerCase() || ''
  //     const department = user.charging?.name?.toLowerCase() || ''
  //     const searchLower = searchTerm.toLowerCase()
      
  //     return (
  //       fullName.includes(searchLower) ||
  //       username.includes(searchLower) ||
  //       role.includes(searchLower) ||
  //       team.includes(searchLower) ||
  //       department.includes(searchLower)
  //     )
  //   })
  // }, [data, searchTerm])

  // const users = filteredUsers
  const users = Array.isArray(data?.data?.data) ? data.data.data : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []

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
          <Menu
            anchorEl={anchorEl}
            open={open && selectedUser?.id === row.id}
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
              // Archived user - show only Restore
              <MenuItem 
                onClick={handleArchive} 
                disabled={isArchiving}
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
              // Active user - show Edit and Archive
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
                disabled={isArchiving}
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
  ]

  return (
    <Box sx={{ p: 3 }}>
      {/* Search Bar and Add Button */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <TextField
          placeholder="Search users..."
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
          onClick={() => setAddDialogOpen(true)}
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

      <DataTable
        columns={columns}
        rows={users}
        totalCount={data?.data?.total}
        isLoading={isLoading}
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

      {/* ✅ ADD USER DIALOG */}
      <AddNewUserDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={createUser}   // 🔥 THIS FIXES EVERYTHING
      />

      {selectedUser && (
        <EditUserDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          user={selectedUser}
          onSave={() => {}}
          isLoading={false}
        />
      )}

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
  )
}

export default Users
