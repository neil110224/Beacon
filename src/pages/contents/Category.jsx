  import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  CircularProgress,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Button
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ArchiveIcon from '@mui/icons-material/Archive'
import SearchIcon from '@mui/icons-material/Search'
import RestoreIcon from '@mui/icons-material/Restore'
import AddIcon from '@mui/icons-material/Add'
import { useDebounce } from '../../hooks/useDebounce'
import { selectCurrentUser } from '../../features/api/slice/authSlice'
import { useGetCategoriesListQuery, useDeleteCategoryMutation, useCreateCategoryMutation } from '../../features/api/category/categoryApi'
import DataTable from '../../component/reuseable/DataTable'
import Confirmation from '../../component/reuseable/Confirmation'
import CategoryFormDialog from '../dialog/CategoryFormDialog'
import Snackbar from '../../component/reuseable/Snackbar'

  const Category = () => {
    const currentUser = useSelector(selectCurrentUser)
    const userPermissions = currentUser?.role?.access_permissions || []
    const canAddCategory = userPermissions.includes('Category.Add')
    
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 500)
    const [showArchived, setShowArchived] = useState(false)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [snackbarSeverity, setSnackbarSeverity] = useState('success')
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    
    const open = Boolean(anchorEl)

    const { data, isLoading, isError, error } = useGetCategoriesListQuery({
      status: showArchived ? 'inactive' : 'active',
      search: debouncedSearchTerm,
    })

    const [deleteCategory] = useDeleteCategoryMutation()
    const [createCategory] = useCreateCategoryMutation()

    const handleMenuOpen = (event, category) => {
      setAnchorEl(event.currentTarget)
      setSelectedCategory(category)
    }

    const handleMenuClose = () => {
      setAnchorEl(null)
      setSelectedCategory(null)
    }

    const handleArchive = () => {
      setConfirmDialogOpen(true)
    }

    const handleConfirmArchive = async () => {
      if (!selectedCategory) return
      
      try {
        await deleteCategory(selectedCategory.id).unwrap()
        setConfirmDialogOpen(false)
        handleMenuClose()
        setSnackbarMessage(selectedCategory.deleted_at ? 'Category restored successfully!' : 'Category archived successfully!')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
      } catch (err) {
        console.error('Failed to archive category:', err)
        setSnackbarMessage('Failed to archive category. Please try again.')
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

    const categories = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []

    // Filter categories by debounced search term
    const filteredCategories = useMemo(() => {
      if (!debouncedSearchTerm) return categories
      return categories.filter(category =>
        category.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    }, [categories, debouncedSearchTerm])

    // Define columns for DataTable
    const columns = [
      { id: 'id', label: 'ID', align: 'center' },
      { id: 'name', label: 'Name', render: (row) => row.name || row.categoryName || 'N/A' },
      {
        id: 'created_at',
        label: 'Created At',
        render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }) : 'N/A',
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
              open={open && selectedCategory?.id === row.id}
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
                // Archived category - show only Restore
                <MenuItem 
                  onClick={handleArchive}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <RestoreIcon fontSize="small" sx={{ mr: 1.5, color: '#2e7d32' }} />
                  Restore
                </MenuItem>
              ) : (
                // Active category - show only Archive
                <MenuItem 
                  onClick={handleArchive}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <ArchiveIcon fontSize="small" sx={{ mr: 1.5, color: '#ed6c02' }} />
                  Archive
                </MenuItem>
              )}
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
            placeholder="Search categories..."
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
          {canAddCategory && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedCategory(null)
                setCategoryDialogOpen(true)
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

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredCategories}
            totalCount={filteredCategories.length}
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

        <Confirmation
          open={confirmDialogOpen}
          onClose={handleCancelConfirm}
          onConfirm={handleConfirmArchive}
          title={selectedCategory?.deleted_at ? "Confirm Restore" : "Confirm Archive"}
          message={selectedCategory?.deleted_at ? "Are you sure you want to restore this category?" : "Are you sure you want to archive this category?"}
        />

        {/* Merged Category Form Dialog (Add Only) */}
        <CategoryFormDialog
          key="add-category"
          open={categoryDialogOpen}
          onClose={() => {
            setCategoryDialogOpen(false)
            setSelectedCategory(null)
          }}
          category={null}
          onSave={createCategory}
          isLoading={false}
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

  export default Category
