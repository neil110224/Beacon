import React from 'react'
import { Box, Button, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Typography, Menu, MenuItem, IconButton, Tooltip } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import CachedIcon from '@mui/icons-material/Cached'
import { useNavigate } from 'react-router-dom'
import ImportSystemDialog from './ImportSystemDialog'
import ExportSystemDialog from './ExportSystemDialog'

const SystemCategoryDialog = ({
  open,
  onClose,
  selectedTeam,
  systemsSearchQuery,
  setSystemsSearchQuery,
  debouncedSystemsSearch,
  teamSystemsLoading,
  filteredTeamSystems,
  onRefresh
}) => {
  const navigate = useNavigate()
  const [menuAnchor, setMenuAnchor] = React.useState(null)
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
  }

  const handleImportClick = () => {
    setImportDialogOpen(true)
    handleMenuClose()
  }

  const handleExportClick = () => {
    setExportDialogOpen(true)
    handleMenuClose()
  }

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Systems for {selectedTeam?.name}
      </DialogTitle>
      <DialogContent>
        {/* Search Bar and File Menu */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
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
              flex: 1,
              maxWidth: '65%',
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
          <Button
            variant="contained"
            onClick={handleMenuOpen}
            startIcon={<FileUploadIcon />}
            sx={{ bgcolor: '#03346E', borderRadius: '20px' }}
          >
            File
          </Button>
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
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleImportClick}>
              <FileUploadIcon sx={{ mr: 1 }} /> Import
            </MenuItem>
            <MenuItem onClick={handleExportClick}>
              Export
            </MenuItem>
          </Menu>
        </Box>
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
                          onClose()
                        }}
                        sx={{
                          p: 2,
                          bgcolor: '#03346E',
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: '#022553',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 0 8px rgba(3, 52, 110, 0.4)',
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
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>

    <ImportSystemDialog 
      open={importDialogOpen} 
      onClose={() => setImportDialogOpen(false)}
      selectedTeam={selectedTeam}
    />
    <ExportSystemDialog 
      open={exportDialogOpen} 
      onClose={() => setExportDialogOpen(false)}
      selectedTeam={selectedTeam}
      filteredTeamSystems={filteredTeamSystems}
    />
    </>
  )
}

export default SystemCategoryDialog
