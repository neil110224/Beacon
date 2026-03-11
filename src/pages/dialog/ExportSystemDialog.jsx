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