import React, { useState } from 'react'
import { Box, Tabs, Tab, Button, TextField, InputAdornment, IconButton, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import CachedIcon from '@mui/icons-material/Cached'
import './reuseablescss/MasterlistTab.scss'

const MasterlistTab = ({
  // Tabs
  showArchived,
  onTabChange,
  hideTabs = false,

  // Search
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",  // default value

  // Button
  canAdd = false,
  onAddClick,
  addLabel = "Create",  // default value
  onRefresh,
  refreshing,
  onSync, // New prop for sync button
  isSyncing = false, // Show loading on sync button
}) => {
  // Use parent refreshing prop if provided, otherwise fallback to internal state
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const isRefreshing = typeof refreshing === 'boolean' ? refreshing : internalRefreshing;

  const handleRefresh = async () => {
    if (!onRefresh) return;
    if (typeof refreshing === 'boolean') {
      onRefresh(); // parent handles state
    } else {
      setInternalRefreshing(true);
      try {
        const result = await onRefresh();
        console.log('Data refreshed successfully', result);
      } catch (error) {
        console.error('Failed to refresh data:', error);
      } finally {
        setInternalRefreshing(false);
      }
    }
  };
  return (
    <Box className="masterlistTabsWrapper">
      {!hideTabs && (
        <Tabs
          value={showArchived ? 1 : 0}
          onChange={onTabChange}
          className="masterlistTabsContainer"
          sx={{fontFamily: '"Oswald", sans-serif'}}
        >
          <Tab label="Active" sx={{fontFamily: '"Oswald", sans-serif'}} />
          <Tab label="Archived" sx={{fontFamily: '"Oswald", sans-serif'}} />
        </Tabs>
      )}
      <Box className="masterlistActionBar">
        <Tooltip title="Refresh data" placement="top" sx={{fontFamily: '"Oswald", sans-serif'}}>
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

        {/* Sync Button */}
        {onSync && (
          <Button
            variant="outlined"
            onClick={onSync}
            disabled={isSyncing}
            sx={{ mx: 1, fontFamily: '"Oswald", sans-serif', color: '#03346E', borderColor: '#03346E', minWidth: 90 }}
          >
            {isSyncing ? (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span className="syncSpinner" style={{ marginRight: 6 }}>
                  <svg width="18" height="18" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke="#03346E" strokeWidth="5" strokeDasharray="90,150" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/></circle></svg>
                </span>
                Syncing...
              </span>
            ) : 'Sync'}
          </Button>
        )}

        {canAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddClick}
            className="masterlistCreateButton"
            sx={{bgcolor: '#03346E', fontFamily: '"Oswald", sans-serif'}}
          >
            {addLabel}
          </Button>
        )}

        <TextField
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="masterlistSearchIcon" />
              </InputAdornment>
            ),
          }}
          className="masterlistSearchField"
          sx={{
            fontFamily: '"Oswald", sans-serif',
            '@media (min-width: 768px)': {
              maxWidth: '400px',
              width: 'auto'
            }
          }}
        />
      </Box>
    </Box>
  )
}

export default MasterlistTab