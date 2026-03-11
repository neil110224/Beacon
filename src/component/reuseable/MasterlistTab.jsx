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

  // Search
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",  // default value

  // Button
  canAdd = false,
  onAddClick,
  addLabel = "Create",  // default value
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      const result = await onRefresh();
      console.log('Data refreshed successfully', result);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  return (
    <Box className="masterlistTabsWrapper">
      <Tabs
        value={showArchived ? 1 : 0}
        onChange={onTabChange}
        className="masterlistTabsContainer"
        sx={{fontFamily: '"Oswald", sans-serif'}}
      >
        <Tab label="Active" sx={{fontFamily: '"Oswald", sans-serif'}} />
        <Tab label="Archived" sx={{fontFamily: '"Oswald", sans-serif'}} />
      </Tabs>

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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="masterlistSearchIcon" />
              </InputAdornment>
            ),
          }}
          className="masterlistSearchField"
          sx={{fontFamily: '"Oswald", sans-serif'}}
        />
      </Box>
    </Box>
  )
}

export default MasterlistTab