import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Checkbox, FormControlLabel } from '@mui/material'

const ExportSystemDialog = ({ open, onClose, selectedTeam, filteredTeamSystems }) => {
  const [selectedSystems, setSelectedSystems] = React.useState({})

  const handleSelectAll = (checked) => {
    const newSelection = {}
    filteredTeamSystems?.forEach((system) => {
      newSelection[system.id] = checked
    })
    setSelectedSystems(newSelection)
  }

  const handleSelectSystem = (systemId, checked) => {
    setSelectedSystems((prev) => ({
      ...prev,
      [systemId]: checked,
    }))
  }

  const handleExport = () => {
    console.log('Exporting systems:', selectedSystems)
    onClose()
  }

  const selectedCount = Object.values(selectedSystems).filter(Boolean).length

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Export Systems for {selectedTeam?.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedCount === filteredTeamSystems?.length && filteredTeamSystems?.length > 0}
                indeterminate={selectedCount > 0 && selectedCount < filteredTeamSystems?.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            }
            label={`Select All (${filteredTeamSystems?.length || 0})`}
          />
          <Box sx={{ mt: 2, maxHeight: 300, overflowY: 'auto' }}>
            {filteredTeamSystems && filteredTeamSystems.length > 0 ? (
              filteredTeamSystems.map((system) => (
                <FormControlLabel
                  key={system.id}
                  control={
                    <Checkbox
                      checked={selectedSystems[system.id] || false}
                      onChange={(e) => handleSelectSystem(system.id, e.target.checked)}
                    />
                  }
                  label={system.systemName}
                  sx={{ display: 'block', mb: 1 }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No systems to export
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleExport} color="primary" variant="contained" disabled={selectedCount === 0}>
          Export ({selectedCount})
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ExportSystemDialog