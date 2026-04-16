import React from 'react'
import { Box, Button, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Typography, Chip, IconButton, Tooltip } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CachedIcon from '@mui/icons-material/Cached'
import { useNavigate } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import './dialogscss/SystemCategoryDialog.scss'


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
      className="systemCategoryDialog"
    >
      <DialogTitle className="systemCategoryDialogTitle">
        Systems for {selectedTeam?.name}
      </DialogTitle>
      <DialogContent>
        {/* Search Bar */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }} className="systemCategoryDialogSearchBar">
          <TextField
            placeholder="Search systems..."
            variant="outlined"
            size="small"
            value={systemsSearchQuery}
            onChange={(e) => setSystemsSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="systemCategoryDialogSearchIcon" />
                </InputAdornment>
              ),
            }}
            className="systemCategoryDialogSearchField"
            sx={{
              flex: 1,
              maxWidth: '75%',
            }}
          />
          <Tooltip title="Refresh systems" placement="top">
            <IconButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="systemCategoryDialogRefreshBtn"
            >
              <CachedIcon className="systemCategoryDialogRefreshIcon" sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
            </IconButton>
          </Tooltip>
        </Box>
        {selectedTeam ? (
          <Box sx={{ pt: 2 }} className="systemCategoryDialogContentWrap">
            {teamSystemsLoading || systemsSearchQuery !== debouncedSystemsSearch ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, flexDirection: 'column', gap: 2 }} className="systemCategoryDialogLoadingWrap">
                <CircularProgress size={40} className="systemCategoryDialogLoading" />
                <Typography variant="body2" className="systemCategoryDialogMutedText">
                  Searching systems...
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="body2" className="systemCategoryDialogMutedText" sx={{ mb: 2 }}>
                  Total Systems: {filteredTeamSystems?.length || 0}
                </Typography>
                {filteredTeamSystems && filteredTeamSystems.length > 0 ? (
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }} className="systemCategoryDialogList">
                    {filteredTeamSystems.map((system) => (
                      <Box
                        key={system.id}
                        onClick={() => {
                          navigate(`/SystemCategory/${system.systemName}`)
                          onClose()
                        }}
                        className="systemCategoryDialogListItem"
                        sx={{
                          padding: '12px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {system.systemName}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" className="systemCategoryDialogMutedText" align="center">
                    No systems found for this team
                  </Typography>
                )}
              </>
            )}
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions className="systemCategoryDialogActions">
        <Button onClick={onClose} className="systemCategoryDialogCloseBtn">
          Close
        </Button>
      </DialogActions>
    </Dialog>
    </>
  )
}

export default SystemCategoryDialog
