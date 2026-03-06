import { Box, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Select, MenuItem, Snackbar, Alert } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import React, { useMemo, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../features/api/slice/authSlice'
import { useGetSystemsListQuery } from '../../features/api/system/systemApi'
import { useUpdateProgressStatusMutation, useUpdateProgressMutation } from '../../features/api/progress/progressApi'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import '../contentscss/SystemCategory.scss'

const SystemCategory = () => {
  const { systemName } = useParams()
  const user = useSelector(selectCurrentUser)
  
  // Build query params based on user role
  const buildQueryParams = () => {
    const isUserRole = user?.role?.name?.toLowerCase() === "user"
    
    if (isUserRole && user?.team?.id) {
      return {
        status: "active",
        scope: "per_team",
        team_id: user.team.id
      }
    } else {
      return {
        status: "active",
        scope: "global"
      }
    }
  }

  const queryParams = buildQueryParams()
  const { data: systemsData, isLoading, error, refetch } = useGetSystemsListQuery(queryParams)
  const [updateProgressStatus] = useUpdateProgressStatusMutation()
  const [updateProgress] = useUpdateProgressMutation()
  const [editingStatus, setEditingStatus] = useState({})
  const [editingDates, setEditingDates] = useState({})
  const [loadingStatusId, setLoadingStatusId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Find the current system from the systems list
  const currentSystem = useMemo(() => {
    if (!systemsData || !Array.isArray(systemsData)) return null
    return systemsData.find(sys => sys.systemName === systemName)
  }, [systemsData, systemName])

  const getStatusColor = useCallback((status) => {
    const statusColors = {
      pending: '#ff9800',
      done: '#4caf50',
      hold: '#2196f3',
      inprogress: '#9c27b0',
    }
    return statusColors[status?.toLowerCase()] || '#9e9e9e'
  }, [])

  const STATUS_OPTIONS = useMemo(() => [
    { value: 'pending', label: 'Pending' },
    { value: 'hold', label: 'On Hold' },
    { value: 'done', label: 'Done' },
  ], [])

  const handleStatusChange = useCallback(async (itemId, newStatus) => {
    setEditingStatus(prev => ({
      ...prev,
      [itemId]: newStatus
    }))
    setLoadingStatusId(itemId)
    try {
      await updateProgressStatus({ progressId: itemId, status: newStatus }).unwrap()
      // Refetch data after status update
      await refetch()
      // Clear editingStatus after successful refetch
      setEditingStatus(prev => {
        const newState = { ...prev }
        delete newState[itemId]
        return newState
      })
      setSnackbar({
        open: true,
        message: 'Status updated successfully!',
        severity: 'success',
      })
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.data?.message || 'Failed to update status',
        severity: 'error',
      })
      // Revert the edit on error
      setEditingStatus(prev => {
        const newState = { ...prev }
        delete newState[itemId]
        return newState
      })
    } finally {
      setLoadingStatusId(null)
    }
  }, [updateProgressStatus, refetch])

  const handleStartDateChange = useCallback(async (item, newDate) => {
    const formattedDate = newDate ? dayjs(newDate).format('YYYY-MM-DD') : null
    setEditingDates(prev => ({
      ...prev,
      [item.id]: { ...prev[item.id], start_date: formattedDate }
    }))
    setLoadingStatusId(item.id)
    try {
      await updateProgress({ progressId: item.id, start_date: formattedDate, status: item.status }).unwrap()
      // Refetch data to get the latest from server
      await refetch()
      // Clear editingDates after successful refetch so fresh data is displayed
      setEditingDates(prev => {
        const newState = { ...prev }
        delete newState[item.id]
        return newState
      })
      setSnackbar({
        open: true,
        message: 'Start date updated successfully!',
        severity: 'success',
      })
    } catch (err) {
      console.error('Failed to update start date:', err)
      setSnackbar({
        open: true,
        message: err?.data?.message || 'Failed to update start date',
        severity: 'error',
      })
      // Revert the edit on error
      setEditingDates(prev => {
        const newState = { ...prev }
        delete newState[item.id]
        return newState
      })
    } finally {
      setLoadingStatusId(null)
    }
  }, [updateProgress, refetch])

  const handleEndDateChange = useCallback(async (item, newDate) => {
    const formattedDate = newDate ? dayjs(newDate).format('YYYY-MM-DD') : null
    setEditingDates(prev => ({
      ...prev,
      [item.id]: { ...prev[item.id], end_date: formattedDate }
    }))
    setLoadingStatusId(item.id)
    try {
      await updateProgress({ progressId: item.id, end_date: formattedDate, status: item.status }).unwrap()
      // Refetch data to get the latest from server
      await refetch()
      // Clear editingDates after successful refetch so fresh data is displayed
      setEditingDates(prev => {
        const newState = { ...prev }
        delete newState[item.id]
        return newState
      })
      setSnackbar({
        open: true,
        message: 'End date updated successfully!',
        severity: 'success',
      })
    } catch (err) {
      console.error('Failed to update end date:', err)
      setSnackbar({
        open: true,
        message: err?.data?.message || 'Failed to update end date',
        severity: 'error',
      })
      // Revert the edit on error
      setEditingDates(prev => {
        const newState = { ...prev }
        delete newState[item.id]
        return newState
      })
    } finally {
      setLoadingStatusId(null)
    }
  }, [updateProgress, refetch])

  // Handle loading state
  if (isLoading) {
    return <Box className="systemCategoryLoadingContainer"><CircularProgress /></Box>
  }

  // Handle error state
  if (error) {
    return (
      <Box className="systemCategoryErrorContainer">
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
          {user?.team?.name || 'Your Team'}
        </Typography>
        <Typography variant="body2">
          Currently no system
        </Typography>
      </Box>
    )
  }

  // Handle not found state
  if (!currentSystem) {
    return (
      <Box className="systemCategoryErrorContainer">
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
          {systemName}
        </Typography>
        <Typography variant="body2">
          Currently no system
        </Typography>
      </Box>
    )
  }

  return (
    <Box className="systemCategoryContainer">
      {/* Header with Add Button */}
      <Box className="systemCategoryHeader">
        <Box>
          <Typography variant="h5" className="systemCategoryTitle">
            {currentSystem.systemName}
          </Typography>
          <Typography variant="body2" className="systemCategoryTeam">
            Team: {currentSystem.team?.name} ({currentSystem.team?.code})
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} className="systemCategoryAddButton" sx={{bgcolor:'#03346E'}}>
          Create
        </Button>
      </Box>

      {/* Content */}
      <Box className="systemCategoryContent">
        {currentSystem.categories && currentSystem.categories.length > 0 ? (
          currentSystem.categories.map((category, idx) => (
            <Accordion key={idx} defaultExpanded={true} className="systemCategoryAccordion">
              <AccordionSummary expandIcon={<ExpandMoreIcon className="systemCategoryExpandIcon" />}>
                <Typography variant="h6">
                  {category.categoryName} ({category.progress?.length || 0} items)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {category.progress && category.progress.length > 0 ? (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TableContainer component={Paper} className="systemCategoryTableContainer">
                    <Table size="small" className="systemCategoryTable">
                      <TableHead>
                        <TableRow className="systemCategoryTableHead">
                          <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Raised Date</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {category.progress.map((item) => (
                          <TableRow key={item.id} className="systemCategoryTableRow">
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.raised_date}</TableCell>
                            <TableCell>
                              <DatePicker
                                value={editingDates[item.id]?.start_date ? dayjs(editingDates[item.id].start_date) : item.start_date ? dayjs(item.start_date) : null}
                                onChange={(newValue) => handleStartDateChange(item, newValue)}
                                slotProps={{ textField: { size: "small", className: "systemCategoryDatePicker" } }}
                                disabled={loadingStatusId === item.id}
                              />
                            </TableCell>
                            <TableCell>
                              <DatePicker
                                value={editingDates[item.id]?.end_date ? dayjs(editingDates[item.id].end_date) : item.end_date ? dayjs(item.end_date) : null}
                                onChange={(newValue) => handleEndDateChange(item, newValue)}
                                slotProps={{ textField: { size: "small", className: "systemCategoryDatePicker" } }}
                                disabled={loadingStatusId === item.id}
                              />
                            </TableCell>
                            <TableCell>
                              <Box className="systemCategoryStatusContainer">
                                <Select
                                  value={editingStatus[item.id] || item.status || ''}
                                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                  size="small"
                                  disabled={loadingStatusId === item.id}
                                  className="systemCategoryStatusSelect"
                                  sx={{ bgcolor: getStatusColor(editingStatus[item.id] || item.status) }}
                                >
                                  {STATUS_OPTIONS.map(option => (
                                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                  ))}
                                </Select>
                                {loadingStatusId === item.id && (
                                  <Box className="systemCategoryStatusLoading">
                                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                                  </Box>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell className="systemCategoryRemarks">
                              {item.remarks || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  </LocalizationProvider>
                ) : (
                  <Box className="systemCategoryEmptyItems">
                    <Typography>No items in this category</Typography>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography>No categories found for this system</Typography>
        )}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          className="systemCategorySnackbar"
          sx={{ 
            backgroundColor: snackbar.severity === 'success' ? '#4caf50' : '#f44336'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default SystemCategory
