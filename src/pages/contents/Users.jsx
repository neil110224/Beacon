import React, { useState, useEffect } from 'react'
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useCreateUserMutation,   // ✅ ADD THIS
} from '../../features/api/user/userApi'

import DataTable from '../../component/reuseable/DataTable'
import AddNewUserDialog from '../dialog/adddialog/AddNewUserDialog' // ✅ MAKE SURE PATH IS CORRECT
import EditUserDialog from '../dialog/editdialog/UserDialog'

import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false) // ✅ ADD STATE
  const [showArchived, setShowArchived] = useState(false)

  const open = Boolean(anchorEl)

  // ✅ FETCH USERS
  const { data, isLoading, isError, error } = useGetUsersQuery({
    status: showArchived ? 'inactive' : 'active',
    term: searchTerm,
    paginate: 10
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

  const handleArchive = async () => {
    if (!selectedUser) return

    try {
      await deleteUser(selectedUser.id).unwrap()
      handleMenuClose()
    } catch (err) {
      console.error('Failed to archive/unarchive user:', err)
    }
  }

  const users = data?.data || []

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
          <IconButton onClick={(e) => handleMenuClick(e, row)}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open && selectedUser?.id === row.id}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEdit}>Edit</MenuItem>
            <MenuItem onClick={handleArchive} disabled={isArchiving}>
              {row.deleted_at ? 'Unarchive' : 'Archive'}
            </MenuItem>
          </Menu>
        </>
      ),
    },
  ]

  return (
    <Box>

      <DataTable
        columns={columns}
        rows={users}
        totalCount={users.length}
        isLoading={isLoading}
        isError={isError}
        error={error}
        tableSx={{ minWidth: 1200 }}
        headSx={{ bgcolor: '#f5f5f5' }}
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
    </Box>
  )
}

export default Users
