import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

const ImportSystemDialog = ({ open, onClose, selectedTeam }) => {
  const [selectedFile, setSelectedFile] = React.useState(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const validateAndSetFile = (file) => {
    const validExtensions = ['.xls', '.xlsx', '.csv']
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    
    if (validExtensions.includes(fileExtension)) {
      setSelectedFile(file)
      setIsDragging(false)
    } else {
      alert('Only .xls, .xlsx, and .csv files are allowed')
      setSelectedFile(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      validateAndSetFile(files[0])
    }
  }

  const handleUploadClick = async () => {
    if (!selectedFile) {
      alert('Please select a file first')
      return
    }

    setIsUploading(true)
    try {
      // TODO: Implement file upload logic here
      console.log('Uploading file:', selectedFile.name)
      // Simulate upload
      setTimeout(() => {
        setIsUploading(false)
        setSelectedFile(null)
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Upload error:', error)
      setIsUploading(false)
    }
  }

  const handleDialogClose = () => {
    setSelectedFile(null)
    setIsDragging(false)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Import Systems for {selectedTeam?.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx,.csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <Box
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              border: '2px dashed #03346E',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragging ? '#e3f2fd' : '#f5f5f5',
              transition: 'all 0.3s ease',
              borderColor: isDragging ? '#022553' : '#03346E',
              '&:hover': {
                backgroundColor: '#f0f7ff',
                borderColor: '#022553',
              }
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 40, color: '#03346E', mb: 1 }} />
            <Typography variant="h6" sx={{ color: '#03346E', mb: 1 }}>
              {isDragging ? 'Paste file' : (selectedFile ? 'File Selected' : 'Click to Select File')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {isDragging ? 'Release to upload' : 'or drag and drop here'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported formats: .xls, .xlsx, .csv
            </Typography>
          </Box>

          {selectedFile && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f7ff', borderRadius: '8px' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#03346E' }}>
                Selected File:
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {selectedFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Size: {(selectedFile.size / 1024).toFixed(2)} KB
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} color="primary" disabled={isUploading}>
          Cancel
        </Button>
        <Button 
          onClick={handleUploadClick} 
          color="primary" 
          variant="contained"
          sx={{ bgcolor: '#03346E' }}
          disabled={!selectedFile || isUploading}
          startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ImportSystemDialog
