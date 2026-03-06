import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import SearchIcon from '@mui/icons-material/Search'
import CachedIcon from '@mui/icons-material/Cached'
import React from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../features/api/slice/authSlice'
import { useGetSystemsListQuery, useCreateSystemMutation, useUpdateSystemMutation } from '../../features/api/system/systemApi'
import { useDebounce } from '../../hooks/useDebounce'
import { useGetTeamsQuery } from '../../features/api/team/teamApi'
import SystemFormDialog from '../dialog/SystemFormDialog'
import SystemCategoryDialog from '../dialog/SystemCategoryDialog'
import Nodata from '../../component/reuseable/Nodata'
import Loading from '../../component/reuseable/Loading'
import '../contentscss/System.scss'

const Systems = () => {
  const navigate = useNavigate()
  const { isSidebarCollapsed = false, isSidebarLocked = false } = useOutletContext() || {}
  const user = useSelector(selectCurrentUser)
  const currentUser = useSelector(selectCurrentUser)
  const userPermissions = currentUser?.role?.access_permissions || []
  const canAddSystem = userPermissions.includes('Systems.Add')
  const canImportSystem = userPermissions.includes('Systems.Import')
  const isUserRole = user?.role?.name?.toLowerCase() === 'user'
  
  // Fetch all teams (for admin view)
  const { data: teamsData, isLoading: teamsLoading, error: teamsError } = useGetTeamsQuery(
    !isUserRole ? {
      status: 'active',
      paginate: 'none',
      pagination: 'none',
    } : undefined,
    { skip: isUserRole }
  )

  const [createSystem] = useCreateSystemMutation()
  const [updateSystem] = useUpdateSystemMutation()
  const [searchQuery, setSearchQuery] = React.useState('')
  const debouncedTeamsSearch = useDebounce(searchQuery, 500)
  const [menuAnchor, setMenuAnchor] = React.useState(null)
  const openMenu = Boolean(menuAnchor)
  const [systemsSearchQuery, setSystemsSearchQuery] = React.useState('')
  const debouncedSystemsSearch = useDebounce(systemsSearchQuery, 500)
  const [systemDialogOpen, setSystemDialogOpen] = React.useState(false)
  const [selectedSystem, setSelectedSystem] = React.useState(null)
  const [selectedTeam, setSelectedTeam] = React.useState(null)
  const [systemsDialogOpen, setSystemsDialogOpen] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Refresh handler for both user and admin views
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (isUserRole) {
        await refetchUserTeamSystems()
      } else {
        await refetchAllSystems()
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  // Fetch all systems to count per team (admin view)
  const { data: allSystemsData, isLoading: allSystemsLoading, refetch: refetchAllSystems } = useGetSystemsListQuery(
    !isUserRole ? {
      status: 'active',
      scope: 'global',
      paginate: 'none',
      pagination: 'none',
    } : undefined,
    { skip: isUserRole }
  )

  // Fetch systems for user's team (user view)
  const { data: userTeamSystemsData, isLoading: userTeamSystemsLoading, refetch: refetchUserTeamSystems } = useGetSystemsListQuery(
    isUserRole && user?.team?.id ? {
      status: 'active',
      scope: 'per_team',
      team_id: user.team.id,
      ...(debouncedSystemsSearch && { term: debouncedSystemsSearch }),
      paginate: 'none',
      pagination: 'none',
    } : undefined,
    { skip: !isUserRole || !user?.team?.id }
  )

  // Safe all systems data (admin view)
  const allSystems = React.useMemo(() => {
    if (!Array.isArray(allSystemsData)) {
      if (allSystemsData?.data?.data && Array.isArray(allSystemsData.data.data)) {
        return allSystemsData.data.data
      }
      if (allSystemsData?.data && Array.isArray(allSystemsData.data)) {
        return allSystemsData.data
      }
      return []
    }
    return allSystemsData
  }, [allSystemsData])

  // Safe user team systems data (user view)
  const userTeamSystems = React.useMemo(() => {
    if (!Array.isArray(userTeamSystemsData)) {
      if (userTeamSystemsData?.data?.data && Array.isArray(userTeamSystemsData.data.data)) {
        return userTeamSystemsData.data.data
      }
      if (userTeamSystemsData?.data && Array.isArray(userTeamSystemsData.data)) {
        return userTeamSystemsData.data
      }
      return []
    }
    return userTeamSystemsData
  }, [userTeamSystemsData])

  // Filter user team systems by debounced search
  const filteredUserTeamSystems = React.useMemo(() => {
    if (!debouncedSystemsSearch) return userTeamSystems
    return userTeamSystems.filter(system =>
      system.systemName?.toLowerCase().includes(debouncedSystemsSearch.toLowerCase())
    )
  }, [userTeamSystems, debouncedSystemsSearch])

  // Fetch systems for selected team with search (admin view)
  const { data: teamSystemsData, isLoading: teamSystemsLoading, refetch: refetchTeamSystems } = useGetSystemsListQuery(
    !isUserRole && selectedTeam?.id 
      ? {
          status: 'active',
          scope: 'global',
          team_id: selectedTeam.id,
          ...(debouncedSystemsSearch && { term: debouncedSystemsSearch }),
          paginate: 'none',
          pagination: 'none',
        }
      : undefined,
    { skip: isUserRole || !selectedTeam?.id }
  )

  // Safe teams data (admin view)
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

  // Safe systems data from team query (admin view) - filter by team on frontend
  const teamSystems = React.useMemo(() => {
    let systems = []
    if (!Array.isArray(teamSystemsData)) {
      if (teamSystemsData?.data?.data && Array.isArray(teamSystemsData.data.data)) {
        systems = teamSystemsData.data.data
      } else if (teamSystemsData?.data && Array.isArray(teamSystemsData.data)) {
        systems = teamSystemsData.data
      }
    } else {
      systems = teamSystemsData
    }
    
    // Filter by selected team on frontend as backup
    if (selectedTeam?.id) {
      systems = systems.filter(system => 
        system.team_id === selectedTeam.id || system.team?.id === selectedTeam.id
      )
    }
    
    return systems
  }, [teamSystemsData, selectedTeam?.id])

  // Filter systems by debounced search term (admin view)
  const filteredTeamSystems = React.useMemo(() => {
    if (!debouncedSystemsSearch) return teamSystems
    return teamSystems.filter(system =>
      system.systemName?.toLowerCase().includes(debouncedSystemsSearch.toLowerCase())
    )
  }, [teamSystems, debouncedSystemsSearch])

  // Filter teams by debounced search query (admin view)
  const filteredTeams = React.useMemo(() => {
    if (!debouncedTeamsSearch) return teams
    return teams.filter(team => 
      team.name?.toLowerCase().includes(debouncedTeamsSearch.toLowerCase())
    )
  }, [teams, debouncedTeamsSearch])

  // Random color generator
  const getRandomColor = (seed) => {
    const colors = [
      '#FFB6C1', '#87CEEB', '#98FB98', '#FFD700', '#FF6347',
      '#DDA0DD', '#F0E68C', '#87CEEB', '#FFA07A', '#20B2AA',
      '#DA70D6', '#F08080', '#B0E0E6', '#FFE4B5', '#F0FFFF'
    ]
    return colors[seed % colors.length]
  }

  // Memoize team color map
  const teamColorMap = React.useMemo(() => {
    const colorMap = {}
    if (Array.isArray(teams)) {
      teams.forEach((team, index) => {
        colorMap[team.id] = getRandomColor(index)
      })
    }
    return colorMap
  }, [teams])

  // Get system count per team from all systems
  const getSystemCountForTeam = (teamId) => {
    return allSystems.filter(system => 
      system.team_id === teamId || system.team?.id === teamId
    ).length
  }

  // Refresh handler for the SystemCategoryDialog
  const handleDialogRefresh = async () => {
    await refetchTeamSystems()
  }

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
  }

  const handleAddSystem = () => {
    setSelectedSystem(null)
    setSystemDialogOpen(true)
    handleMenuClose()
  }

  const handleImportSystem = () => {
    console.log('Import system')
    handleMenuClose()
  }

  const handleExportSystem = () => {
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

  // Get actual collapsed state
  const isActuallySidebarCollapsed = isSidebarCollapsed ? !isSidebarLocked : false
  const gridColumns = isActuallySidebarCollapsed ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)'

  // Determine which loading state to use
  const isLoading = isUserRole ? userTeamSystemsLoading : (teamsLoading || allSystemsLoading)

  if (isLoading) {
    return (
      <Box className="systemsLoadingContainer">
        <Loading />
      </Box>
    )
  }

  return (
    <Box className="systemsContainer">
      {/* Header with Search, Refresh, and Add Button */}
      <Box className="systemsHeader" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h5" className="systemsTitle">
          {isUserRole ? 'Systems' : 'Systems Management'}
        </Typography>
        
        <Box className="systemsHeaderActions" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Refresh systems" placement="top">
            <IconButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              sx={{
                color: '#03346E',
                '&:hover': { backgroundColor: 'rgba(3, 52, 110, 0.08)' }
              }}
            >
              <CachedIcon sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
            </IconButton>
          </Tooltip>
          
          <TextField
            placeholder={isUserRole ? 'Search systems...' : 'Search teams...'}
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
            className="systemsSearchField"
            sx={{ minWidth: 250 }}
          />
          
          {canAddSystem && (
            <>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleMenuOpen}
                className="systemsAddButton"
                sx={{ bgcolor: '#03346E' }}
              >
                Create
              </Button>
              <Menu
                anchorEl={menuAnchor}
                open={openMenu}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleAddSystem}>
                  <AddIcon className="systemsMenuIcon" /> Create
                </MenuItem>
                <MenuItem onClick={handleImportSystem}>
                  <FileUploadIcon className="systemsMenuIcon" /> Import
                </MenuItem>
                <MenuItem onClick={handleExportSystem}>
                  Export
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>

      {/* USER VIEW - Show only systems from their team */}
      {isUserRole ? (
        <>
          {filteredUserTeamSystems.length === 0 ? (
            <Box className="systemsEmptyStateContainer">
              <Box className="systemsEmptyStateBox">
                <Box><Nodata /></Box>
                <Box className="systemsEmptyStateContent">
                  <Typography variant="h6">
                    Systems
                  </Typography>
                  <Typography variant="body2">
                    No records found
                  </Typography>
                  <Typography variant="body2">
                    There are no records to display
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box className="systemsCardsGrid" sx={{ gridTemplateColumns: gridColumns }}>
              {filteredUserTeamSystems.map((system, idx) => (
                <Card 
                  key={`${system.id}-${idx}`}
                  className="systemsCard"
                  style={{ backgroundColor: getRandomColor(idx) }}
                  onClick={() => navigate(`/SystemCategory/${system.systemName}`)}
                >
                  <CardContent>
                    <Typography variant="h6" className="systemsCardTitle">
                      {system.systemName}
                    </Typography>
                    <Typography variant="body2" className="systemsCardDescription">
                      {system.description || 'No description'}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </>
      ) : (
        <>
          {/* ADMIN VIEW - Show all teams, clickable to see systems */}
          {filteredTeams.length === 0 ? (
            <Box className="systemsEmptyStateContainer">
              <Box className="systemsEmptyStateBox">
                <Box><Nodata /></Box>
                <Box className="systemsEmptyStateContent">
                  <Typography variant="h6">
                    Systems
                  </Typography>
                  <Typography variant="body2">
                    No records found
                  </Typography>
                  <Typography variant="body2">
                    There are no records to display
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box className="systemsCardsGrid" sx={{ gridTemplateColumns: gridColumns }}>
              {filteredTeams.map(team => {
            const systemCount = getSystemCountForTeam(team.id)
            return (
              <Card 
                key={team.id} 
                className="systemsCard"
                style={{ backgroundColor: teamColorMap[team.id] }}
                onClick={() => {
                  setSelectedTeam(team)
                  setSystemsDialogOpen(true)
                }}
              >
                <CardContent>
                  <Typography variant="h6" className="systemsCardTitle">
                    {team.name}
                  </Typography>
                  <Typography variant="body2" className="systemsCardCount">
                    <strong>{systemCount}</strong> {systemCount === 1 ? 'system' : 'systems'}
                  </Typography>
                </CardContent>
              </Card>
            )
          })}
            </Box>
          )}

          {/* Systems Dialog - Shows systems for selected team */}
          <SystemCategoryDialog
            open={systemsDialogOpen}
            onClose={() => {
              setSystemsDialogOpen(false)
              setSystemsSearchQuery('')
            }}
            selectedTeam={selectedTeam}
            systemsSearchQuery={systemsSearchQuery}
            setSystemsSearchQuery={setSystemsSearchQuery}
            debouncedSystemsSearch={debouncedSystemsSearch}
            teamSystemsLoading={teamSystemsLoading}
            filteredTeamSystems={filteredTeamSystems}
            onRefresh={handleDialogRefresh}
          />
        </>
      )}

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