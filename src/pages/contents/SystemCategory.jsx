import { Box, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Select, MenuItem, Snackbar, Alert, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Menu, Tabs, Tab, FormControl, InputLabel, Tooltip, Checkbox, Collapse } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import React, { useMemo, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../features/api/slice/authSlice'
import { useGetSystemsListQuery } from '../../features/api/system/systemApi'
import { useUpdateProgressStatusMutation, useUpdateProgressMutation, useCreateProgressMutation } from '../../features/api/progress/progressApi'
import { useGetCategoriesListQuery } from '../../features/api/category/categoryApi'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import '../contentscss/SystemCategory.scss'
import Confirmation from '../../component/reuseable/Confirmation'
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream'

const OSWALD = '"Oswald", sans-serif'
const PAGE_SIZE = 10

const SystemCategory = () => {
  const navigate = useNavigate()
  const { systemName } = useParams()
  const user = useSelector(selectCurrentUser)

  const buildQueryParams = () => {
    const isUserRole = user?.role?.name?.toLowerCase() === "user"
    if (isUserRole && user?.team?.id) {
      return { status: "active", scope: "per_team", team_id: user.team.id }
    } else {
      return { status: "active", scope: "global" }
    }
  }

  const queryParams = buildQueryParams()
  const { data: systemsData, isLoading, error, refetch } = useGetSystemsListQuery(queryParams)
  const [updateProgressStatus] = useUpdateProgressStatusMutation()
  const [updateProgress] = useUpdateProgressMutation()
  const [createProgress] = useCreateProgressMutation()
  const { data: categoriesData } = useGetCategoriesListQuery({ status: 'active', pagination: 'none' })

  const [editingStatus, setEditingStatus] = useState({})
  const [editingDates, setEditingDates] = useState({})
  const [editingRemarks, setEditingRemarks] = useState({})
  const [editingRemarksMode, setEditingRemarksMode] = useState({})
  const [selectedRemarksItem, setSelectedRemarksItem] = useState(null)
  const [loadingStatusId, setLoadingStatusId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [markAsDoneDialog, setMarkAsDoneDialog] = useState({ open: false, item: null, action: null })
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('pending')
  const [dateEditDialog, setDateEditDialog] = useState({ open: false, item: null, raised_date: null, target_date: null, end_date: null })
  const [createDialog, setCreateDialog] = useState({ open: false, selectedCategory: '', description: '', raisedDate: null, targetDate: null, remarks: '' })
  const [createLoading, setCreateLoading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState(null)
  const [editDialog, setEditDialog] = useState({ open: false, item: null, remarks: '' })

  // Per-category "show all" toggle (key = category index)
  const [expandedCategories, setExpandedCategories] = useState({})

  // Selection state: { [categoryIdx]: Set of item ids }
  const [selectedItems, setSelectedItems] = useState({})

  // Bulk mark as done dialog
  const [bulkDoneDialog, setBulkDoneDialog] = useState({ open: false, categoryIdx: null, end_date: null })
  const [bulkLoading, setBulkLoading] = useState(false)

  const currentSystem = useMemo(() => {
    if (!systemsData || !Array.isArray(systemsData)) return null
    return systemsData.find(sys => sys.systemName === systemName) || null
  }, [systemsData, systemName])

  const allCategories = useMemo(() => {
    if (!categoriesData) return []
    if (Array.isArray(categoriesData)) return categoriesData
    if (Array.isArray(categoriesData.data)) return categoriesData.data
    if (Array.isArray(categoriesData.data?.data)) return categoriesData.data.data
    if (Array.isArray(categoriesData.results)) return categoriesData.results
    if (Array.isArray(categoriesData.categories)) return categoriesData.categories
    return []
  }, [categoriesData])

  const getStatusColor = useCallback((status) => {
    const statusColors = { pending: '#ff9800', done: '#4caf50', hold: '#2196f3', inprogress: '#9c27b0' }
    return statusColors[status?.toLowerCase()] || '#9e9e9e'
  }, [])

  const STATUS_OPTIONS = useMemo(() => [
    { value: 'pending', label: 'Pending' },
    { value: 'hold', label: 'On Hold' },
    { value: 'done', label: 'Done' },
  ], [])

  const getStatusLabel = useCallback((status) => {
    const statusMap = { 'pending': 'Pending', 'hold': 'On Hold', 'done': 'Done', 'inprogress': 'In Progress' }
    return statusMap[status?.toLowerCase()] || status || '-'
  }, [])

  const getUpdatedBy = useCallback((item) => {
    const updatedBy = item?.updated_by
    if (updatedBy) {
      const first = updatedBy.first_name || ''
      const last = updatedBy.last_name || ''
      const fullName = `${first} ${last}`.trim()
      if (fullName !== '') return fullName
      if (updatedBy.username) return updatedBy.username
      if (updatedBy.name) return updatedBy.name
      return typeof updatedBy === 'string' ? updatedBy : '-'
    }
    return '-'
  }, [])

  // ── Selection helpers ──────────────────────────────────────────────────────

  const getSelected = useCallback((catIdx) => selectedItems[catIdx] || new Set(), [selectedItems])

  const toggleSelectItem = useCallback((catIdx, itemId) => {
    setSelectedItems(prev => {
      const set = new Set(prev[catIdx] || [])
      set.has(itemId) ? set.delete(itemId) : set.add(itemId)
      return { ...prev, [catIdx]: set }
    })
  }, [])

  const toggleSelectAll = useCallback((catIdx, visibleItems) => {
    setSelectedItems(prev => {
      const set = new Set(prev[catIdx] || [])
      const allSelected = visibleItems.every(i => set.has(i.id))
      if (allSelected) {
        visibleItems.forEach(i => set.delete(i.id))
      } else {
        visibleItems.forEach(i => set.add(i.id))
      }
      return { ...prev, [catIdx]: set }
    })
  }, [])

  const clearSelection = useCallback((catIdx) => {
    setSelectedItems(prev => ({ ...prev, [catIdx]: new Set() }))
  }, [])

  // ── Bulk Mark As Done ──────────────────────────────────────────────────────

  const handleOpenBulkDone = useCallback((catIdx) => {
    setBulkDoneDialog({ open: true, categoryIdx: catIdx, end_date: null })
  }, [])

  const handleCloseBulkDone = useCallback(() => {
    setBulkDoneDialog({ open: false, categoryIdx: null, end_date: null })
  }, [])

  const handleConfirmBulkDone = useCallback(async () => {
    const { categoryIdx, end_date } = bulkDoneDialog
    if (categoryIdx === null || !end_date) return
    const ids = Array.from(getSelected(categoryIdx))
    if (!ids.length) return
    setBulkLoading(true)
    try {
      await Promise.all(ids.map(id =>
        updateProgress({ progressId: id, status: 'done', end_date: end_date.format('YYYY-MM-DD') }).unwrap()
      ))
      await refetch()
      clearSelection(categoryIdx)
      setSnackbar({ open: true, message: `${ids.length} item(s) marked as done!`, severity: 'success' })
      handleCloseBulkDone()
    } catch (err) {
      let msg = 'Failed to mark items as done'
      if (err?.data?.errors?.length > 0) msg = err.data.errors[0]?.detail || msg
      else if (err?.data?.message) msg = err.data.message
      setSnackbar({ open: true, message: msg, severity: 'error' })
    } finally {
      setBulkLoading(false)
    }
  }, [bulkDoneDialog, getSelected, updateProgress, refetch, clearSelection])

  // ── Existing handlers ──────────────────────────────────────────────────────

  const handleStatusChange = useCallback(async (itemId, newStatus) => {
    setEditingStatus(prev => ({ ...prev, [itemId]: newStatus }))
    setLoadingStatusId(itemId)
    try {
      await updateProgressStatus({ progressId: itemId, status: newStatus }).unwrap()
      await refetch()
      setEditingStatus(prev => { const s = { ...prev }; delete s[itemId]; return s })
      setSnackbar({ open: true, message: 'Status updated successfully!', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: err?.data?.message || 'Failed to update status', severity: 'error' })
      setEditingStatus(prev => { const s = { ...prev }; delete s[itemId]; return s })
    } finally {
      setLoadingStatusId(null)
    }
  }, [updateProgressStatus, refetch])

  const handleRemarksChange = useCallback(async (item, newRemarks) => {
    setEditingRemarks(prev => ({ ...prev, [item.id]: newRemarks }))
  }, [])

  const handleRemarksEditClick = useCallback((item) => {
    setEditingRemarksMode(prev => ({ ...prev, [item.id]: true }))
    setEditingRemarks(prev => ({ ...prev, [item.id]: item.remarks || '' }))
  }, [])

  const handleRemarksSubmit = useCallback(async (item) => {
    const newRemarks = editingRemarks[item.id] !== undefined ? editingRemarks[item.id] : item.remarks
    if (newRemarks === item.remarks) {
      setEditingRemarksMode(prev => { const s = { ...prev }; delete s[item.id]; return s })
      setEditingRemarks(prev => { const s = { ...prev }; delete s[item.id]; return s })
      return
    }
    setLoadingStatusId(item.id)
    try {
      await updateProgress({ progressId: item.id, remarks: newRemarks, status: item.status }).unwrap()
      await refetch()
      setEditingRemarksMode(prev => { const s = { ...prev }; delete s[item.id]; return s })
      setEditingRemarks(prev => { const s = { ...prev }; delete s[item.id]; return s })
      setSnackbar({ open: true, message: 'Remarks updated successfully!', severity: 'success' })
    } catch (err) {
      let errorMessage = 'Failed to update remarks'
      if (err?.data?.errors?.length > 0) errorMessage = err.data.errors[0]?.detail || err.data.errors[0]?.message || errorMessage
      else if (err?.data?.detail) errorMessage = err.data.detail
      else if (err?.data?.message) errorMessage = err.data.message
      setSnackbar({ open: true, message: errorMessage, severity: 'error' })
      setEditingRemarksMode(prev => { const s = { ...prev }; delete s[item.id]; return s })
      setEditingRemarks(prev => { const s = { ...prev }; delete s[item.id]; return s })
    } finally {
      setLoadingStatusId(null)
    }
  }, [editingRemarks, updateProgress, refetch])

  const handleRemarksDialogOpen = useCallback((item) => { setSelectedRemarksItem(item) }, [])
  const handleRemarksDialogClose = useCallback(() => { setSelectedRemarksItem(null) }, [])

  const handleActionMenuOpen = useCallback((event, item) => {
    event.stopPropagation()
    setDateEditDialog({ open: false, item: null, raised_date: null, target_date: null, end_date: null })
    setAnchorEl(event.currentTarget)
    setSelectedItem(item)
  }, [])

  const handleActionMenuClose = useCallback(() => {
    setAnchorEl(null)
    setSelectedItem(null)
    handleCloseDateEditDialog()
  }, [])

  const handleEditAction = useCallback(() => {
    setDateEditDialog({ open: false, item: null, raised_date: null, target_date: null, end_date: null })
    setAnchorEl(null)
    if (selectedItem) setEditDialog({ open: true, item: selectedItem, remarks: selectedItem.remarks || '' })
  }, [selectedItem])

  const handleMarkAsDone = useCallback(async () => {
    setDateEditDialog({ open: false, item: null, raised_date: null, target_date: null, end_date: null })
    setAnchorEl(null)
    if (selectedItem) setMarkAsDoneDialog({ open: true, item: selectedItem, action: 'hold' })
  }, [selectedItem])

  const handleMarkAsPending = useCallback(async () => {
    setDateEditDialog({ open: false, item: null, raised_date: null, target_date: null, end_date: null })
    setAnchorEl(null)
    if (selectedItem) setMarkAsDoneDialog({ open: true, item: selectedItem, action: 'pending' })
  }, [selectedItem])

  const handleCloseEditDialog = useCallback(() => { setEditDialog({ open: false, item: null, remarks: '' }) }, [])

  const handleSaveEditDialog = useCallback(async () => {
    if (!editDialog.item) return
    if (editDialog.remarks === editDialog.item.remarks) { handleCloseEditDialog(); return }
    setLoadingStatusId(editDialog.item.id)
    try {
      await updateProgress({ progressId: editDialog.item.id, remarks: editDialog.remarks, status: editDialog.item.status }).unwrap()
      await refetch()
      setSnackbar({ open: true, message: 'Remarks updated successfully!', severity: 'success' })
      handleCloseEditDialog()
    } catch (err) {
      let errorMessage = 'Failed to update remarks'
      if (err?.data?.errors?.length > 0) errorMessage = err.data.errors[0]?.detail || err.data.errors[0]?.message || errorMessage
      else if (err?.data?.detail) errorMessage = err.data.detail
      else if (err?.data?.message) errorMessage = err.data.message
      setSnackbar({ open: true, message: errorMessage, severity: 'error' })
    } finally {
      setLoadingStatusId(null)
    }
  }, [editDialog, updateProgress, refetch])

  const handleConfirmMarkAsDone = useCallback(async () => {
    if (markAsDoneDialog.item && markAsDoneDialog.action) {
      const newStatus = markAsDoneDialog.action
      const statusLabel = newStatus === 'hold' ? 'On Hold' : 'Pending'
      setLoadingStatusId(markAsDoneDialog.item.id)
      try {
        await updateProgress({ progressId: markAsDoneDialog.item.id, status: newStatus }).unwrap()
        await refetch()
        setSnackbar({ open: true, message: `Marked as ${statusLabel} successfully!`, severity: 'success' })
      } catch (err) {
        let errorMessage = `Failed to mark as ${statusLabel.toLowerCase()}`
        if (err?.data?.errors?.length > 0) errorMessage = err.data.errors[0]?.detail || err.data.errors[0]?.message || errorMessage
        else if (err?.data?.detail) errorMessage = err.data.detail
        else if (err?.data?.message) errorMessage = err.data.message
        setSnackbar({ open: true, message: errorMessage, severity: 'error' })
      } finally {
        setLoadingStatusId(null)
        setMarkAsDoneDialog({ open: false, item: null, action: null })
      }
    }
  }, [markAsDoneDialog, updateProgress, refetch])

  const handleClosMarkAsDoneDialog = useCallback(() => { setMarkAsDoneDialog({ open: false, item: null, action: null }) }, [])

  const handleOpenDateEditDialog = useCallback((item) => {
    setDateEditDialog({
      open: true, item,
      raised_date: item.raised_date ? dayjs(item.raised_date) : null,
      target_date: (item.target_date || item.start_date) ? dayjs(item.target_date || item.start_date) : null,
      end_date: item.end_date ? dayjs(item.end_date) : null
    })
  }, [])

  const handleCloseDateEditDialog = useCallback(() => {
    setDateEditDialog({ open: false, item: null, raised_date: null, target_date: null, end_date: null })
  }, [])

  const handleOpenCreateDialog = useCallback(() => {
    setCreateDialog({ open: true, selectedCategory: '', description: '', raisedDate: null, targetDate: null, remarks: '' })
  }, [])

  const handleCloseCreateDialog = useCallback(() => {
    setCreateDialog({ open: false, selectedCategory: '', description: '', raisedDate: null, targetDate: null, remarks: '' })
  }, [])

  const handleCreateSubmit = useCallback(async () => {
    if (!createDialog.selectedCategory || !createDialog.description || !createDialog.raisedDate) {
      setSnackbar({ open: true, message: 'Please fill in all required fields (Category, Description, Raised Date)', severity: 'error' })
      return
    }
    setCreateLoading(true)
    setLoadingStatusId('creating')
    try {
      if (!currentSystem) {
        setSnackbar({ open: true, message: 'System not found.', severity: 'error' })
        setCreateLoading(false); setLoadingStatusId(null); return
      }
      const systemId = currentSystem.id || currentSystem.system_id
      if (!systemId) {
        setSnackbar({ open: true, message: 'System ID not found.', severity: 'error' })
        setCreateLoading(false); setLoadingStatusId(null); return
      }
      const selectedCategoryObj = allCategories.find(cat => cat.id === createDialog.selectedCategory)
      if (!selectedCategoryObj) {
        setSnackbar({ open: true, message: 'Selected category not found', severity: 'error' })
        setCreateLoading(false); setLoadingStatusId(null); return
      }
      const payload = {
        system_id: systemId,
        categories: [{
          categoryName: selectedCategoryObj.categoryName || selectedCategoryObj.name,
          progress: [{
            description: createDialog.description,
            raised_date: createDialog.raisedDate.format('YYYY-MM-DD'),
            target_date: createDialog.targetDate ? createDialog.targetDate.format('YYYY-MM-DD') : null,
            end_date: null,
            status: 'pending',
            remarks: createDialog.remarks || ''
          }]
        }]
      }
      setNewCategoryName(selectedCategoryObj.categoryName || selectedCategoryObj.name)
      await createProgress(payload).unwrap()
      await refetch()
      setSnackbar({ open: true, message: 'Progress item created successfully!', severity: 'success' })
      setTimeout(() => { handleCloseCreateDialog(); setNewCategoryName(null) }, 800)
    } catch (err) {
      let errorMessage = 'Failed to create progress item'
      if (err?.data?.errors?.length > 0) errorMessage = err.data.errors[0]?.detail || err.data.errors[0]?.message || errorMessage
      else if (err?.data?.detail) errorMessage = err.data.detail
      else if (err?.data?.message) errorMessage = err.data.message
      setSnackbar({ open: true, message: errorMessage, severity: 'error' })
      setNewCategoryName(null)
    } finally {
      setCreateLoading(false); setLoadingStatusId(null)
    }
  }, [createDialog, currentSystem, allCategories, createProgress, refetch])

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, hold: 0, done: 0 }
    if (currentSystem?.categories && Array.isArray(currentSystem.categories)) {
      currentSystem.categories.forEach(category => {
        if (category.progress && Array.isArray(category.progress)) {
          category.progress.forEach(item => {
            const status = item.status?.toLowerCase()
            if (status in counts) counts[status]++
          })
        }
      })
    }
    return counts
  }, [currentSystem])

  const handleConfirmDateEdit = useCallback(async () => {
    if (dateEditDialog.item && dateEditDialog.end_date) {
      if (dateEditDialog.raised_date && dateEditDialog.end_date.startOf('day').isBefore(dateEditDialog.raised_date.startOf('day'))) {
        setSnackbar({ open: true, message: 'End date cannot be before raised date.', severity: 'error' })
        return
      }
      const updatePayload = { progressId: dateEditDialog.item.id, status: 'done', end_date: dateEditDialog.end_date.format('YYYY-MM-DD') }
      setLoadingStatusId(dateEditDialog.item.id)
      try {
        await updateProgress(updatePayload).unwrap()
        await refetch()
        setSnackbar({ open: true, message: 'Marked as done successfully!', severity: 'success' })
        handleCloseDateEditDialog()
      } catch (err) {
        let errorMessage = 'Failed to mark as done'
        if (err?.data?.errors?.length > 0) errorMessage = err.data.errors[0]?.detail || err.data.errors[0]?.message || errorMessage
        else if (err?.data?.detail) errorMessage = err.data.detail
        else if (err?.data?.message) errorMessage = err.data.message
        setSnackbar({ open: true, message: errorMessage, severity: 'error' })
      } finally {
        setLoadingStatusId(null)
      }
    }
  }, [dateEditDialog, updateProgress, refetch])

  const oswaldInputSx = {
    '& input, & textarea, & .MuiSelect-select': { fontFamily: OSWALD },
    '& .MuiInputLabel-root': { fontFamily: OSWALD },
    '& .MuiFormLabel-root': { fontFamily: OSWALD },
  }

  if (isLoading) return <Box className="systemCategoryLoadingContainer"><CircularProgress /></Box>

  if (error) {
    return (
      <Box className="systemCategoryErrorContainer">
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500, fontFamily: OSWALD }}>{user?.team?.name || 'Your Team'}</Typography>
        <Typography variant="body2" sx={{ fontFamily: OSWALD }}>Currently no system</Typography>
      </Box>
    )
  }

  if (!currentSystem) {
    return (
      <Box className="systemCategoryErrorContainer">
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500, fontFamily: OSWALD }}>{systemName}</Typography>
        <Typography variant="body2" sx={{ fontFamily: OSWALD }}>Currently no system</Typography>
      </Box>
    )
  }

  const isDoneTab = selectedStatusFilter === 'done'
  const centeredColumns = ['Status']

  return (
    <Box className="systemCategoryContainer">
      {/* Header */}
      <Box className="systemCategoryHeader" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" className="systemCategoryTitle">{currentSystem.systemName}</Typography>
          </Box>
          <Typography variant="body2" className="systemCategoryTeam">
            Teams: {Array.isArray(currentSystem.team)
              ? currentSystem.team.map(t => t.name).join(', ')
              : currentSystem.team?.name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Back to System page" arrow>
            <IconButton onClick={() => navigate('/systems')} sx={{ color: '#03346E' }}>
              <SettingsSystemDaydreamIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className="systemCategoryAddButton"
            onClick={handleOpenCreateDialog}
            sx={{ bgcolor: '#03346E', fontFamily: OSWALD }}
          >
            Create
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box className="systemCategoryContent">
        {/* Status Filter Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={selectedStatusFilter}
            onChange={(e, newValue) => {
              setSelectedStatusFilter(newValue)
              setSelectedItems({})
            }}
            sx={{
              '& .MuiTab-root': { fontFamily: OSWALD, textTransform: 'capitalize', fontWeight: 600 },
              '& .Mui-selected': { color: '#03346E' },
              '& .MuiTabs-indicator': { backgroundColor: '#03346E' },
            }}
          >
            <Tab label={`Pending (${statusCounts.pending})`} value="pending" />
            <Tab label={`On Hold (${statusCounts.hold})`} value="hold" />
            <Tab label={`Done (${statusCounts.done})`} value="done" />
          </Tabs>
        </Box>

        {currentSystem.categories && currentSystem.categories.length > 0 ? (
          currentSystem.categories.map((category, idx) => {
            const filteredProgress = category.progress.filter(item => item.status?.toLowerCase() === selectedStatusFilter)
            const isNewCategory = newCategoryName === category.categoryName
            const isExpanded = !!expandedCategories[idx]
            const visibleItems = isExpanded ? filteredProgress : filteredProgress.slice(0, PAGE_SIZE)
            const hasMore = filteredProgress.length > PAGE_SIZE
            const selected = getSelected(idx)
            const selectedCount = selected.size
            const allVisibleSelected = visibleItems.length > 0 && visibleItems.every(i => selected.has(i.id))
            const someSelected = selectedCount > 0 && !allVisibleSelected

            return (
              <Accordion
                key={idx}
                defaultExpanded={true}
                className="systemCategoryAccordion"
                sx={isNewCategory ? { backgroundColor: 'rgba(3, 52, 110, 0.05)', border: '2px solid #03346E' } : {}}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon className="systemCategoryExpandIcon" />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                    <Typography variant="h6" sx={{ fontFamily: OSWALD, flex: 1 }}>
                      {category.categoryName}
                    </Typography>

                    {/* Selection toolbar — only show on non-done tabs when items exist */}
                    {!isDoneTab && filteredProgress.length > 0 && selectedCount > 0 && (
                      <Box
                        onClick={e => e.stopPropagation()}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Chip
                          label={`${selectedCount} selected`}
                          size="small"
                          sx={{ fontFamily: OSWALD, backgroundColor: '#03346E', color: '#fff', fontWeight: 600 }}
                        />
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<DoneAllIcon />}
                          onClick={() => handleOpenBulkDone(idx)}
                          sx={{ backgroundColor: '#4caf50', fontFamily: OSWALD, fontSize: '0.75rem', py: 0.4 }}
                        >
                          Mark as Done
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => clearSelection(idx)}
                          sx={{ fontFamily: OSWALD, fontSize: '0.75rem', color: '#888' }}
                        >
                          Clear
                        </Button>
                      </Box>
                    )}
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  {filteredProgress.length > 0 ? (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TableContainer component={Paper} className="systemCategoryTableContainer">
                        <Table size="small" className="systemCategoryTable">
                          <TableHead>
                            <TableRow className="systemCategoryTableHead">
                              {/* Checkbox column — only on non-done tabs */}
                              {!isDoneTab && (
                                <TableCell padding="checkbox" sx={{ backgroundColor: 'inherit' }}>
                                  <Checkbox
                                    size="small"
                                    indeterminate={someSelected}
                                    checked={allVisibleSelected}
                                    onChange={() => toggleSelectAll(idx, visibleItems)}
                                    sx={{ color: '#fff', '&.Mui-checked': { color: '#fff' }, '&.MuiCheckbox-indeterminate': { color: '#fff' } }}
                                  />
                                </TableCell>
                              )}
                              {(isDoneTab
                                ? ['ID', 'Description', 'Remarks', 'Raised Date', 'Target Date', 'End Date', 'Updated By', 'Status']
                                : ['ID', 'Description', 'Remarks', 'Raised Date', 'Target Date', 'End Date', 'Updated By', 'Status', 'Action']
                              ).map(h => (
                                <TableCell
                                  key={h}
                                  align={centeredColumns.includes(h) ? 'center' : 'left'}
                                  sx={{ fontWeight: 'bold', fontFamily: OSWALD }}
                                >
                                  {h}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {visibleItems.map((item) => {
                              const isChecked = selected.has(item.id)
                              return (
                                <TableRow
                                  key={item.id}
                                  className="systemCategoryTableRow"
                                  onClick={() => item.status?.toLowerCase() !== 'done' && !anchorEl && handleOpenDateEditDialog(item)}
                                  sx={{
                                    cursor: item.status?.toLowerCase() === 'done' ? 'default' : 'pointer',
                                    backgroundColor: isChecked ? 'rgba(3, 52, 110, 0.06)' : 'inherit',
                                    '&:hover': { backgroundColor: item.status?.toLowerCase() === 'done' ? 'transparent' : 'rgba(3, 52, 110, 0.08)' }
                                  }}
                                >
                                  {/* Checkbox cell */}
                                  {!isDoneTab && (
                                    <TableCell padding="checkbox" onClick={e => e.stopPropagation()}>
                                      <Checkbox
                                        size="small"
                                        checked={isChecked}
                                        onChange={() => toggleSelectItem(idx, item.id)}
                                        sx={{ color: '#03346E', '&.Mui-checked': { color: '#03346E' } }}
                                      />
                                    </TableCell>
                                  )}

                                  <TableCell sx={{ fontFamily: OSWALD }}>{item.id}</TableCell>
                                  <TableCell sx={{ fontFamily: OSWALD }}>{item.description}</TableCell>

                                  {/* Remarks */}
                                  <TableCell className="systemCategoryRemarks">
                                    {editingRemarksMode[item.id] ? (
                                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                        <TextField
                                          value={editingRemarks[item.id] !== undefined ? editingRemarks[item.id] : (item.remarks || '')}
                                          onChange={(e) => handleRemarksChange(item, e.target.value)}
                                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleRemarksSubmit(item) } }}
                                          size="small"
                                          fullWidth
                                          multiline
                                          maxRows={3}
                                          disabled={loadingStatusId === item.id}
                                          autoFocus
                                          sx={{
                                            ...oswaldInputSx,
                                            '& .MuiOutlinedInput-root': {
                                              backgroundColor: '#fff',
                                              '&:hover fieldset': { borderColor: '#2c3e50' },
                                              '&.Mui-focused fieldset': { borderColor: '#03346E' },
                                            }
                                          }}
                                        />
                                        <IconButton
                                          size="small"
                                          onClick={() => handleRemarksSubmit(item)}
                                          disabled={loadingStatusId === item.id}
                                          sx={{ color: '#4caf50', mt: 0.5 }}
                                        >
                                          <CheckIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        onClick={(e) => { e.stopPropagation(); handleRemarksDialogOpen(item) }}
                                        sx={{
                                          fontFamily: OSWALD,
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          wordBreak: 'break-word',
                                          maxWidth: '100%',
                                          cursor: 'pointer',
                                          '&:hover': { textDecoration: 'underline', color: '#03346E' }
                                        }}
                                      >
                                        {item.remarks || '-'}
                                      </Typography>
                                    )}
                                  </TableCell>

                                  <TableCell sx={{ fontFamily: OSWALD }}>{item.raised_date}</TableCell>
                                  <TableCell sx={{ fontFamily: OSWALD }}>{item.target_date || item.start_date || '-'}</TableCell>
                                  <TableCell sx={{ fontFamily: OSWALD }}>{item.end_date || '-'}</TableCell>
                                  <TableCell sx={{ fontFamily: OSWALD, color: '#555' }}>{getUpdatedBy(item)}</TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      label={getStatusLabel(item.status)}
                                      size="small"
                                      sx={{
                                        backgroundColor: getStatusColor(item.status),
                                        color: '#fff',
                                        fontWeight: 500,
                                        fontFamily: OSWALD,
                                        minWidth: '80px',
                                        justifyContent: 'center'
                                      }}
                                    />
                                  </TableCell>

                                  {!isDoneTab && (
                                    <TableCell>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => { e.stopPropagation(); handleActionMenuOpen(e, item) }}
                                        sx={{ color: '#03346E' }}
                                      >
                                        <MoreVertIcon fontSize="small" />
                                      </IconButton>
                                      <Menu
                                        anchorEl={anchorEl}
                                        open={!!anchorEl && selectedItem?.id === item.id}
                                        onClose={handleActionMenuClose}
                                        MenuListProps={{ sx: { fontFamily: OSWALD } }}
                                      >
                                        <MenuItem onClick={(e) => { e.stopPropagation(); handleEditAction() }} sx={{ fontFamily: OSWALD }}>Edit</MenuItem>
                                        {item.status?.toLowerCase() !== 'hold' && (
                                          <MenuItem onClick={(e) => { e.stopPropagation(); handleMarkAsDone() }} sx={{ fontFamily: OSWALD }}>Mark as On Hold</MenuItem>
                                        )}
                                        {item.status?.toLowerCase() === 'hold' && (
                                          <MenuItem onClick={(e) => { e.stopPropagation(); handleMarkAsPending() }} sx={{ fontFamily: OSWALD }}>Mark as Pending</MenuItem>
                                        )}
                                      </Menu>
                                    </TableCell>
                                  )}
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Show more / Show less */}
                      {hasMore && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
                          <Button
                            size="small"
                            variant="text"
                            endIcon={isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            onClick={() => setExpandedCategories(prev => ({ ...prev, [idx]: !prev[idx] }))}
                            sx={{ fontFamily: OSWALD, color: '#03346E', fontWeight: 600, fontSize: '0.8rem' }}
                          >
                            {isExpanded
                              ? 'Show less'
                              : `Show all ${filteredProgress.length} items`}
                          </Button>
                        </Box>
                      )}
                    </LocalizationProvider>
                  ) : (
                    <Box className="systemCategoryEmptyItems">
                      <Typography sx={{ fontFamily: OSWALD }}>No items in this category</Typography>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            )
          })
        ) : (
          <Typography sx={{ fontFamily: OSWALD }}>No categories found for this system</Typography>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          className="systemCategorySnackbar"
          sx={{
            backgroundColor: snackbar.severity === 'success' ? '#4caf50' : '#f44336',
            fontFamily: OSWALD,
            '& .MuiAlert-message': { fontFamily: OSWALD },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Remarks Detail Dialog */}
      <Dialog open={!!selectedRemarksItem} onClose={handleRemarksDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#03346E', fontFamily: OSWALD }}>Remarks Details</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ fontFamily: OSWALD, whiteSpace: 'pre-wrap', wordBreak: 'break-word', backgroundColor: '#f5f5f5', p: 2, borderRadius: '4px' }}>
              {selectedRemarksItem?.remarks || 'No remarks'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRemarksDialogClose} color="primary" sx={{ fontFamily: OSWALD }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Date Edit Dialog (single item mark as done) */}
      <Dialog open={dateEditDialog.open} onClose={handleCloseDateEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#03346E', fontFamily: OSWALD }}>Mark As Done?</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', fontFamily: OSWALD }}>
              Fill the end date in order to mark as done
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, fontFamily: OSWALD }}>End Date</Typography>
                <DatePicker
                  value={dateEditDialog.end_date}
                  onChange={(newDate) => setDateEditDialog(prev => ({ ...prev, end_date: newDate }))}
                  slotProps={{ textField: { size: "small", fullWidth: true, sx: oswaldInputSx } }}
                  minDate={dateEditDialog.raised_date}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDateEditDialog} disabled={loadingStatusId === dateEditDialog.item?.id} sx={{ fontFamily: OSWALD }}>Cancel</Button>
          <Button
            onClick={handleConfirmDateEdit}
            variant="contained"
            sx={{ backgroundColor: '#03346E', fontFamily: OSWALD }}
            disabled={!dateEditDialog.end_date || loadingStatusId === dateEditDialog.item?.id}
          >
            {loadingStatusId === dateEditDialog.item?.id ? 'Marking as done...' : 'Mark as Done'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Mark As Done Dialog */}
      <Dialog open={bulkDoneDialog.open} onClose={handleCloseBulkDone} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#03346E', fontFamily: OSWALD }}>
          Mark {bulkDoneDialog.categoryIdx !== null ? getSelected(bulkDoneDialog.categoryIdx).size : 0} Item(s) as Done
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', fontFamily: OSWALD }}>
              Please provide an end date to mark the selected items as done.
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, fontFamily: OSWALD }}>End Date *</Typography>
                <DatePicker
                  value={bulkDoneDialog.end_date}
                  onChange={(newDate) => setBulkDoneDialog(prev => ({ ...prev, end_date: newDate }))}
                  slotProps={{ textField: { size: "small", fullWidth: true, sx: oswaldInputSx } }}
                  disabled={bulkLoading}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkDone} disabled={bulkLoading} sx={{ fontFamily: OSWALD }}>Cancel</Button>
          <Button
            onClick={handleConfirmBulkDone}
            variant="contained"
            sx={{ backgroundColor: '#4caf50', fontFamily: OSWALD }}
            disabled={!bulkDoneDialog.end_date || bulkLoading}
          >
            {bulkLoading ? <><CircularProgress size={16} sx={{ mr: 1, color: '#fff' }} />Marking...</> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark as On Hold/Pending Confirmation Dialog */}
      <Confirmation
        open={markAsDoneDialog.open}
        onClose={handleClosMarkAsDoneDialog}
        onConfirm={handleConfirmMarkAsDone}
        title={markAsDoneDialog.action === 'hold' ? "Mark as On Hold?" : "Mark as Pending?"}
        message={markAsDoneDialog.action === 'hold' ? "The status will be changed to On Hold." : "The status will be changed to Pending."}
        isLoading={loadingStatusId === markAsDoneDialog.item?.id}
      />

      {/* Edit Progress Item Dialog */}
      <Dialog open={editDialog.open} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#03346E', fontFamily: OSWALD }}>Edit Progress Item</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, fontFamily: OSWALD }}>Description</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, p: 1, backgroundColor: '#f5f5f5', borderRadius: '4px', fontFamily: OSWALD }}>
                {editDialog.item?.description}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, fontFamily: OSWALD }}>Status</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, p: 1, backgroundColor: '#f5f5f5', borderRadius: '4px', fontFamily: OSWALD }}>
                {editDialog.item ? getStatusLabel(editDialog.item.status) : '-'}
              </Typography>
            </Box>
            <TextField
              label="Remarks"
              value={editDialog.remarks}
              onChange={(e) => setEditDialog(prev => ({ ...prev, remarks: e.target.value }))}
              fullWidth
              size="small"
              multiline
              rows={4}
              disabled={loadingStatusId === editDialog.item?.id}
              sx={oswaldInputSx}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={loadingStatusId === editDialog.item?.id} sx={{ fontFamily: OSWALD }}>Cancel</Button>
          <Button
            onClick={handleSaveEditDialog}
            variant="contained"
            sx={{ backgroundColor: '#03346E', fontFamily: OSWALD }}
            disabled={loadingStatusId === editDialog.item?.id}
          >
            {loadingStatusId === editDialog.item?.id ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Progress Item Dialog */}
      <Dialog open={createDialog.open} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#03346E', fontFamily: OSWALD }}>Create New Progress Item</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth size="small" sx={oswaldInputSx}>
              <InputLabel sx={{ fontFamily: OSWALD }}>Category *</InputLabel>
              <Select
                value={createDialog.selectedCategory}
                label="Category *"
                onChange={(e) => setCreateDialog(prev => ({ ...prev, selectedCategory: e.target.value }))}
                disabled={createLoading}
                sx={{ fontFamily: OSWALD }}
              >
                {allCategories && allCategories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id} sx={{ fontFamily: OSWALD, fontWeight: 300 }}>
                    {cat.categoryName || cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description *"
              value={createDialog.description}
              onChange={(e) => setCreateDialog(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              size="small"
              multiline
              rows={3}
              disabled={createLoading}
              sx={oswaldInputSx}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, fontFamily: OSWALD }}>Raised Date *</Typography>
                <DatePicker
                  value={createDialog.raisedDate}
                  onChange={(newDate) => setCreateDialog(prev => ({ ...prev, raisedDate: newDate }))}
                  slotProps={{ textField: { size: "small", fullWidth: true, sx: oswaldInputSx } }}
                  disabled={createLoading}
                  disablePast
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, fontFamily: OSWALD }}>Target Date</Typography>
                <DatePicker
                  value={createDialog.targetDate}
                  onChange={(newDate) => setCreateDialog(prev => ({ ...prev, targetDate: newDate }))}
                  slotProps={{ textField: { size: "small", fullWidth: true, sx: oswaldInputSx } }}
                  disabled={createLoading}
                  minDate={createDialog.raisedDate}
                />
              </Box>
            </LocalizationProvider>

            <Box>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, fontFamily: OSWALD }}>Status</Typography>
              <TextField value="Pending" fullWidth size="small" disabled variant="outlined" sx={oswaldInputSx} />
            </Box>

            <TextField
              label="Remarks"
              value={createDialog.remarks}
              onChange={(e) => setCreateDialog(prev => ({ ...prev, remarks: e.target.value }))}
              fullWidth
              size="small"
              multiline
              rows={2}
              disabled={createLoading}
              sx={oswaldInputSx}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} disabled={createLoading} sx={{ fontFamily: OSWALD }}>Cancel</Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            sx={{ backgroundColor: '#03346E', fontFamily: OSWALD }}
            disabled={createLoading || !createDialog.selectedCategory || !createDialog.description || !createDialog.raisedDate}
          >
            {createLoading ? <><CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />Creating...</> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SystemCategory