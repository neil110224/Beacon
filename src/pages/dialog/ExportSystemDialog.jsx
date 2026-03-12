import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Card,
  CardContent,
} from '@mui/material'
import { useGetSystemsListQuery } from '../../features/api/system/systemApi'

const ExportSystemDialog = ({ open, onClose, selectedTeam, filteredTeamSystems }) => {
  const OSWALD = '"Oswald", sans-serif'
  const [selectedSystems, setSelectedSystems] = React.useState({})
  const [selectedTeamId, setSelectedTeamId] = React.useState(selectedTeam?.id || '')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [isLoading, setIsLoading] = React.useState(false)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  // Fetch all systems if not provided
  const { data: allSystemsData, isLoading: allSystemsLoading } = useGetSystemsListQuery({
    status: 'active',
    scope: 'global',
    paginate: 'none',
    pagination: 'none',
  })

  const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'on hold', label: 'On Hold' },
    { value: 'done', label: 'Done' },
  ]

  // Get systems data from prop or fetched data
  const systemsData = React.useMemo(() => {
    if (filteredTeamSystems && filteredTeamSystems.length > 0) {
      return filteredTeamSystems
    }

    if (!Array.isArray(allSystemsData)) {
      if (allSystemsData?.data?.data && Array.isArray(allSystemsData.data.data)) {
        return allSystemsData.data.data
      }
      if (allSystemsData?.data && Array.isArray(allSystemsData.data)) {
        return allSystemsData.data
      }
      return []
    }
    return allSystemsData || []
  }, [filteredTeamSystems, allSystemsData])

  // Extract unique teams from systems
  const allTeams = React.useMemo(() => {
    const teamsMap = new Map()
    systemsData?.forEach((system) => {
      system.team?.forEach((team) => {
        if (!teamsMap.has(team.id)) {
          teamsMap.set(team.id, team)
        }
      })
    })
    return Array.from(teamsMap.values())
  }, [systemsData])

  // Initialize selected team on dialog open
  React.useEffect(() => {
    if (open && allTeams.length > 0) {
      if (selectedTeam?.id) {
        setSelectedTeamId(selectedTeam.id)
      } else if (!selectedTeamId && allTeams.length > 0) {
        setSelectedTeamId(allTeams[0].id)
      }
    }
  }, [open, allTeams, selectedTeam?.id])

  // Filter systems by selected team
  const systemsForSelectedTeam = React.useMemo(() => {
    if (!selectedTeamId || !systemsData) return []
    return systemsData.filter((system) =>
      system.team.some((team) => team.id === parseInt(selectedTeamId))
    )
  }, [selectedTeamId, systemsData])

  // Helper function to check if system has items matching status filter
  const hasMatchingStatusItems = React.useCallback((system) => {
    if (statusFilter === 'all') return true
    return system.categories?.some((category) =>
      category.progress?.some((item) => item.status.toLowerCase() === statusFilter.toLowerCase())
    )
  }, [statusFilter])

  // Filter systems based on status filter
  const filteredSystemsByStatus = React.useMemo(() => {
    if (statusFilter === 'all') {
      return systemsForSelectedTeam
    }
    return systemsForSelectedTeam.filter((system) => hasMatchingStatusItems(system))
  }, [systemsForSelectedTeam, statusFilter, hasMatchingStatusItems])

  // Validate if system has at least one category to export
  const canExportSystem = React.useCallback((system) => {
    if (!system.categories || system.categories.length === 0) {
      return false
    }
    
    if (statusFilter === 'all') {
      return system.categories.some((cat) => cat.progress && cat.progress.length > 0)
    }
    
    return system.categories.some((category) =>
      category.progress?.some((item) => item.status.toLowerCase() === statusFilter.toLowerCase())
    )
  }, [statusFilter])

  const handleSelectAll = (checked) => {
    const newSelection = {}
    filteredSystemsByStatus?.forEach((system) => {
      if (canExportSystem(system)) {
        newSelection[system.id] = checked
      }
    })
    setSelectedSystems(newSelection)
  }

  const handleSelectSystem = (systemId, checked) => {
    setSelectedSystems((prev) => ({
      ...prev,
      [systemId]: checked,
    }))
  }

  const handleExport = async () => {
    const selectedSystemIds = Object.keys(selectedSystems).filter((id) => selectedSystems[id])
    const systemsToExport = filteredSystemsByStatus?.filter((system) =>
      selectedSystemIds.includes(system.id.toString()) && canExportSystem(system)
    )

    if (systemsToExport.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one system with items to export',
        severity: 'error',
      })
      return
    }

    try {
      setIsLoading(true)

      // Collect all unique categories with their filtered progress
      const categoriesToExport = []
      systemsToExport.forEach((system) => {
        system.categories?.forEach((category) => {
          const filteredProgress = category.progress.filter((item) => {
            if (statusFilter === 'all') return true
            return item.status.toLowerCase() === statusFilter.toLowerCase()
          })

          if (filteredProgress.length > 0) {
            categoriesToExport.push({
              categoryName: category.categoryName,
              items: filteredProgress,
              system: system.systemName,
            })
          }
        })
      })

      if (categoriesToExport.length === 0) {
        setSnackbar({
          open: true,
          message: 'No items to export',
          severity: 'error',
        })
        setIsLoading(false)
        return
      }

      // Prepare data for API
      const exportPayload = {
        systems: systemsToExport.map((system) => ({
          id: system.id,
          systemName: system.systemName,
          created_at: system.created_at,
          updated_at: system.updated_at,
          team: system.team,
          categories: system.categories
            .map((category) => ({
              categoryName: category.categoryName,
              progress: category.progress.filter((item) => {
                if (statusFilter === 'all') return true
                return item.status.toLowerCase() === statusFilter.toLowerCase()
              }),
            }))
            .filter((cat) => cat.progress.length > 0),
        })),
        status: statusFilter === 'all' ? null : statusFilter,
        exportDate: new Date().toISOString(),
      }

      const queryString = new URLSearchParams(
        Object.entries(exportPayload).map(([key, value]) => [key, JSON.stringify(value)])
      ).toString()
      
      const response = await fetch(`http://10.10.14.61:8000/api/export_template?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`)
      }

      // Get the Excel file from response
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const selectedTeamName = allTeams.find((t) => t.id === parseInt(selectedTeamId))?.name || 'export'
      const statusSuffix = statusFilter === 'all' ? 'all' : statusFilter
      link.download = `systems-export-${selectedTeamName}-${statusSuffix}-${new Date().toISOString().split('T')[0]}.xlsx`
      link.click()
      URL.revokeObjectURL(url)

      setSnackbar({
        open: true,
        message: `Successfully exported ${selectedSystemIds.length} system(s) to Excel`,
        severity: 'success',
      })
      onClose()
    } catch (error) {
      console.error('Export error:', error)
      setSnackbar({
        open: true,
        message: error.message || 'Failed to export systems to Excel',
        severity: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  const selectedCount = Object.values(selectedSystems).filter(Boolean).length
  const totalSystems = filteredSystemsByStatus?.filter(s => canExportSystem(s))?.length || 0

  React.useEffect(() => {
    // Reset selections when changing teams
    setSelectedSystems({})
  }, [selectedTeamId])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontFamily: OSWALD, fontWeight: 600, color: '#2c3e50' }}>
        Export Systems
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {/* Team Selector */}
          <FormControl fullWidth>
            <InputLabel sx={{ fontFamily: OSWALD }}>Select Team</InputLabel>
            <Select
              value={selectedTeamId}
              label="Select Team"
              onChange={(e) => {
                setSelectedTeamId(e.target.value)
                setSelectedSystems({})
              }}
              disabled={allSystemsLoading || allTeams.length === 0}
              sx={{ fontFamily: OSWALD }}
            >
              {allTeams.length > 0 ? (
                allTeams.map((team) => (
                  <MenuItem key={team.id} value={team.id} sx={{ fontFamily: OSWALD }}>
                    {team.name} ({team.code})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled sx={{ fontFamily: OSWALD }}>
                  {allSystemsLoading ? 'Loading teams...' : 'No teams available'}
                </MenuItem>
              )}
            </Select>
          </FormControl>

          {/* Status Filter */}
          <FormControl fullWidth>
            <InputLabel sx={{ fontFamily: OSWALD }}>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={isLoading}
              sx={{ fontFamily: OSWALD }}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ fontFamily: OSWALD }}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider />

          {/* Select All */}
          <FormControlLabel
            control={
              <Checkbox
                checked={filteredSystemsByStatus.length > 0 && selectedCount === filteredSystemsByStatus.filter(s => canExportSystem(s)).length && selectedCount > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                disabled={isLoading || filteredSystemsByStatus.length === 0}
              />
            }
            label={
              <Typography sx={{ fontFamily: OSWALD }}>
                Select All ({selectedCount}/{filteredSystemsByStatus.filter(s => canExportSystem(s)).length})
              </Typography>
            }
          />

          {/* Systems List */}
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {allSystemsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : filteredSystemsByStatus && filteredSystemsByStatus.length > 0 ? (
              filteredSystemsByStatus.map((system) => (
                <Card key={system.id} sx={{ mb: 2, backgroundColor: canExportSystem(system) ? '#f8f9fa' : '#f5f5f5', opacity: canExportSystem(system) ? 1 : 0.6 }}>
                  <CardContent sx={{ pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Checkbox
                        checked={selectedSystems[system.id] || false}
                        onChange={(e) => handleSelectSystem(system.id, e.target.checked)}
                        disabled={isLoading || !canExportSystem(system)}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontFamily: OSWALD, fontWeight: 600, fontSize: '1rem', color: !canExportSystem(system) ? '#999' : '#000' }}>
                          {system.systemName}
                          {!canExportSystem(system) && <span style={{ fontSize: '0.8rem', marginLeft: '8px', color: '#d32f2f' }}>(No matching items)</span>}
                        </Typography>
                        <Typography sx={{ fontFamily: OSWALD, fontSize: '0.85rem', color: '#666', mt: 0.5 }}>
                          Teams: {system.team.map((t) => t.name).join(', ')}
                        </Typography>
                        <Typography sx={{ fontFamily: OSWALD, fontSize: '0.85rem', color: '#666', mt: 0.5 }}>
                          Categories: {system.categories.length}
                        </Typography>
                        {system.categories.length > 0 && (
                          <Box sx={{ mt: 1, ml: 1 }}>
                            {system.categories.map((category, idx) => {
                              const filteredProgress = category.progress.filter((item) => {
                                if (statusFilter === 'all') return true
                                return item.status.toLowerCase() === statusFilter.toLowerCase()
                              })
                              return (
                                <Typography key={idx} sx={{ fontFamily: OSWALD, fontSize: '0.8rem', color: filteredProgress.length > 0 ? '#555' : '#ccc' }}>
                                  • {category.categoryName}: {filteredProgress.length} item(s)
                                </Typography>
                              )
                            })}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography sx={{ fontFamily: OSWALD, textAlign: 'center', color: '#999', py: 3 }}>
                {!selectedTeamId ? 'Please select a team first' : systemsForSelectedTeam.length === 0 ? 'No systems available for this team' : `No systems with ${statusFilter === 'all' ? 'items' : statusFilter} status in selected team`}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading} sx={{ fontFamily: OSWALD }}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={selectedCount === 0 || isLoading}
          startIcon={isLoading && <CircularProgress size={20} />}
          sx={{
            backgroundColor: '#2c3e50',
            fontFamily: OSWALD,
            '&:hover': { backgroundColor: '#34495e' },
          }}
        >
          {isLoading ? 'Exporting...' : `Export (${selectedCount})`}
        </Button>
      </DialogActions>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={handleCloseSnackbar} sx={{ fontFamily: OSWALD }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  )
}

export default ExportSystemDialog