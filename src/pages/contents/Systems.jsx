import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Avatar,
  Stack,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
} from '@mui/material'
import SourceIcon from '@mui/icons-material/Source'
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight'
import AddIcon from '@mui/icons-material/Add'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import SearchIcon from '@mui/icons-material/Search'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../features/api/slice/authSlice'
import { useGetSystemsListQuery, useCreateSystemMutation, useUpdateSystemMutation } from '../../features/api/system/systemApi'
import { useDebounce } from '../../hooks/useDebounce'
import { useGetTeamsQuery } from '../../features/api/team/teamApi'
import DataTable from '../../component/reuseable/DataTable'
import SystemFormDialog from '../dialog/SystemFormDialog'

const Systems = () => {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const currentUser = useSelector(selectCurrentUser)
  const userPermissions = currentUser?.role?.access_permissions || []
  const canAddSystem = userPermissions.includes('Systems.Add')
  const canImportSystem = userPermissions.includes('Systems.Import')
  
  // Fetch all teams
  const { data: teamsData, isLoading: teamsLoading, error: teamsError } = useGetTeamsQuery({
    status: 'active',
    paginate: 'none',
    pagination: 'none',
  })

  const [createSystem] = useCreateSystemMutation()
  const [updateSystem] = useUpdateSystemMutation()
  const [searchQuery, setSearchQuery] = React.useState('')
  const debouncedTeamsSearch = useDebounce(searchQuery, 500)
  const [menuAnchor, setMenuAnchor] = React.useState(null)
  const openMenu = Boolean(menuAnchor)
  const [selectedAction, setSelectedAction] = React.useState('Create')
  const [systemsSearchQuery, setSystemsSearchQuery] = React.useState('')
  const debouncedSystemsSearch = useDebounce(systemsSearchQuery, 500)
  const [systemDialogOpen, setSystemDialogOpen] = React.useState(false)
  const [selectedSystem, setSelectedSystem] = React.useState(null)
  const [selectedTeam, setSelectedTeam] = React.useState(null)
  const [systemsDialogOpen, setSystemsDialogOpen] = React.useState(false)

  // Fetch systems for selected team with search
  const { data: teamSystemsData, isLoading: teamSystemsLoading } = useGetSystemsListQuery(
    selectedTeam?.id 
      ? {
          status: 'active',
          scope: 'global',
          team_id: selectedTeam.id,
          ...(debouncedSystemsSearch && { term: debouncedSystemsSearch }),
          paginate: 'none',
          pagination: 'none',
        }
      : undefined,
    { skip: !selectedTeam?.id }
  )

  // Safe teams data
  const teams = React.useMemo(() => {
    if (!Array.isArray(teamsData)) {
      if (teamsData?.data?.data && Array.isArray(teamsData.data.data)) {
        return teamsData.data.data
      }
      if (teamsData?.data && Array.isArray(teamsData.data)) {
        return teamsData.data
      }
      return []
    }
    return teamsData
  }, [teamsData])

  // Safe systems data from team query
  const teamSystems = React.useMemo(() => {
    if (!Array.isArray(teamSystemsData)) {
      if (teamSystemsData?.data?.data && Array.isArray(teamSystemsData.data.data)) {
        return teamSystemsData.data.data
      }
      if (teamSystemsData?.data && Array.isArray(teamSystemsData.data)) {
        return teamSystemsData.data
      }
      return []
    }
    return teamSystemsData
  }, [teamSystemsData])

  // Filter systems by debounced search term
  const filteredTeamSystems = React.useMemo(() => {
    if (!debouncedSystemsSearch) return teamSystems
    return teamSystems.filter(system =>
      system.systemName?.toLowerCase().includes(debouncedSystemsSearch.toLowerCase())
    )
  }, [teamSystems, debouncedSystemsSearch])

  // Filter teams by debounced search query
  const filteredTeams = React.useMemo(() => {
    if (!debouncedTeamsSearch) return teams
    return teams.filter(team => 
      team.name?.toLowerCase().includes(debouncedTeamsSearch.toLowerCase())
    )
  }, [teams, debouncedTeamsSearch])

  // DataTable columns
  const columns = [
    {
      id: 'name',
      label: 'Team Name',
      render: (row) => row.name || 'N/A'
    },
    {
      id: 'action',
      label: 'Action',
      render: (row) => (
        <IconButton
          size="small"
          onClick={() => {
            setSelectedTeam(row)
            setSystemsDialogOpen(true)
          }}
          sx={{
            color: '#0397d1',
            '&:hover': {
              bgcolor: 'rgba(3, 151, 209, 0.1)',
            }
          }}
        >
          <SourceIcon />
        </IconButton>
      )
    }
  ]

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
  }

  const handleAddSystem = () => {
    setSelectedSystem(null)
    setSystemDialogOpen(true)
    setSelectedAction('Create')
    handleMenuClose()
  }

  const handleImportSystem = () => {
    setSelectedAction('Import')
    // TODO: Implement import functionality
    console.log('Import system')
    handleMenuClose()
  }

  const handleExportSystem = () => {
    setSelectedAction('Export')
    // TODO: Implement export functionality
    console.log('Export system')
    handleMenuClose()
  }

  const handleSystemDialogClose = () => {
    setSystemDialogOpen(false)
    setSelectedSystem(null)
  }

  const handleSystemsSave = async (systemData) => {
    try {
      if (selectedSystem?.id) {
        await updateSystem({
          id: selectedSystem.id,
          body: systemData
        }).unwrap()
      } else {
        await createSystem(systemData).unwrap()
      }
      handleSystemDialogClose()
    } catch (error) {
      console.error('Error saving system:', error)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with Search and Add Button */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        gap: 2,
        borderBottom: '1px solid #1a1a2e',
        mb: 2,  
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
          Systems Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            placeholder="Search teams..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          
          {canAddSystem && (
            <>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleMenuOpen}
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
                {selectedAction}
              </Button>
              <Menu
                anchorEl={menuAnchor}
                open={openMenu}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleAddSystem}>
                  <AddIcon sx={{ mr: 1 }} /> Create
                </MenuItem>
                <MenuItem onClick={handleImportSystem}>
                  <FileUploadIcon sx={{ mr: 1 }} /> Import
                </MenuItem>
                <MenuItem onClick={handleExportSystem}>
                  Export
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>

      {/* Teams DataTable */}
      <Box sx={{ display: 'flex', flexDirection: 'column', }}>
        <DataTable
          columns={columns}
          rows={filteredTeams}
          isLoading={teamsLoading || searchQuery !== debouncedTeamsSearch}
          emptyMessage="No teams found"
          tableSx={{ 
            minWidth: 700,
           
            '& .MuiTableCell-root': {
              padding: '14px 16px',
              fontSize: '1rem',
              color: '#2c3e50',
            },
            '& .MuiTableBody-root .MuiTableRow-root': {
              cursor: 'default',
              fontSize: '1rem',  // 👈 only body cells (team name content)
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
      </Box>

      {/* Systems Dialog - Shows systems for selected team */}
      <Dialog
        open={systemsDialogOpen}
        onClose={() => {
          setSystemsDialogOpen(false)
          setSystemsSearchQuery('')
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Systems for {selectedTeam?.name}
        </DialogTitle>
        <DialogContent>
          {/* Search Bar */}
          <TextField
            placeholder="Search systems..."
            variant="outlined"
            size="small"
            value={systemsSearchQuery}
            onChange={(e) => setSystemsSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9e9e9e' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: '100%',
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: '#f5f5f5',
                '&:hover fieldset': {
                  borderColor: '#2c3e50',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2c3e50',
                },
              },
            }}
          />
          {selectedTeam ? (
            <Box sx={{ pt: 2 }}>
              {teamSystemsLoading || systemsSearchQuery !== debouncedSystemsSearch ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, flexDirection: 'column', gap: 2 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" color="text.secondary">
                    Searching systems...
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Total Systems: {filteredTeamSystems?.length || 0}
                  </Typography>
                  {filteredTeamSystems && filteredTeamSystems.length > 0 ? (
                    <Box sx={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 2,
                    }}>
                      {filteredTeamSystems.map((system) => (
                        <Box
                          key={system.id}
                          onClick={() => {
                            navigate(`/SystemCategory/${system.systemName}`)
                            setSystemsDialogOpen(false)
                          }}
                          sx={{
                            p: 2,
                            bgcolor: '#1a1a2e',
                            borderRadius: 1,
                            cursor: 'pointer',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: '#252d3d',
                              border: '1px solid rgba(3, 151, 209, 0.5)',
                              boxShadow: '0 0 8px rgba(3, 151, 209, 0.2)',
                            }
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#fff' }}>
                            {system.systemName}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center">
                      No systems found for this team
                    </Typography>
                  )}
                </>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSystemsDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* System Form Dialog (Add/Edit) */}
      <SystemFormDialog
        open={systemDialogOpen}
        onClose={handleSystemDialogClose}
        system={selectedSystem}
        onSave={handleSystemsSave}
      />
    </Box>
  )
}

export default Systems