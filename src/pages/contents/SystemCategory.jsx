import { Box, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, Snackbar, Alert, Stack, Select, MenuItem } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import React, { useMemo, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useGetSystemsListQuery } from '../../features/api/system/systemApi'
import { useUpdateProgressStatusMutation, useUpdateProgressMutation } from '../../features/api/progress/progressApi'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

const SystemCategory = () => {
  const { systemName } = useParams()
  const { data: systemsData, isLoading, error, refetch } = useGetSystemsListQuery()
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

  const handleAddItem = useCallback(() => {
    // TODO: Implement add item dialog/modal
    console.log('Add item clicked for system:', systemName)
  }, [systemName])

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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Handle error state
  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        Error loading system data:{' '}
        {error?.data?.message || error?.error || String(error?.status) || 'Unknown error'}
      </Box>
    )
  }

  // Handle not found state
  if (!currentSystem) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, color: 'error.main' }}>
          System not found: {systemName}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with Add Button */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderBottom: '1px solid #e5e7eb'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
            {currentSystem.systemName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Team: {currentSystem.team?.name} ({currentSystem.team?.code})
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          sx={{
            bgcolor: '#3b82f6',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            mr:2,
            px: 2,
            '&:hover': {
              bgcolor: '#2563eb',
            },
          }}
        >
          Add
        </Button>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
        {currentSystem.categories && currentSystem.categories.length > 0 ? (
          currentSystem.categories.map((category, idx) => (
            <Accordion
              key={idx}
              sx={{
                mb: 2,
                bgcolor: '#f5f5f5',
                '&:before': {
                  display: 'none',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: '#1a1a2e',
                  color: '#f4f4f4',
                }}
              >
                <Typography variant="h6">
                  {category.categoryName} ({category.progress?.length || 0} items)
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: '#ffffff', p: 0 }}>
                {category.progress && category.progress.length > 0 ? (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TableContainer component={Paper} sx={{ m: 0 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f0f0f0' }}>
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
                          <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.raised_date}</TableCell>
                            <TableCell>
                              <DatePicker
                                value={editingDates[item.id]?.start_date ? dayjs(editingDates[item.id].start_date) : item.start_date ? dayjs(item.start_date) : null}
                                onChange={(newValue) => handleStartDateChange(item, newValue)}
                                slotProps={{ textField: { size: "small", sx: { width: '120px' } } }}
                                disabled={loadingStatusId === item.id}
                              />
                            </TableCell>
                            <TableCell>
                              <DatePicker
                                value={editingDates[item.id]?.end_date ? dayjs(editingDates[item.id].end_date) : item.end_date ? dayjs(item.end_date) : null}
                                onChange={(newValue) => handleEndDateChange(item, newValue)}
                                slotProps={{ textField: { size: "small", sx: { width: '120px' } } }}
                                disabled={loadingStatusId === item.id}
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={editingStatus[item.id] || item.status || ''}
                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                size="small"
                                disabled={loadingStatusId === item.id}
                                sx={{
                                  minWidth: 120,
                                  bgcolor: getStatusColor(editingStatus[item.id] || item.status),
                                  color: '#fff',
                                  fontWeight: 'bold',
                                  opacity: loadingStatusId === item.id ? 0.6 : 1,
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: getStatusColor(editingStatus[item.id] || item.status),
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: getStatusColor(editingStatus[item.id] || item.status),
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: getStatusColor(editingStatus[item.id] || item.status),
                                  },
                                  '& .MuiSvgIcon-root': {
                                    color: '#fff',
                                  },
                                }}
                              >
                                {STATUS_OPTIONS.map(option => (
                                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                ))}
                              </Select>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 200, whiteSpace: 'normal', wordWrap: 'break-word' }}>
                              {item.remarks || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  </LocalizationProvider>
                ) : (
                  <Box sx={{ p: 2 }}>
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
          sx={{
            width: '100%',
            backgroundColor: snackbar.severity === 'success' ? '#4caf50' : '#f44336',
            color: '#fff',
            fontWeight: 'bold',
            '& .MuiAlert-icon': {
              color: '#fff',
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
    
  )
}

export default SystemCategory
