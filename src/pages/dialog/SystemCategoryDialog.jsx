import React from 'react'
import { Box, Button, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Typography, Chip, IconButton, Tooltip } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CachedIcon from '@mui/icons-material/Cached'
import { useNavigate } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';


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
  const [isRefreshing, setIsRefreshing] = React.useState(false)

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
        {/* Search Bar */}
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
              maxWidth: '75%',
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
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}>
                    {filteredTeamSystems.map((system) => (
                      <Box
                        key={system.id}
                        onClick={() => {
                          navigate(`/SystemCategory/${system.systemName}`)
                          onClose()
                        }}
                        sx={{
                          padding: '12px 16px',
                          backgroundColor: '#03346E',
                          color: '#fff',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#022553',
                            boxShadow: '0 0 12px rgba(3, 52, 110, 0.5)',
                            transform: 'translateX(4px)',
                          }
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
    </>
  )
}

export default SystemCategoryDialog
