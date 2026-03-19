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
  CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import SearchIcon from '@mui/icons-material/Search'
import CachedIcon from '@mui/icons-material/Cached'
import ImportExportIcon from '@mui/icons-material/ImportExport'
import DownloadIcon from '@mui/icons-material/Download'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import React from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../features/api/slice/authSlice'
import { useGetSystemsListQuery, useCreateSystemMutation, useUpdateSystemMutation } from '../../features/api/system/systemApi'
import { useDebounce } from '../../hooks/useDebounce'
import { useGetTeamsQuery } from '../../features/api/team/teamApi'
import SystemFormDialog from '../dialog/SystemFormDialog'
import SystemCategoryDialog from '../dialog/SystemCategoryDialog'
import SystemteamEditDialog from '../dialog/SystemteamEditDialog'
import ImportSystemDialog from '../dialog/ImportSystemDialog'
import ExportSystemDialog from '../dialog/ExportSystemDialog'
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

  const { data: teamsData, isLoading: teamsLoading } = useGetTeamsQuery(
    !isUserRole ? { status: 'active', paginate: 'none', pagination: 'none' } : undefined,
    { skip: isUserRole }
  )

  const [createSystem] = useCreateSystemMutation()
  const [updateSystem] = useUpdateSystemMutation()

  const [searchQuery, setSearchQuery]               = React.useState('')
  const debouncedTeamsSearch                         = useDebounce(searchQuery, 500)
  const [systemsSearchQuery, setSystemsSearchQuery] = React.useState('')
  const debouncedSystemsSearch                       = useDebounce(systemsSearchQuery, 500)
  const [systemDialogOpen, setSystemDialogOpen]     = React.useState(false)
  const [selectedSystem, setSelectedSystem]         = React.useState(null)
  const [selectedTeam, setSelectedTeam]             = React.useState(null)
  const [systemsDialogOpen, setSystemsDialogOpen]   = React.useState(false)
  const [isRefreshing, setIsRefreshing]             = React.useState(false)
  const [fileMenuAnchor, setFileMenuAnchor]         = React.useState(null)
  const fileMenuOpen                                 = Boolean(fileMenuAnchor)
  const [importDialogOpen, setImportDialogOpen]     = React.useState(false)
  const [exportDialogOpen, setExportDialogOpen]     = React.useState(false)
  const [systemForEdit, setSystemForEdit]           = React.useState(null)
  const [systemEditDialogOpen, setSystemEditDialogOpen] = React.useState(false)
  const [isDownloadingTemplate, setIsDownloadingTemplate] = React.useState(false)

  // ── Fix: store anchor + team together so each card menu is independent ──
  const [menuState, setMenuState] = React.useState({ anchor: null, team: null })

  const handleMoreMenuOpen = (event, team) => {
    event.stopPropagation()
    setMenuState({ anchor: event.currentTarget, team })
  }

  const handleMoreMenuClose = () => {
    setMenuState({ anchor: null, team: null })
  }

  const handleEditTeam = (event) => {
    event.stopPropagation()
    setSystemForEdit(menuState.team)   // use the team captured when menu was opened
    setSystemEditDialogOpen(true)
    handleMoreMenuClose()
  }

  // Refresh handler
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

  const { data: allSystemsData, isLoading: allSystemsLoading, refetch: refetchAllSystems } = useGetSystemsListQuery(
    !isUserRole ? { status: 'active', scope: 'global', paginate: 'none', pagination: 'none' } : undefined,
    { skip: isUserRole }
  )

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

  const allSystems = React.useMemo(() => {
    if (!Array.isArray(allSystemsData)) {
      if (allSystemsData?.data?.data && Array.isArray(allSystemsData.data.data)) return allSystemsData.data.data
      if (allSystemsData?.data && Array.isArray(allSystemsData.data)) return allSystemsData.data
      return []
    }
    return allSystemsData
  }, [allSystemsData])

  const userTeamSystems = React.useMemo(() => {
    if (!Array.isArray(userTeamSystemsData)) {
      if (userTeamSystemsData?.data?.data && Array.isArray(userTeamSystemsData.data.data)) return userTeamSystemsData.data.data
      if (userTeamSystemsData?.data && Array.isArray(userTeamSystemsData.data)) return userTeamSystemsData.data
      return []
    }
    return userTeamSystemsData
  }, [userTeamSystemsData])

  const filteredUserTeamSystems = React.useMemo(() => {
    if (!debouncedSystemsSearch) return userTeamSystems
    return userTeamSystems.filter(s => s.systemName?.toLowerCase().includes(debouncedSystemsSearch.toLowerCase()))
  }, [userTeamSystems, debouncedSystemsSearch])

  const { data: teamSystemsData, isLoading: teamSystemsLoading, refetch: refetchTeamSystems } = useGetSystemsListQuery(
    !isUserRole && selectedTeam?.id ? {
      status: 'active',
      scope: 'global',
      team_id: selectedTeam.id,
      ...(debouncedSystemsSearch && { term: debouncedSystemsSearch }),
      paginate: 'none',
      pagination: 'none',
    } : undefined,
    { skip: isUserRole || !selectedTeam?.id }
  )

  const teams = React.useMemo(() => {
    if (!Array.isArray(teamsData)) {
      if (teamsData?.data?.data && Array.isArray(teamsData.data.data)) return teamsData.data.data
      if (teamsData?.data && Array.isArray(teamsData.data)) return teamsData.data
      return []
    }
    return teamsData
  }, [teamsData])

  const teamSystems = React.useMemo(() => {
    let systems = []
    if (!Array.isArray(teamSystemsData)) {
      if (teamSystemsData?.data?.data && Array.isArray(teamSystemsData.data.data)) systems = teamSystemsData.data.data
      else if (teamSystemsData?.data && Array.isArray(teamSystemsData.data)) systems = teamSystemsData.data
    } else {
      systems = teamSystemsData
    }
    if (selectedTeam?.id) {
      systems = systems.filter(system => {
        if (Array.isArray(system.team)) return system.team.some(t => t.id === selectedTeam.id)
        return system.team_id === selectedTeam.id || system.team?.id === selectedTeam.id
      })
    }
    return systems
  }, [teamSystemsData, selectedTeam?.id])

  const filteredTeamSystems = React.useMemo(() => {
    if (!debouncedSystemsSearch) return teamSystems
    return teamSystems.filter(s => s.systemName?.toLowerCase().includes(debouncedSystemsSearch.toLowerCase()))
  }, [teamSystems, debouncedSystemsSearch])

  const filteredTeams = React.useMemo(() => {
    if (!debouncedTeamsSearch) return teams
    return teams.filter(t => t.name?.toLowerCase().includes(debouncedTeamsSearch.toLowerCase()))
  }, [teams, debouncedTeamsSearch])

  const getRandomColor = () => '#03346E'

  const teamColorMap = React.useMemo(() => {
    const colorMap = {}
    if (Array.isArray(teams)) teams.forEach((team, index) => { colorMap[team.id] = getRandomColor(index) })
    return colorMap
  }, [teams])

  const getSystemCountForTeam = (teamId) => {
    return allSystems.filter(system => {
      if (Array.isArray(system.team)) return system.team.some(t => t.id === teamId)
      return system.team_id === teamId || system.team?.id === teamId
    }).length
  }

  const handleDialogRefresh = async () => { await refetchTeamSystems() }

  const handleFileMenuOpen  = e => setFileMenuAnchor(e.currentTarget)
  const handleFileMenuClose = ()  => setFileMenuAnchor(null)

  const handleAddSystem = () => {
    setSelectedSystem(null)
    setSystemDialogOpen(true)
  }

  const handleImportSystem = () => { setImportDialogOpen(true);  handleFileMenuClose() }
  const handleExportSystem = () => { setExportDialogOpen(true);  handleFileMenuClose() }

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true)
    try {
      const token = localStorage.getItem('token')
      const baseUrl = 'http://10.10.14.61:8000/api'
      const response = await fetch(`${baseUrl}/export_template`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      })
      if (!response.ok) throw new Error(`Download failed with status ${response.status}`)
      const blob = await response.blob()
      if (blob.size === 0) throw new Error('Empty response received')
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'Template.xlsx'
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => { document.body.removeChild(link); window.URL.revokeObjectURL(url) }, 100)
      handleFileMenuClose()
    } catch (error) {
      console.error('Error downloading template:', error)
      alert('Failed to download template')
    } finally {
      setIsDownloadingTemplate(false)
    }
  }

  const handleSystemDialogClose = () => { setSystemDialogOpen(false); setSelectedSystem(null) }

  const handleSystemsSave = async (systemData) => {
    try {
      if (selectedSystem?.id) {
        await updateSystem({ id: selectedSystem.id, body: systemData }).unwrap()
      } else {
        await createSystem(systemData).unwrap()
      }
      handleSystemDialogClose()
    } catch (error) {
      console.error('Error saving system:', error)
    }
  }

  const isActuallySidebarCollapsed = isSidebarCollapsed ? !isSidebarLocked : false
  const gridColumns = isActuallySidebarCollapsed ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)'
  const isLoading = isUserRole ? userTeamSystemsLoading : (teamsLoading || allSystemsLoading)

  if (isLoading) {
    return <Box className="systemsLoadingContainer"><Loading /></Box>
  }

  return (
    <Box className="systemsContainer"> 
      {/* Header */}
      <Box className="systemsHeader" sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
        

        <Box className="systemsHeaderActions" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Refresh systems" placement="top">
            <IconButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              sx={{ color: '#03346E', '&:hover': { backgroundColor: 'rgba(3, 52, 110, 0.08)' } }}
            >
              <CachedIcon sx={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }
              }} />
            </IconButton>
          </Tooltip>

          <TextField
            placeholder={isUserRole ? 'Search systems...' : 'Search teams...'}
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9e9e9e' }} /></InputAdornment>,
            }}
            className="systemsSearchField"
            sx={{ minWidth: 250 }}
          />

          {canAddSystem && (
            <>
              <Button variant="contained" startIcon={<ImportExportIcon />} onClick={handleFileMenuOpen} sx={{ bgcolor: '#03346E' }}>
                File
              </Button>
              <Menu anchorEl={fileMenuAnchor} open={fileMenuOpen} onClose={handleFileMenuClose}>
                <MenuItem onClick={handleImportSystem}><FileUploadIcon className="systemsMenuIcon" /> Import</MenuItem>
                <MenuItem onClick={handleExportSystem}><ExitToAppIcon className="systemsMenuIcon" /> Export</MenuItem>
                <MenuItem onClick={handleDownloadTemplate} disabled={isDownloadingTemplate}>
                  {isDownloadingTemplate ? (
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                  ) : (
                    <DownloadIcon className="systemsMenuIcon" />
                  )}
                  {isDownloadingTemplate ? 'Downloading...' : 'Template'}
                </MenuItem>
              </Menu>

              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddSystem} sx={{ bgcolor: '#03346E' }}>
                Create
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* USER VIEW */}
      {isUserRole ? (
        <>
          {filteredUserTeamSystems.length === 0 ? (
            <Box className="systemsEmptyStateContainer">
              <Box className="systemsEmptyStateBox">
                <Box><Nodata /></Box>
                <Box className="systemsEmptyStateContent">
                  <Typography variant="h6">Systems</Typography>
                  <Typography variant="body2">No records found</Typography>
                  <Typography variant="body2">There are no records to display</Typography>
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
                    <Typography variant="h6" className="systemsCardTitle" sx={{ color: '#f4f4f4', fontFamily: '"Oswald", sans-serif' }}>
                      {system.systemName}
                    </Typography>
                    <Typography variant="body2" className="systemsCardDescription" sx={{ fontFamily: '"Oswald", sans-serif' }}>
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
          {/* ADMIN VIEW */}
          {filteredTeams.length === 0 ? (
            <Box className="systemsEmptyStateContainer">
              <Box className="systemsEmptyStateBox">
                <Box><Nodata /></Box>
                <Box className="systemsEmptyStateContent">
                  <Typography variant="h6">Systems</Typography>
                  <Typography variant="body2">No records found</Typography>
                  <Typography variant="body2">There are no records to display</Typography>
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
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" className="systemsCardTitle" sx={{ color: '#f4f4f4', fontFamily: '"Oswald", sans-serif' }}>
                          {team.name}
                        </Typography>
                        <Typography variant="body2" className="systemsCardCount" sx={{ color: '#f4f4f4', fontFamily: '"Oswald", sans-serif' }}>
                          <strong>{systemCount}</strong> {systemCount === 1 ? 'system' : 'systems'}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={e => handleMoreMenuOpen(e, team)}
                        sx={{ color: '#f4f4f4', alignSelf: 'center', '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Single Menu rendered OUTSIDE the map — uses menuState.team */}
              <Menu
                anchorEl={menuState.anchor}
                open={Boolean(menuState.anchor)}
                onClose={handleMoreMenuClose}
                onClick={e => e.stopPropagation()}
                PaperProps={{ sx: { boxShadow: 'none', border: '1px solid #e0e0e0' } }}
              >
                <MenuItem onClick={handleEditTeam}>Edit</MenuItem>
              </Menu>
            </Box>
          )}

          <SystemCategoryDialog
            open={systemsDialogOpen}
            onClose={() => { setSystemsDialogOpen(false); setSystemsSearchQuery('') }}
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

      <SystemFormDialog
        open={systemDialogOpen}
        onClose={handleSystemDialogClose}
        system={selectedSystem}
        onSave={handleSystemsSave}
      />

      <ImportSystemDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        selectedTeam={selectedTeam}
        onImportSuccess={refetchAllSystems}
      />

      <ExportSystemDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        selectedTeam={selectedTeam}
        filteredTeamSystems={filteredTeamSystems}
      />

      <SystemteamEditDialog
        open={systemEditDialogOpen}
        onClose={() => { setSystemEditDialogOpen(false); setSystemForEdit(null) }}
        team={systemForEdit}
        onSuccess={() => refetchAllSystems()}
      />
    </Box>
  )
}

export default Systems