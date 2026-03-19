import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, Alert, IconButton } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CloseIcon from '@mui/icons-material/Close'
import { useGetSystemsListQuery } from '../../features/api/system/systemApi'
import Snackbar from '../../component/reuseable/Snackbar'

const ImportSystemDialog = ({ open, onClose, selectedTeam, onImportSuccess }) => {
  const [selectedFile, setSelectedFile] = React.useState(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState(null)
  const [successMessage, setSuccessMessage] = React.useState(null)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState('')
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success')
  const fileInputRef = React.useRef(null)

  const { data: systemsData, refetch: refetchSystems } = useGetSystemsListQuery({ status: 'active', paginate: 'none' })

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setSnackbarOpen(true)
  }

  // Refetch systems when dialog opens
  React.useEffect(() => {
    if (open) {
      refetchSystems()
    }
  }, [open, refetchSystems])

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
      setErrorMessage(null)
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

  const handleRemoveFile = (e) => {
    e.stopPropagation()
    setSelectedFile(null)
    setErrorMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file first')
      return
    }

    setIsUploading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      console.log('📤 SENDING FILE TO IMPORT ENDPOINT:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type
      })

      const token = localStorage.getItem('token')
      const baseUrl = 'http://10.10.14.61:8000/api'

      const response = await fetch(`${baseUrl}/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Import API Error:', {
          status: response.status,
          data: result
        })
        
        let mainMessage = result?.message || 'Import failed'
        let detailedErrors = []

        if (Array.isArray(result?.errors)) {
          result.errors.forEach(error => {
            if (error.errors && typeof error.errors === 'object') {
              Object.entries(error.errors).forEach(([field, messages]) => {
                if (Array.isArray(messages)) {
                  messages.forEach(msg => {
                    detailedErrors.push(`Row ${error.row} - ${field}: ${typeof msg === 'string' ? msg : msg.message || msg}`)
                  })
                } else if (typeof messages === 'string') {
                  detailedErrors.push(`Row ${error.row} - ${field}: ${messages}`)
                }
              })
              
              if (error.errors.description?.some(msg => typeof msg === 'string' && msg.includes('duplicate'))) {
                if (error.values) {
                  detailedErrors.push('')
                  detailedErrors.push(`⚠️  Row ${error.row} - Duplicate Entry`)
                  detailedErrors.push(`System: "${error.values.system_name}" | Description: "${error.values.description}" | Raised Date: ${error.values.raised_date}`)
                  detailedErrors.push(`An entry with this System Name, Description, and Raised Date already exists.`)
                  detailedErrors.push('')
                }
              }
            }
          })
        } else if (result?.errors && typeof result.errors === 'object') {
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach(msg => {
                detailedErrors.push(`${field}: ${typeof msg === 'string' ? msg : msg.message || msg}`)
              })
            } else if (typeof messages === 'string') {
              detailedErrors.push(`${field}: ${messages}`)
            }
          })
        }

        console.error('❌ Import failed:', { message: mainMessage, errors: detailedErrors })

        const finalError = (
          <Box>
            {mainMessage && (
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 2, color: '#d32f2f' }}>
                {mainMessage}
              </Typography>
            )}
            {detailedErrors.length > 0 && (
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {detailedErrors.map((error, idx) => (
                  <Typography key={idx} variant="body2" display="block" sx={{ mb: 1, color: '#d32f2f' }}>
                    • {error}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        )

        setErrorMessage(finalError)
        setIsUploading(false)
        return
      }

      console.log('✅ Import successful:', result)

      showSnackbar(`Successfully imported systems and progress items!`, 'success')
      await refetchSystems()
      
      if (onImportSuccess) {
        await onImportSuccess()
      }
      
      setTimeout(() => {
        setSelectedFile(null)
        setSuccessMessage(null)
        onClose()
      }, 1500)

    } catch (error) {
      console.error('❌ Upload error:', error)
      setErrorMessage('Network error uploading file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDialogClose = () => {
    setSelectedFile(null)
    setIsDragging(false)
    setErrorMessage(null)
    setSuccessMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  return (
    <>
      <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Import Systems for {selectedTeam?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

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

            {/* ✅ Selected file info with X remove button */}
            {selectedFile && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f7ff', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
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

                <IconButton
                  size="small"
                  onClick={handleRemoveFile}
                  sx={{ color: '#d32f2f', ml: 1, mt: -0.5 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                Required File Format:
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                System Name, Team, Category, description, Raised Date, Target Date, End Date, Status, Remarks
              </Typography>
            </Box>
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

      <Snackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </>
  )
}

export default ImportSystemDialog