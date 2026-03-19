import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ArchiveIcon from '@mui/icons-material/Archive'
import RestoreIcon from '@mui/icons-material/Restore'
import { useDebounce } from '../../hooks/useDebounce'
import { selectCurrentUser } from '../../features/api/slice/authSlice'
import { useGetCategoriesListQuery, useDeleteCategoryMutation, useCreateCategoryMutation } from '../../features/api/category/categoryApi'
import DataTable from '../../component/reuseable/DataTable'
import Confirmation from '../../component/reuseable/Confirmation'
import CategoryFormDialog from '../dialog/CategoryFormDialog'
import Snackbar from '../../component/reuseable/Snackbar'
import Nodata from '../../component/reuseable/Nodata'
import MasterlistTab from '../../component/reuseable/MasterlistTab'
import '../contentscss/Category.scss'

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
  const [isTabSwitching, setIsTabSwitching] = useState(false)

  const { data, isLoading, isFetching, isError, error, refetch } = useGetCategoriesListQuery({
    status: showArchived ? 'inactive' : 'active',
    search: debouncedSearchTerm,
  })

  const [deleteCategory] = useDeleteCategoryMutation()
  const [createCategory] = useCreateCategoryMutation()

  const handleMenuOpen = (event, category) => { setAnchorEl(event.currentTarget); setSelectedCategory(category) }
  const handleMenuClose = () => { setAnchorEl(null); setSelectedCategory(null) }
  const handleArchive = () => { setConfirmDialogOpen(true) }
  const handleCancelConfirm = () => { setConfirmDialogOpen(false); handleMenuClose() }

  const handleTabChange = (event, newValue) => {
    setIsTabSwitching(true)
    setShowArchived(newValue === 1)
    setTimeout(() => setIsTabSwitching(false), 400)
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
      const errorMessage = err?.data?.errors?.[0]?.detail || 'Failed to archive category. Please try again.'
      setSnackbarMessage(errorMessage)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      setConfirmDialogOpen(false)
    }
  }

  // Treat 404 from API as empty list, not a real error
  const is404 = isError && error?.status === 404
  const isRealError = isError && !is404

  const categories = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []

  const filteredCategories = useMemo(() => {
    if (!debouncedSearchTerm) return categories
    return categories.filter(category =>
      category.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [categories, debouncedSearchTerm])

  // True loading state — don't show nodata until fully settled
  const isSettled = !isLoading && !isFetching && !isTabSwitching && searchTerm === debouncedSearchTerm
  const showNoData = isSettled && (is404 || (!isRealError && filteredCategories.length === 0))
  const showTable = !isRealError && filteredCategories.length > 0

  const columns = [
    { id: 'id', label: 'ID', align: 'center', width: '10%' },
    { id: 'name', label: 'Name', render: (row) => row.name || row.categoryName || 'N/A', width: '20%' },
    {
      id: 'created_at', label: 'Created At', render: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', width: '10%' }) : 'N/A'
    },
    {
      id: 'actions', label: 'Actions', align: 'center',
      render: (row) => (
        <IconButton className="categoryActionButton" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, row) }}>
          <MoreVertIcon className="categoryMenuIcon" />
        </IconButton>
      )
    },
  ]

  return (
    <Box className="categoryContainer">
      <MasterlistTab
        showArchived={showArchived}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search categories..."
        canAdd={canAddCategory}
        onAddClick={() => setCategoryDialogOpen(true)}
        addLabel="CREATE"
        onRefresh={refetch}
      />

      {/* Only show one empty state or table at a time */}
      {showNoData ? (
        <Box className="categoryEmptyStateWrapper">
          <Box className="categoryEmptyStateBox">
            <Nodata />
            <Box className="categoryEmptyTextBox">
              <Typography variant="h6" className="categoryEmptyTitle">
                Categories
              </Typography>
              <Typography variant="body2">
                {searchTerm
                  ? `No results found for "${searchTerm}".`
                  : showArchived
                  ? 'Currently no categories in the archive.'
                  : 'No categories data available.'}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : isRealError ? (
        <Box className="categoryEmptyStateWrapper">
          <Box className="categoryEmptyStateBox">
            <Nodata />
            <Box className="categoryEmptyTextBox">
              <Typography variant="h6" className="categoryEmptyTitle">Something went wrong</Typography>
              <Typography variant="body2" sx={{ color: '#d32f2f' }}>
                {error?.data?.errors?.[0]?.detail || 'Failed to load categories.'}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : showTable ? (
        <DataTable
          columns={columns}
          rows={filteredCategories}
          totalCount={filteredCategories.length}
          isLoading={isLoading || isFetching || searchTerm !== debouncedSearchTerm || isTabSwitching}
          isError={isRealError}
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
      ) : null}

      <Menu
        className="categoryMenu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ elevation: 3, sx: { borderRadius: '8px', mt: 1, minWidth: 160 } }}
      >
        {selectedCategory?.deleted_at ? (
          <MenuItem onClick={handleArchive}>
            <RestoreIcon fontSize="small" className="categoryMenuItemRestore" sx={{ mr: 1.5 }} />
            Restore
          </MenuItem>
        ) : (
          <MenuItem onClick={handleArchive}>
            <ArchiveIcon fontSize="small" className="categoryMenuItemArchive" sx={{ mr: 1.5 }} />
            Archive
          </MenuItem>
        )}
      </Menu>

      <Confirmation
        open={confirmDialogOpen}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirmArchive}
        title={selectedCategory?.deleted_at ? 'Confirm Restore' : 'Confirm Archive'}
        message={selectedCategory?.deleted_at ? 'Are you sure you want to restore this category?' : 'Are you sure you want to archive this category?'}
      />

      <CategoryFormDialog
        key="add-category"
        open={categoryDialogOpen}
        onClose={() => { setCategoryDialogOpen(false); setSelectedCategory(null) }}
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