import React from 'react'
import { Box, Tabs, Tab, Button, TextField, InputAdornment } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
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
}) => {
  return (
    <Box className="masterlistTabsWrapper">
      <Tabs
        value={showArchived ? 1 : 0}
        onChange={onTabChange}
        className="masterlistTabsContainer"
      >
        <Tab label="Active" />
        <Tab label="Archived" />
      </Tabs>

      <Box className="masterlistActionBar">
        {canAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddClick}
            className="masterlistCreateButton"
            sx={{bgcolor: '#03346E'}}
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
        />
      </Box>
    </Box>
  )
}

export default MasterlistTab