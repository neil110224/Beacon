import React, { useEffect, useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import { usePatchTeamMutation } from '../../features/api/team/teamApi'
import { useGetSystemsListQuery } from '../../features/api/system/systemApi'
import Snackbar from '../../component/reuseable/Snackbar' // adjust path as needed

export default function SystemteamEditDialog({
  open,
  onClose,
  team = null,
  onSuccess = null,
}) {
  const [patchTeam, { isLoading: isUpdating }] = usePatchTeamMutation()

  const { data: systemsData, isLoading: systemsLoading } = useGetSystemsListQuery(
    { status: 'active', paginate: 'none', pagination: 'none' },
    { skip: !open }
  )

  const [assignedIds, setAssignedIds] = useState([])
  const [initialized, setInitialized] = useState(false)
  const [leftSearch, setLeftSearch]   = useState('')
  const [rightSearch, setRightSearch] = useState('')

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Normalize all systems from API response
  const allSystems = useMemo(() => {
    if (Array.isArray(systemsData)) return systemsData
    if (systemsData?.data?.data && Array.isArray(systemsData.data.data)) return systemsData.data.data
    if (systemsData?.data && Array.isArray(systemsData.data)) return systemsData.data
    return []
  }, [systemsData])

  // Reset when dialog closes or team changes
  useEffect(() => {
    if (!open) {
      setInitialized(false)
      setAssignedIds([])
      setLeftSearch('')
      setRightSearch('')
    }
  }, [open, team?.id])

  // Seed assignedIds once — only after allSystems is loaded
  useEffect(() => {
    if (!open || !team || allSystems.length === 0 || initialized) return

    const ids = allSystems
      .filter(s => Array.isArray(s.team) && s.team.some(t => t.id === team.id))
      .map(s => s.id)

    setAssignedIds(ids)
    setInitialized(true)
  }, [open, team?.id, allSystems, initialized])

  // Derive panels
  const assignedSystems  = useMemo(() => allSystems.filter(s =>  assignedIds.includes(s.id)), [allSystems, assignedIds])
  const availableSystems = useMemo(() => allSystems.filter(s => !assignedIds.includes(s.id)), [allSystems, assignedIds])

  const filteredAvailable = useMemo(() => {
    const q = leftSearch.trim().toLowerCase()
    return q ? availableSystems.filter(s => s.systemName?.toLowerCase().includes(q)) : availableSystems
  }, [availableSystems, leftSearch])

  const filteredAssigned = useMemo(() => {
    const q = rightSearch.trim().toLowerCase()
    return q ? assignedSystems.filter(s => s.systemName?.toLowerCase().includes(q)) : assignedSystems
  }, [assignedSystems, rightSearch])

  const handleAdd       = id => setAssignedIds(prev => [...prev, id])
  const handleRemove    = id => setAssignedIds(prev => prev.filter(x => x !== id))
  const handleAddAll    = ()  => setAssignedIds(prev => [...new Set([...prev, ...filteredAvailable.map(s => s.id)])])
  const handleRemoveAll = ()  => {
    const ids = new Set(filteredAssigned.map(s => s.id))
    setAssignedIds(prev => prev.filter(id => !ids.has(id)))
  }

  const handleSave = async () => {
    try {
      const originalIds = allSystems
        .filter(s => Array.isArray(s.team) && s.team.some(t => t.id === team.id))
        .map(s => s.id)

      const toAdd    = assignedIds.filter(id => !originalIds.includes(id))
      const toRemove = originalIds.filter(id => !assignedIds.includes(id))

      if (toAdd.length === 0 && toRemove.length === 0) {
        showSnackbar('No changes to save.', 'info')
        return
      }

      const body = {}
      if (toAdd.length > 0)    body.add_systems    = toAdd
      if (toRemove.length > 0) body.remove_systems = toRemove

      await patchTeam({ id: team.id, body }).unwrap()

      showSnackbar('Team systems updated successfully!', 'success')

      setTimeout(() => {
        onClose()
        if (onSuccess) onSuccess()
      }, 1200) // let snackbar show before closing

    } catch (err) {
      console.error('Error patching team:', err)
      showSnackbar(err?.data?.message || err?.message || 'Failed to save changes.', 'error')
    }
  }

  const handleClose = () => {
    setLeftSearch('')
    setRightSearch('')
    setInitialized(false)
    onClose()
  }

  // ── Reusable panel renderer ──────────────────────────────────────────────
  const renderPanel = ({
    title, count, chipColor, chipTextColor,
    items, emptyMsg,
    searchValue, onSearchChange, searchPlaceholder,
    actionLabel, actionColor, onAction,
    onBulkLabel, onBulkColor, onBulkAction, bulkDisabled,
    hoverBg,
  }) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#555' }}>
          {title}
          <Chip
            label={count}
            size="small"
            sx={{ ml: 1, height: 18, fontSize: '0.7rem', bgcolor: chipColor, color: chipTextColor }}
          />
        </Typography>
        <Tooltip title={`${onBulkLabel} all visible`}>
          <span>
            <Button
              size="small"
              disabled={bulkDisabled}
              onClick={onBulkAction}
              sx={{ fontSize: '0.7rem', color: onBulkColor, minWidth: 'unset', p: '2px 6px' }}
            >
              {onBulkLabel} All
            </Button>
          </span>
        </Tooltip>
      </Box>

      <TextField
        placeholder={searchPlaceholder}
        variant="outlined"
        size="small"
        fullWidth
        value={searchValue}
        onChange={e => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: '#9e9e9e' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1 }}
      />

      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '6px', height: 340, overflowY: 'auto', bgcolor: '#fafafa' }}>
        {items.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body2" sx={{ color: '#aaa' }}>{emptyMsg}</Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {items.map((system, idx) => (
              <React.Fragment key={system.id}>
                <ListItem sx={{ px: 1.5, '&:hover': { bgcolor: hoverBg }, transition: 'background 0.15s' }}>
                  <ListItemText
                    primary={system.systemName}
                    primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                    secondary={
                      Array.isArray(system.team) && system.team.length > 0
                        ? `Teams: ${system.team.map(t => t.name).join(', ')}`
                        : 'Not in any team'
                    }
                    secondaryTypographyProps={{ fontSize: '0.72rem', noWrap: true }}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title={actionLabel}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onAction(system.id)}
                        sx={{ color: actionColor }}
                      >
                        {actionLabel === 'Add to team'
                          ? <AddCircleOutlineIcon fontSize="small" />
                          : <RemoveCircleOutlineIcon fontSize="small" />
                        }
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                {idx < items.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  )

  // ────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' } }}
      >
        <DialogTitle sx={{ fontFamily: '"Oswald", sans-serif', fontWeight: 600, pb: 0.5 }}>
          Manage Systems
          {team && (
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 400, fontFamily: 'inherit', mt: 0.25 }}>
              Team: <strong>{team.name}</strong>
            </Typography>
          )}
        </DialogTitle>

        <DialogContent sx={{ pt: 1.5 }}>
          {systemsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: '#03346E' }} />
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 2, alignItems: 'start' }}>

              {/* LEFT — Available (not in this team) */}
              {renderPanel({
                title:             'Available Systems',
                count:             availableSystems.length,
                chipColor:         '#e0e0e0',
                chipTextColor:     '#333',
                items:             filteredAvailable,
                emptyMsg:          leftSearch ? 'No results found' : 'All systems are assigned',
                searchValue:       leftSearch,
                onSearchChange:    setLeftSearch,
                searchPlaceholder: 'Search available...',
                actionLabel:       'Add to team',
                actionColor:       '#03346E',
                onAction:          handleAdd,
                onBulkLabel:       'Add',
                onBulkColor:       '#03346E',
                onBulkAction:      handleAddAll,
                bulkDisabled:      filteredAvailable.length === 0,
                hoverBg:           '#f0f4fa',
              })}

              {/* CENTER DIVIDER */}
              <Box sx={{ bgcolor: '#e0e0e0', height: 430, mt: 4.5 }} />

              {/* RIGHT — Assigned (in this team) */}
              {renderPanel({
                title:             'In This Team',
                count:             assignedSystems.length,
                chipColor:         '#03346E',
                chipTextColor:     '#fff',
                items:             filteredAssigned,
                emptyMsg:          rightSearch ? 'No results found' : 'No systems in this team yet',
                searchValue:       rightSearch,
                onSearchChange:    setRightSearch,
                searchPlaceholder: 'Search assigned...',
                actionLabel:       'Remove from team',
                actionColor:       '#c62828',
                onAction:          handleRemove,
                onBulkLabel:       'Remove',
                onBulkColor:       '#c62828',
                onBulkAction:      handleRemoveAll,
                bulkDisabled:      filteredAssigned.length === 0,
                hoverBg:           '#fff3f3',
              })}

            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ bgcolor: '#03346E' }}
            disabled={isUpdating || systemsLoading || !initialized}
            startIcon={isUpdating && <CircularProgress size={20} color="inherit" />}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar — outside Dialog so it renders above it */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </>
  )
} 