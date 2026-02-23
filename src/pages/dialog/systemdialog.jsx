import React from 'react'

const systemdialog = () => {
  return (
    <Box>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
              <DialogTitle>System Details - {systemName}</DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="System Name"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Description"
                    value={systemDescription}
                    onChange={(e) => setSystemDescription(e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button onClick={handleSaveSystem} variant="contained">Save</Button>
              </DialogActions>
            </Dialog>
    </Box>

    
  )
}

export default systemdialog