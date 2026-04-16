import { Box, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Select, MenuItem, Snackbar, Alert, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Menu, Tabs, Tab, FormControl, InputLabel, Tooltip, Checkbox } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import CloseIcon from '@mui/icons-material/Close'
import React, { useMemo, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../features/api/slice/authSlice'
import { useGetSystemsListQuery } from '../../features/api/system/systemApi'
import { useUpdateProgressMutation, useCreateProgressMutation } from '../../features/api/progress/progressApi'
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

const EMPTY_ENTRY = () => ({ description: '' })

const SystemCategory = () => {
  const navigate = useNavigate()
  const { systemName } = useParams()
  const user = useSelector(selectCurrentUser)

  // ── Permission check ───────────────────────────────────────────────────────
  const isAdminRole = user?.role?.name?.toLowerCase() === 'admin'
  const hasSystemCategoryAccess =
    isAdminRole ||
    user?.role?.access_permissions?.includes('SystemCategory.Access') ||
    user?.access_permissions?.includes('SystemCategory.Access')

  const buildQueryParams = () => {
    const isUserRole = user?.role?.name?.toLowerCase() === 'user'
    if (isUserRole && user?.team?.id) {
      return { status: 'active', scope: 'per_team', team_id: user.team.id }
    } else {
      return { status: 'active', scope: 'global' }
    }
  }

  const queryParams = buildQueryParams()
  const { data: systemsData, isLoading, error, refetch } = useGetSystemsListQuery(queryParams)
  const [updateProgress] = useUpdateProgressMutation()
  const [createProgress] = useCreateProgressMutation()
  const { data: categoriesData } = useGetCategoriesListQuery({ status: 'active', pagination: 'none' })

  const [editingStatus, setEditingStatus] = useState({})
  const [editingDates, setEditingDates] = useState({})
  const [editingRemarks, setEditingRemarks] = useState({})
  const [editingRemarksMode, setEditingRemarksMode] = useState({})
  const [selectedRemarksItem, setSelectedRemarksItem] = useState(null)
  const [selectedDescriptionItem, setSelectedDescriptionItem] = useState(null)
  const [loadingStatusId, setLoadingStatusId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [markAsDoneDialog, setMarkAsDoneDialog] = useState({ open: false, item: null, action: null })
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('pending')
  const [dateEditDialog, setDateEditDialog] = useState({ open: false, item: null, raised_date: null, target_date: null, end_date: null })

  // ── Create dialog — shared fields + multiple descriptions ─────────────────
  const [createDialog, setCreateDialog] = useState({
    open: false,
    selectedCategory: '',
    raisedDate: null,
    targetDate: null,
    remarks: '',
    entries: [EMPTY_ENTRY()]
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState(null)
  const [editDialog, setEditDialog] = useState({ open: false, item: null, remarks: '' })
  const [createError, setCreateError] = useState(false)

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

  const STATUS_OPTIONS = useMemo(() => [
    { value: 'pending', label: 'Pending' },
    { value: 'hold', label: 'On Hold' },
    { value: 'done', label: 'Done' },
  ], [])

  const getStatusLabel = useCallback((status) => {
    const statusMap = { 'pending': 'Pending', 'hold': 'On Hold', 'done': 'Done', 'inprogress': 'In Progress' }
    return statusMap[status?.toLowerCase()] || status || '-'
  }, [])

  // ── Shared helper: resolve any user object → display name ─────────────────
  const resolveUserName = useCallback((userObj) => {
    if (!userObj) return '-'
    const first = userObj.first_name || ''
    const last = userObj.last_name || ''
    const fullName = `${first} ${last}`.trim()
    if (fullName) return fullName
    if (userObj.username) return userObj.username
    if (userObj.name) return userObj.name
    return typeof userObj === 'string' ? userObj : '-'
  }, [])

  // ── Created By — who originally created the progress item ─────────────────
  const getCreatedBy = useCallback((item) => resolveUserName(item?.created_by), [resolveUserName])

  // ── Updated By — who last updated the progress item ───────────────────────
  const getUpdatedBy = useCallback((item) => resolveUserName(item?.updated_by), [resolveUserName])

  // ── Status counts ──────────────────────────────────────────────────────────
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

  // ── Pending categories count ───────────────────────────────────────────────
  const pendingCategoriesCount = useMemo(() => {
    if (!currentSystem?.categories) return 0
    return currentSystem.categories.filter(cat =>
      cat.progress?.some(p => p.status?.toLowerCase() === 'pending')
    ).length
  }, [currentSystem])

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
    const ids = Array.from(getSelected(categoryIdx)).map(Number)
    if (!ids.length) return
    setBulkLoading(true)
    try {
      await updateProgress({ ids, status: 'done', end_date: end_date.format('YYYY-MM-DD') }).unwrap()
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
      await updateProgress({ ids: [Number(itemId)], status: newStatus }).unwrap()
      await refetch()
      setEditingStatus(prev => { const s = { ...prev }; delete s[itemId]; return s })
      setSnackbar({ open: true, message: 'Status updated successfully!', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: err?.data?.message || 'Failed to update status', severity: 'error' })
      setEditingStatus(prev => { const s = { ...prev }; delete s[itemId]; return s })
    } finally {
      setLoadingStatusId(null)
    }
  }, [updateProgress, refetch])

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
      await updateProgress({ ids: [Number(item.id)], remarks: newRemarks, status: item.status }).unwrap()
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

  const handleDescriptionDialogOpen = useCallback((item) => { setSelectedDescriptionItem(item) }, [])
  const handleDescriptionDialogClose = useCallback(() => { setSelectedDescriptionItem(null) }, [])

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
      await updateProgress({ ids: [Number(editDialog.item.id)], remarks: editDialog.remarks, status: editDialog.item.status }).unwrap()
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
        await updateProgress({ ids: [Number(markAsDoneDialog.item.id)], status: newStatus }).unwrap()
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
    // Guard: only users with access can open this dialog
    if (!hasSystemCategoryAccess) return
    setDateEditDialog({
      open: true, item,
      raised_date: item.raised_date ? dayjs(item.raised_date) : null,
      target_date: (item.target_date || item.start_date) ? dayjs(item.target_date || item.start_date) : null,
      end_date: item.end_date ? dayjs(item.end_date) : null
    })
  }, [hasSystemCategoryAccess])

  const handleCloseDateEditDialog = useCallback(() => {
    setDateEditDialog({ open: false, item: null, raised_date: null, target_date: null, end_date: null })
  }, [])

  // ── Create dialog handlers ─────────────────────────────────────────────────

  const handleOpenCreateDialog = useCallback(() => {
    setCreateDialog({ open: true, selectedCategory: '', raisedDate: null, targetDate: null, remarks: '', entries: [EMPTY_ENTRY()] })
  }, [])

  const handleCloseCreateDialog = useCallback(() => {
    setCreateDialog({ open: false, selectedCategory: '', raisedDate: null, targetDate: null, remarks: '', entries: [EMPTY_ENTRY()] })
  }, [])

  const handleAddEntry = useCallback(() => {
    setCreateDialog(prev => ({ ...prev, entries: [...prev.entries, EMPTY_ENTRY()] }))
  }, [])

  const handleRemoveEntry = useCallback((index) => {
    setCreateDialog(prev => ({
      ...prev,
      entries: prev.entries.filter((_, i) => i !== index)
    }))
  }, [])

  const handleEntryDescriptionChange = useCallback((index, value) => {
    setCreateDialog(prev => {
      const entries = [...prev.entries]
      entries[index] = { description: value }
      return { ...prev, entries }
    })
  }, [])

  const handleCreateSubmit = useCallback(async () => {
    const hasInvalid = createDialog.entries.some(e => !e.description)
    if (!createDialog.selectedCategory || !createDialog.raisedDate || hasInvalid) {
      setSnackbar({ open: true, message: 'Please fill in Category, Raised Date, and all Description fields', severity: 'error' })
      return
    }
    setCreateLoading(true)
    setLoadingStatusId('creating')
    setCreateError(false)
    try {
      if (!currentSystem) throw new Error('System not found.')
      const systemId = currentSystem.id || currentSystem.system_id
      if (!systemId) throw new Error('System ID not found.')
      const selectedCategoryObj = allCategories.find(cat => cat.id === createDialog.selectedCategory)
      if (!selectedCategoryObj) throw new Error('Selected category not found')

      const payload = {
        system_id: systemId,
        categories: [{
          categoryName: selectedCategoryObj.categoryName || selectedCategoryObj.name,
          progress: createDialog.entries.map(e => ({
            description: e.description,
            raised_date: createDialog.raisedDate.format('YYYY-MM-DD'),
            target_date: createDialog.targetDate ? createDialog.targetDate.format('YYYY-MM-DD') : null,
            end_date: null,
            status: 'pending',
            remarks: createDialog.remarks || ''
          }))
        }]
      }
      setNewCategoryName(selectedCategoryObj.categoryName || selectedCategoryObj.name)
      await createProgress(payload).unwrap()
      await refetch()
      handleCloseCreateDialog()
      setSnackbar({ open: true, message: `${createDialog.entries.length} item(s) created successfully!`, severity: 'success' })
      setNewCategoryName(null)
    } catch (err) {
      let errorMessage = err?.message || 'Failed to create progress item'
      if (err?.data?.errors?.length > 0) errorMessage = err.data.errors[0]?.detail || err.data.errors[0]?.message || errorMessage
      else if (err?.data?.detail) errorMessage = err.data.detail
      else if (err?.data?.message) errorMessage = err.data.message
      setSnackbar({ open: true, message: errorMessage, severity: 'error' })
      setNewCategoryName(null)
      setCreateError(true)
    } finally {
      setCreateLoading(false)
      setLoadingStatusId(null)
    }
  }, [createDialog, currentSystem, allCategories, createProgress, refetch])

  const handleConfirmDateEdit = useCallback(async () => {
    if (dateEditDialog.item && dateEditDialog.end_date) {
      if (dateEditDialog.raised_date && dateEditDialog.end_date.startOf('day').isBefore(dateEditDialog.raised_date.startOf('day'))) {
        setSnackbar({ open: true, message: 'End date cannot be before raised date.', severity: 'error' })
        return
      }
      const updatePayload = { ids: [Number(dateEditDialog.item.id)], status: 'done', end_date: dateEditDialog.end_date.format('YYYY-MM-DD') }
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

  // ── Table columns — includes Created By and Updated By ────────────────────
  const tableColumns = isDoneTab
    ? ['ID', 'Description', 'Remarks', 'Raised Date', 'Target Date', 'End Date', 'Created By', 'Updated By', 'Status']
    : hasSystemCategoryAccess
      ? ['ID', 'Description', 'Remarks', 'Raised Date', 'Target Date', 'End Date', 'Created By', 'Updated By', 'Status', 'Action']
      : ['ID', 'Description', 'Remarks', 'Raised Date', 'Target Date', 'End Date', 'Created By', 'Updated By', 'Status']

  const isCreateSubmitDisabled =
    !createDialog.selectedCategory ||
    !createDialog.raisedDate ||
    createDialog.entries.some(e => !e.description)

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
          {/* Pending count summary */}
          <Typography variant="body2" className="systemCategoryPendingSummary" sx={{ fontFamily: OSWALD, fontWeight: 500, mt: 0.3 }}>
            {statusCounts.pending} pending {statusCounts.pending === 1 ? 'item' : 'items'} across{' '}
            {pendingCategoriesCount} {pendingCategoriesCount === 1 ? 'category' : 'categories'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Back to System page" arrow>
            <IconButton onClick={() => navigate('/systems')} className="systemCategoryBackButton">
              <SettingsSystemDaydreamIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className="systemCategoryAddButton"
            onClick={handleOpenCreateDialog}
            sx={{ fontFamily: OSWALD }}
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
            className="systemCategoryTabs"
            sx={{
              '& .MuiTab-root': { fontFamily: OSWALD, textTransform: 'capitalize', fontWeight: 600 },
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
                className={`systemCategoryAccordion ${isNewCategory ? 'systemCategoryAccordion--new' : ''}`}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon className="systemCategoryExpandIcon" />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                    <Typography variant="h6" sx={{ fontFamily: OSWALD, flex: 1 }}>
                      {category.categoryName}
                    </Typography>

                    {/* Bulk selection toolbar — only for access users on non-done tabs */}
                    {hasSystemCategoryAccess && !isDoneTab && filteredProgress.length > 0 && selectedCount > 0 && (
                      <Box
                        onClick={e => e.stopPropagation()}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Chip
                          label={`${selectedCount} selected`}
                          size="small"
                          className="systemCategorySelectedChip"
                          sx={{ fontFamily: OSWALD, fontWeight: 600 }}
                        />
                        {selectedStatusFilter === 'hold' ? (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={async () => {
                              const ids = Array.from(getSelected(idx)).map(Number)
                              if (!ids.length) return
                              setBulkLoading(true)
                              try {
                                await updateProgress({ ids, status: 'pending' }).unwrap()
                                await refetch()
                                clearSelection(idx)
                                setSnackbar({ open: true, message: `${ids.length} item(s) marked as pending!`, severity: 'success' })
                              } catch (err) {
                                let msg = 'Failed to mark items as pending'
                                if (err?.data?.errors?.length > 0) msg = err.data.errors[0]?.detail || msg
                                else if (err?.data?.message) msg = err.data.message
                                setSnackbar({ open: true, message: msg, severity: 'error' })
                              } finally {
                                setBulkLoading(false)
                              }
                            }}
                            className="systemCategoryBulkPendingBtn"
                            sx={{ fontFamily: OSWALD, fontSize: '0.75rem', py: 0.4 }}
                            disabled={bulkLoading}
                          >
                            {bulkLoading ? <CircularProgress size={16} className="systemCategoryInlineWhiteSpinner" sx={{ mr: 1 }} /> : null}
                            Mark as Pending
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<DoneAllIcon />}
                              onClick={() => handleOpenBulkDone(idx)}
                              className="systemCategoryBulkDoneBtn"
                              sx={{ fontFamily: OSWALD, fontSize: '0.75rem', py: 0.4 }}
                            >
                              Mark as Done
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={async () => {
                                const ids = Array.from(getSelected(idx)).map(Number)
                                if (!ids.length) return
                                setBulkLoading(true)
                                try {
                                  await updateProgress({ ids, status: 'hold' }).unwrap()
                                  await refetch()
                                  clearSelection(idx)
                                  setSnackbar({ open: true, message: `${ids.length} item(s) marked as on hold!`, severity: 'success' })
                                } catch (err) {
                                  let msg = 'Failed to mark items as on hold'
                                  if (err?.data?.errors?.length > 0) msg = err.data.errors[0]?.detail || msg
                                  else if (err?.data?.message) msg = err.data.message
                                  setSnackbar({ open: true, message: msg, severity: 'error' })
                                } finally {
                                  setBulkLoading(false)
                                }
                              }}
                              className="systemCategoryBulkHoldBtn"
                              sx={{ fontFamily: OSWALD, fontSize: '0.75rem', py: 0.4 }}
                              disabled={bulkLoading}
                            >
                              {bulkLoading ? <CircularProgress size={16} className="systemCategoryInlineWhiteSpinner" sx={{ mr: 1 }} /> : null}
                              Mark as On Hold
                            </Button>
                          </>
                        )}
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => clearSelection(idx)}
                          className="systemCategoryClearBtn"
                          sx={{ fontFamily: OSWALD, fontSize: '0.75rem' }}
                          disabled={bulkLoading}
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
                              {/* Checkbox — only for access users on non-done tabs */}
                              {hasSystemCategoryAccess && !isDoneTab && (
                                <TableCell padding="checkbox" sx={{ backgroundColor: 'inherit' }}>
                                  <Checkbox
                                    size="small"
                                    indeterminate={someSelected}
                                    checked={allVisibleSelected}
                                    onChange={() => toggleSelectAll(idx, visibleItems)}
                                    className="systemCategoryCheckbox"
                                  />
                                </TableCell>
                              )}
                              {tableColumns.map(h => (
                                <TableCell
                                  key={h}
                                  align="center"
                                  sx={{ fontWeight: 'bold', fontFamily: OSWALD }}
                                >
                                  {h}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {visibleItems.map((item) => {
                              const isChecked = hasSystemCategoryAccess && selected.has(item.id)
                              return (
                                <TableRow
                                  key={item.id}
                                  onClick={() => {
                                    // Only users with access can click row to mark as done
                                    if (!hasSystemCategoryAccess) return
                                    if (item.status?.toLowerCase() !== 'done' && !anchorEl) {
                                      handleOpenDateEditDialog(item)
                                    }
                                  }}
                                  className={`systemCategoryTableRow ${isChecked ? 'is-selected' : ''} ${(!hasSystemCategoryAccess || item.status?.toLowerCase() === 'done') ? '' : 'is-clickable'}`}
                                >
                                  {/* Checkbox cell — only for access users on non-done tabs */}
                                  {hasSystemCategoryAccess && !isDoneTab && (
                                    <TableCell padding="checkbox" onClick={e => e.stopPropagation()}>
                                      <Checkbox
                                        size="small"
                                        checked={isChecked}
                                        onChange={() => toggleSelectItem(idx, item.id)}
                                        className="systemCategoryCheckbox"
                                      />
                                    </TableCell>
                                  )}

                                  <TableCell sx={{ fontFamily: OSWALD, textAlign: 'center' }}>{item.id}</TableCell>

                                  {/* Description */}
                                  <TableCell className="systemCategoryRemarks" sx={{ textAlign: 'center' }}>
                                    <Typography
                                      variant="body2"
                                      onClick={(e) => { e.stopPropagation(); handleDescriptionDialogOpen(item) }}
                                      className="systemCategoryDetailLink"
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
                                      }}
                                    >
                                      {item.description || '-'}
                                    </Typography>
                                  </TableCell>

                                  {/* Remarks — inline edit only for access users */}
                                  <TableCell className="systemCategoryRemarks" sx={{ textAlign: 'center' }}>
                                    {hasSystemCategoryAccess && editingRemarksMode[item.id] ? (
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
                                          className="systemCategoryInlineRemarksField"
                                          sx={{
                                            ...oswaldInputSx,
                                          }}
                                        />
                                        <IconButton
                                          size="small"
                                          onClick={() => handleRemarksSubmit(item)}
                                          disabled={loadingStatusId === item.id}
                                          className="systemCategoryConfirmIcon"
                                          sx={{ mt: 0.5 }}
                                        >
                                          <CheckIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        onClick={(e) => { e.stopPropagation(); handleRemarksDialogOpen(item) }}
                                        className="systemCategoryDetailLink"
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
                                        }}
                                      >
                                        {item.remarks || '-'}
                                      </Typography>
                                    )}
                                  </TableCell>

                                  <TableCell sx={{ fontFamily: OSWALD, textAlign: 'center' }}>{item.raised_date || '-'}</TableCell>
                                  <TableCell sx={{ fontFamily: OSWALD, textAlign: 'center' }}>{item.target_date || item.start_date || '-'}</TableCell>
                                  <TableCell sx={{ fontFamily: OSWALD, textAlign: 'center' }}>{item.end_date || '-'}</TableCell>

                                  {/* Created By — who originally created this progress item */}
                                  <TableCell className="systemCategoryMetaCell" sx={{ fontFamily: OSWALD, textAlign: 'center' }}>
                                    {getCreatedBy(item)}
                                  </TableCell>

                                  {/* Updated By — who last updated this progress item */}
                                  <TableCell className="systemCategoryMetaCell" sx={{ fontFamily: OSWALD, textAlign: 'center' }}>
                                    {getUpdatedBy(item)}
                                  </TableCell>

                                  {/* Status chip */}
                                  <TableCell align="center">
                                    <Chip
                                      label={getStatusLabel(item.status)}
                                      size="small"
                                      className={`systemCategoryStatusChip systemCategoryStatusChip--${(item.status || 'unknown').toLowerCase()}`}
                                        sx={{
                                        fontWeight: 500,
                                        fontFamily: OSWALD,
                                        minWidth: '80px',
                                        justifyContent: 'center'
                                      }}
                                    />
                                  </TableCell>

                                  {/* Action menu — only for access users on non-done tabs */}
                                  {hasSystemCategoryAccess && !isDoneTab && (
                                    <TableCell align="center">
                                      <IconButton
                                        size="small"
                                        onClick={(e) => { e.stopPropagation(); handleActionMenuOpen(e, item) }}
                                        className="systemCategoryActionIcon"
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
                            className="systemCategoryShowMoreBtn"
                            sx={{ fontFamily: OSWALD, fontWeight: 600, fontSize: '0.8rem' }}
                          >
                            {isExpanded ? 'Show less' : `Show all ${filteredProgress.length} items`}
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
          <Typography className="systemCategoryNoCategoriesText" sx={{ fontFamily: OSWALD }}>No categories found for this system</Typography>
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
          className={`systemCategorySnackbar ${snackbar.severity === 'success' ? 'success' : 'error'}`}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Remarks Detail Dialog */}
      <Dialog open={!!selectedRemarksItem} onClose={handleRemarksDialogClose} maxWidth="sm" fullWidth className="systemCategoryDialog">
        <DialogTitle className="systemCategoryDialogTitle" sx={{ fontWeight: 600, fontFamily: OSWALD }}>Remarks Details</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" className="systemCategoryDialogInfoBox" sx={{ fontFamily: OSWALD, whiteSpace: 'pre-wrap', wordBreak: 'break-word', p: 2, borderRadius: '4px' }}>
              {selectedRemarksItem?.remarks || 'No remarks'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRemarksDialogClose} className="systemCategoryDialogCloseBtn" sx={{ fontFamily: OSWALD }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Description Detail Dialog */}
      <Dialog open={!!selectedDescriptionItem} onClose={handleDescriptionDialogClose} maxWidth="sm" fullWidth className="systemCategoryDialog">
        <DialogTitle className="systemCategoryDialogTitle" sx={{ fontWeight: 600, fontFamily: OSWALD }}>Description Details</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" className="systemCategoryDialogInfoBox" sx={{ fontFamily: OSWALD, whiteSpace: 'pre-wrap', wordBreak: 'break-word', p: 2, borderRadius: '4px' }}>
              {selectedDescriptionItem?.description || 'No description'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDescriptionDialogClose} className="systemCategoryDialogCloseBtn" sx={{ fontFamily: OSWALD }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Date Edit Dialog — only for access users */}
      {hasSystemCategoryAccess && (
        <Dialog open={dateEditDialog.open} onClose={handleCloseDateEditDialog} maxWidth="sm" fullWidth className="systemCategoryDialog">
          <DialogTitle className="systemCategoryDialogTitle" sx={{ fontWeight: 600, fontFamily: OSWALD }}>Mark As Done?</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" className="systemCategoryDialogMuted" sx={{ fontStyle: 'italic', fontFamily: OSWALD }}>
                Fill the end date in order to mark as done
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box>
                  <Typography variant="caption" className="systemCategoryDialogCaption" sx={{ fontWeight: 500, fontFamily: OSWALD }}>End Date</Typography>
                  <DatePicker
                    value={dateEditDialog.end_date}
                    onChange={(newDate) => setDateEditDialog(prev => ({ ...prev, end_date: newDate }))}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        sx: oswaldInputSx,
                        inputProps: { readOnly: true },
                        onClick: (e) => {
                          const btn = e.currentTarget.parentElement.querySelector('button[aria-label="Choose date"]')
                          if (btn) btn.click()
                        },
                      }
                    }}
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
              className="systemCategoryPrimaryBtn"
              sx={{ fontFamily: OSWALD }}
              disabled={!dateEditDialog.end_date || loadingStatusId === dateEditDialog.item?.id}
            >
              {loadingStatusId === dateEditDialog.item?.id ? 'Marking as done...' : 'Mark as Done'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Bulk Mark As Done Dialog — only for access users */}
      {hasSystemCategoryAccess && (
        <Dialog open={bulkDoneDialog.open} onClose={handleCloseBulkDone} maxWidth="sm" fullWidth className="systemCategoryDialog">
          <DialogTitle className="systemCategoryDialogTitle" sx={{ fontWeight: 600, fontFamily: OSWALD }}>
            Mark {bulkDoneDialog.categoryIdx !== null ? getSelected(bulkDoneDialog.categoryIdx).size : 0} Item(s) as Done
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" className="systemCategoryDialogMuted" sx={{ fontStyle: 'italic', fontFamily: OSWALD }}>
                Please provide an end date to mark the selected items as done.
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box>
                  <Typography variant="caption" className="systemCategoryDialogCaption" sx={{ fontWeight: 500, fontFamily: OSWALD }}>End Date *</Typography>
                  <DatePicker
                    value={bulkDoneDialog.end_date}
                    onChange={(newDate) => setBulkDoneDialog(prev => ({ ...prev, end_date: newDate }))}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        sx: oswaldInputSx,
                        inputProps: { readOnly: true },
                        onClick: (e) => {
                          const btn = e.currentTarget.parentElement.querySelector('button[aria-label="Choose date"]')
                          if (btn) btn.click()
                        },
                      }
                    }}
                    disabled={bulkLoading}
                    minDate={dayjs().startOf('day')}
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
              className="systemCategorySuccessBtn"
              sx={{ fontFamily: OSWALD }}
              disabled={!bulkDoneDialog.end_date || bulkLoading}
            >
              {bulkLoading ? <><CircularProgress size={16} className="systemCategoryInlineWhiteSpinner" sx={{ mr: 1 }} />Marking...</> : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Mark as On Hold / Pending Confirmation — only for access users */}
      {hasSystemCategoryAccess && (
        <Confirmation
          open={markAsDoneDialog.open}
          onClose={handleClosMarkAsDoneDialog}
          onConfirm={handleConfirmMarkAsDone}
          title={markAsDoneDialog.action === 'hold' ? 'Mark as On Hold?' : 'Mark as Pending?'}
          message={markAsDoneDialog.action === 'hold' ? 'The status will be changed to On Hold.' : 'The status will be changed to Pending.'}
          isLoading={loadingStatusId === markAsDoneDialog.item?.id}
        />
      )}

      {/* Edit Progress Item Dialog — only for access users */}
      {hasSystemCategoryAccess && (
        <Dialog open={editDialog.open} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth className="systemCategoryDialog">
          <DialogTitle className="systemCategoryDialogTitle" sx={{ fontWeight: 600, fontFamily: OSWALD }}>Edit Progress Item</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" className="systemCategoryDialogCaption" sx={{ fontWeight: 500, fontFamily: OSWALD }}>Description</Typography>
                <Typography variant="body2" className="systemCategoryDialogInfoBox" sx={{ mt: 0.5, p: 1, borderRadius: '4px', fontFamily: OSWALD }}>
                  {editDialog.item?.description}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" className="systemCategoryDialogCaption" sx={{ fontWeight: 500, fontFamily: OSWALD }}>Status</Typography>
                <Typography variant="body2" className="systemCategoryDialogInfoBox" sx={{ mt: 0.5, p: 1, borderRadius: '4px', fontFamily: OSWALD }}>
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
              className="systemCategoryPrimaryBtn"
              sx={{ fontFamily: OSWALD }}
              disabled={loadingStatusId === editDialog.item?.id}
            >
              {loadingStatusId === editDialog.item?.id ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Create Progress Item Dialog — open to all users */}
      <Dialog open={createDialog.open} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth className="systemCategoryDialog">
        <DialogTitle className="systemCategoryDialogTitle" sx={{ fontWeight: 600, fontFamily: OSWALD }}>
          Create New Progress Item{createDialog.entries.length > 1 ? ` (${createDialog.entries.length} entries)` : ''}
        </DialogTitle>
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

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" className="systemCategoryDialogCaption" sx={{ fontWeight: 500, fontFamily: OSWALD }}>Raised Date *</Typography>
                  <DatePicker
                    value={createDialog.raisedDate}
                    onChange={(newDate) => setCreateDialog(prev => ({ ...prev, raisedDate: newDate }))}
                    slotProps={{
                      textField: {
                        size: 'small', fullWidth: true, sx: oswaldInputSx,
                        inputProps: { readOnly: true },
                        onClick: (e) => {
                          const btn = e.currentTarget.parentElement.querySelector('button[aria-label="Choose date"]')
                          if (btn) btn.click()
                        },
                      }
                    }}
                    disabled={createLoading}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" className="systemCategoryDialogCaption" sx={{ fontWeight: 500, fontFamily: OSWALD }}>Target Date</Typography>
                  <DatePicker
                    value={createDialog.targetDate}
                    onChange={(newDate) => setCreateDialog(prev => ({ ...prev, targetDate: newDate }))}
                    slotProps={{
                      textField: {
                        size: 'small', fullWidth: true, sx: oswaldInputSx,
                        inputProps: { readOnly: true },
                        onClick: (e) => {
                          const btn = e.currentTarget.parentElement.querySelector('button[aria-label="Choose date"]')
                          if (btn) btn.click()
                        },
                      }
                    }}
                    disabled={createLoading}
                    minDate={createDialog.raisedDate}
                  />
                </Box>
              </Box>
            </LocalizationProvider>

            <TextField
              label="Remarks"
              value={createDialog.remarks}
              onChange={(e) => setCreateDialog(prev => ({ ...prev, remarks: e.target.value }))}
              fullWidth size="small" multiline rows={2}
              disabled={createLoading}
              sx={oswaldInputSx}
            />

            <Box>
              <Typography variant="caption" className="systemCategoryDialogCaption" sx={{ fontWeight: 500, fontFamily: OSWALD }}>Status</Typography>
              <TextField value="Pending" fullWidth size="small" disabled variant="outlined" sx={oswaldInputSx} />
            </Box>

            <Box className="systemCategoryDescriptionSection" sx={{ pt: 1 }}>
              <Typography variant="caption" className="systemCategoryDescriptionHeading" sx={{ fontFamily: OSWALD, fontWeight: 600, fontSize: '0.8rem' }}>
                Descriptions
              </Typography>
            </Box>

            {createDialog.entries.map((entry, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <TextField
                  label={`Description ${createDialog.entries.length > 1 ? `#${index + 1}` : ''} *`}
                  value={entry.description}
                  onChange={(e) => handleEntryDescriptionChange(index, e.target.value)}
                  fullWidth size="small" multiline rows={2}
                  disabled={createLoading}
                  sx={oswaldInputSx}
                />
                {createDialog.entries.length > 1 && (
                  <IconButton size="small" onClick={() => handleRemoveEntry(index)} disabled={createLoading} className="systemCategoryRemoveDescriptionBtn" sx={{ mt: 0.5 }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddEntry}
              disabled={createLoading}
              className="systemCategoryAddDescriptionBtn"
              sx={{ fontFamily: OSWALD, alignSelf: 'flex-start' }}
            >
              Add Description
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} disabled={createLoading} sx={{ fontFamily: OSWALD }}>Cancel</Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            className="systemCategoryPrimaryBtn"
            sx={{ fontFamily: OSWALD }}
            disabled={isCreateSubmitDisabled}
          >
            {createLoading
              ? <><CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />Creating...</>
              : `Create${createDialog.entries.length > 1 ? ` (${createDialog.entries.length})` : ''}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SystemCategory