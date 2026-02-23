import { Box, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useGetSystemsListQuery } from '../../features/api/system/systemApi'

const SystemCategory = () => {
  const { systemName } = useParams()
  const { data: systemsData, isLoading, error } = useGetSystemsListQuery()

  // Find the current system from the systems list
  const currentSystem = useMemo(() => {
    if (!systemsData || !Array.isArray(systemsData)) return null
    return systemsData.find(sys => sys.systemName === systemName)
  }, [systemsData, systemName])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        Error loading system data:{' '}
        {error?.data?.message || error?.error || String(error?.status) || 'Unknown error'}
      </Box>
    )
  }

  if (!currentSystem) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, color: 'error.main' }}>
          System not found: {systemName}
        </Typography>
      </Box>
    )
  }

  const getStatusColor = (status) => {
    const statusColors = {
      pending: '#ff9800',
      done: '#4caf50',
      hold: '#2196f3',
      inprogress: '#9c27b0',
    }
    return statusColors[status?.toLowerCase()] || '#9e9e9e'
  }

  const handleAddItem = () => {
    // TODO: Implement add item dialog/modal
    console.log('Add item clicked for system:', systemName)
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
                  <TableContainer component={Paper} sx={{ m: 0 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Raised Date</TableCell>
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
                              <Chip
                                label={item.status}
                                size="small"
                                sx={{
                                  bgcolor: getStatusColor(item.status),
                                  color: '#fff',
                                  fontWeight: 'bold',
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ maxWidth: 200, whiteSpace: 'normal', wordWrap: 'break-word' }}>
                              {item.remarks || '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
      </Box>
    
  )
}

export default SystemCategory
