import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, Alert, IconButton, Snackbar, Alert as MuiAlert } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CloseIcon from '@mui/icons-material/Close'
import { useDispatch } from 'react-redux'
import { systemApi } from '../../features/api/system/systemApi'

const ImportSystemDialog = ({ open, onClose, selectedTeam, onImportSuccess }) => {
  const [selectedFile, setSelectedFile] = React.useState(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState(null)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState('')
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success')
  const fileInputRef = React.useRef(null)

  const dispatch = useDispatch()

  const resetDialog = () => {
    setSelectedFile(null)
    setIsDragging(false)
    setErrorMessage(null)
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file) validateAndSetFile(file)
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

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer?.files
    if (files && files.length > 0) validateAndSetFile(files[0])
  }

  const handleRemoveFile = (e) => {
    e.stopPropagation()
    setSelectedFile(null)
    setErrorMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCancel = () => {
    if (isUploading) return
    resetDialog()
    onClose()
  }

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file first')
      return
    }

    setIsUploading(true)
    setErrorMessage(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    const token = localStorage.getItem('token')
    const baseUrl = 'http://10.10.14.61:8000/api'

    let response
    let result

    try {
      response = await fetch(`${baseUrl}/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      })
    } catch (networkError) {
      console.error('❌ Network error:', networkError)
      setErrorMessage('Network error uploading file. Please check your connection and try again.')
      setIsUploading(false)
      return
    }

    try {
      result = await response.json()
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      result = null
    }

    console.log('📥 Import response:', { httpStatus: response.status, ok: response.ok, body: result })

    const isSuccess =
      response.ok ||
      result?.status === 200 ||
      result?.message?.toLowerCase().includes('success')

    if (isSuccess) {
      setIsUploading(false)
      resetDialog()
      onClose()
      dispatch(systemApi.util.invalidateTags(['systems']))
      if (onImportSuccess) onImportSuccess()
      setTimeout(() => {
        setSnackbarMessage('Successfully imported systems and progress items!')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
      }, 100)
      return
    }

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

    const finalError = (
      <Box>
        {mainMessage && (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              mb: 1,
              color: '#d32f2f',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          >
            {mainMessage}
          </Typography>
        )}
        {detailedErrors.length > 0 && (
          <Box
            sx={{
              maxHeight: { xs: 160, sm: 300 },
              overflowY: 'auto',
              overflowX: 'hidden',
              direction: 'ltr',        // scrollbar stays on the RIGHT
              pr: 1,
            }}
          >
            {detailedErrors.map((err, idx) => (
              <Typography
                key={idx}
                variant="body2"
                display="block"
                sx={{
                  mb: 0.5,
                  color: '#d32f2f',
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  wordBreak: 'break-word',
                }}
              >
                {err ? `• ${err}` : ''}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    )

    setErrorMessage(finalError)
    setIsUploading(false)
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            mx: { xs: 2, sm: 'auto' },
            width: { xs: 'calc(100% - 32px)', sm: '100%' },
            borderRadius: { xs: 2, sm: 2 },
          }
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
          }}
        >
          Import Systems for {selectedTeam?.name}
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 2 } }}>
          <Box sx={{ pt: 1 }}>
            {errorMessage && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  '& .MuiAlert-message': { width: '100%', overflow: 'hidden' },
                }}
              >
                {errorMessage}
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
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                border: '2px dashed #03346E',
                borderRadius: '8px',
                padding: { xs: '16px 12px', sm: '20px' },
                textAlign: 'center',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                backgroundColor: isDragging ? '#e3f2fd' : '#f5f5f5',
                transition: 'all 0.3s ease',
                borderColor: isDragging ? '#022553' : '#03346E',
                opacity: isUploading ? 0.6 : 1,
                '&:hover': {
                  backgroundColor: isUploading ? '#f5f5f5' : '#f0f7ff',
                  borderColor: isUploading ? '#03346E' : '#022553',
                },
              }}
            >
              <CloudUploadIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#03346E', mb: 1 }} />
              <Typography
                variant="h6"
                sx={{
                  color: '#03346E',
                  mb: 0.5,
                  fontSize: { xs: '0.95rem', sm: '1.125rem' },
                }}
              >
                {isDragging ? 'Drop file here' : selectedFile ? 'File Selected' : 'Click to Select File'}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {isDragging ? 'Release to upload' : 'or drag and drop here'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                Supported formats: .xls, .xlsx, .csv
              </Typography>
            </Box>

            {selectedFile && (
              <Box
                sx={{
                  mt: 2,
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: '#f0f7ff',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: '#03346E', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Selected File:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      wordBreak: 'break-all',
                    }}
                  >
                    {selectedFile.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: 'block', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                  >
                    Size: {(selectedFile.size / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                  sx={{ color: '#d32f2f', ml: 1, mt: -0.5, flexShrink: 0 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            <Box
              sx={{
                mt: 2,
                p: { xs: 1.5, sm: 2 },
                bgcolor: '#f9f9f9',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Required File Format:
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                component="div"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                System Name, Team, Category, Description, Raised Date, Target Date, End Date, Status, Remarks
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, gap: 1 }}>
          <Button
            onClick={handleCancel}
            color="primary"
            disabled={isUploading}
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadClick}
            color="primary"
            variant="contained"
            sx={{
              bgcolor: '#03346E',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
            disabled={!selectedFile || isUploading}
            startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{
            backgroundColor: snackbarSeverity === 'success' ? '#4caf50' : '#f44336',
            color: '#fff',
            '& .MuiAlert-icon': { color: '#fff' },
          }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </>
  )
}

export default ImportSystemDialog