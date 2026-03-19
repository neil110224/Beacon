import { Box, Typography, Paper, IconButton, Button, FormControl, Select, MenuItem, Chip, TextField, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar } from '@mui/material'
import Loading from '../../component/reuseable/Loading'
import nodataImg from '../../assets/alh.png'
import Nodata from '../../component/reuseable/Nodata'
import React, { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import '../contentscss/Dashboard.scss'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../features/api/slice/authSlice'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useGetSystemsListQuery } from '../../features/api/system/systemApi'
import { useGetTeamsQuery } from '../../features/api/team/teamApi'
import { useDebounce } from '../../hooks/useDebounce'
import SearchIcon from '@mui/icons-material/Search'
import CachedIcon from '@mui/icons-material/Cached'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useUpdateUserMutation } from '../../features/api/user/userApi'

// ─── Validation schema ───────────────────────────────────────────────────────
const changePasswordSchema = yup.object().shape({
  new_password: yup.string()
    .required('New password is required'),
  confirm_password: yup.string()
    .required('Confirm password is required')
    .oneOf([yup.ref('new_password')], 'Passwords must match'),
})

// ✅ Forces label to always sit on the border — overrides global SCSS interference
const fieldSx = {
  '& .MuiInputLabel-root': {
    transform: 'translate(14px, -9px) scale(0.75) !important',
    backgroundColor: '#fff',
    px: 0.5,
  },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.75) !important',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    transform: 'translate(14px, -9px) scale(0.75) !important',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    top: 0,
  },
  '& legend': {
    display: 'none',
  },
}

// ─── Force Change Password Dialog ────────────────────────────────────────────
const ForceChangePasswordDialog = ({ open, onClose, user }) => {
  const [apiLoading, setApiLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [updateUser] = useUpdateUserMutation()

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(changePasswordSchema),
    mode: 'onBlur',
    defaultValues: { new_password: '', confirm_password: '' },
  })

  const onSubmit = async (data) => {
    try {
      setApiLoading(true)
      await updateUser({ id: user.id, data: { password: data.new_password } }).unwrap()
      setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' })
      localStorage.removeItem('forceChangePassword')
      reset()
      setTimeout(() => onClose(), 1000)
    } catch (error) {
      let errorMessage = 'Failed to change password'
      if (error?.data?.message) errorMessage = error.data.message
      else if (error?.data?.errors) {
        errorMessage = Object.entries(error.data.errors)
          .map(([f, msgs]) => `${f}: ${msgs.join(', ')}`)
          .join('; ') || 'Validation failed'
      } else if (error?.message) errorMessage = error.message
      setSnackbar({ open: true, message: errorMessage, severity: 'error' })
    } finally {
      setApiLoading(false)
    }
  }

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <>
      <Dialog open={open} onClose={() => {}} maxWidth="sm" fullWidth disableEscapeKeyDown>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50' }}>
          Welcome! Change Your Password
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Alert severity="info">
              Your username and password are the same. Please set a new password to secure your account.
            </Alert>

            {/* ✅ Using Controller so MUI gets the value prop — label stays on border */}
            <Controller
              name="new_password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="New Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!!errors.new_password}
                  helperText={errors.new_password?.message}
                  disabled={apiLoading}
                  autoFocus
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
                />
              )}
            />

            <Controller
              name="confirm_password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirm Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!!errors.confirm_password}
                  helperText={errors.confirm_password?.message}
                  disabled={apiLoading}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={apiLoading}
            startIcon={apiLoading && <CircularProgress size={20} />}
            fullWidth
          >
            {apiLoading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

// ─── System Progress Card ─────────────────────────────────────────────────────
const SystemProgress = ({ system, onNavigate }) => {
  const calculateStats = (sys) => {
    let total = 0, done = 0, pending = 0, hold = 0
    if (sys.categories && Array.isArray(sys.categories)) {
      sys.categories.forEach((category) => {
        if (category.progress && Array.isArray(category.progress)) {
          category.progress.forEach((item) => {
            total++
            if (item.status === 'done') done++
            else if (item.status === 'pending') pending++
            else if (item.status === 'hold') hold++
          })
        }
      })
    }
    const remaining = total - done
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, remaining, hold, pending, percentage }
  }

  const stats = calculateStats(system)

  const getRecentItems = (sys) => {
    const items = []
    if (sys.categories && Array.isArray(sys.categories)) {
      for (let i = 0; i < sys.categories.length && items.length < 2; i++) {
        const category = sys.categories[i]
        if (category.progress && Array.isArray(category.progress)) {
          for (let j = 0; j < category.progress.length && items.length < 2; j++) {
            if (category.progress[j].status !== 'done') {
              items.push({ ...category.progress[j], category: category.categoryName })
            }
          }
        }
      }
    }
    return items
  }

  const recentItems = getRecentItems(system)

  const getStatusColor = (status) => {
    const colors = { pending: '#89D4FF', done: '#281C59', hold: '#261CC1' }
    return colors[status?.toLowerCase()] || '#9e9e9e'
  }

  return (
    <Box className="systemProgressContainer">
      <Box className="progressPercentageBox">
        <Box className="progressPercentageCircle">
          <Typography className="progressPercentageText" sx={{ fontSize: '0.75rem', fontFamily: '"Oswald", sans-serif' }}>
            {stats.percentage}%
          </Typography>
        </Box>
        <Box className="progressInfoBox">
          <Typography variant="caption" className="progressLabel" sx={{ fontFamily: '"Oswald", sans-serif' }}>
            Progress
          </Typography>
          <Typography className="progressCompleted" sx={{ fontFamily: '"Oswald", sans-serif' }}>
            {stats.pending > 0 ? 'On going' : 'Completed'}
          </Typography>
        </Box>
      </Box>

      <Box className="statsGridContainer">
        <Box className="statItem statItemTotal">
          <Typography variant="caption" className="statItemLabel" sx={{ fontFamily: '"Oswald", sans-serif' }}>Total</Typography>
          <Typography className="statItemValue" sx={{ fontFamily: '"Oswald", sans-serif' }}>{stats.total}</Typography>
        </Box>
        <Box className="statItem statItemDone">
          <Typography variant="caption" className="statItemLabel" sx={{ fontFamily: '"Oswald", sans-serif' }}>Done</Typography>
          <Typography className="statItemValue" sx={{ fontFamily: '"Oswald", sans-serif' }}>{stats.done}</Typography>
        </Box>
        <Box className="statItem statItemRemaining">
          <Typography variant="caption" className="statItemLabel" sx={{ fontFamily: '"Oswald", sans-serif' }}>Pending</Typography>
          <Typography className="statItemValue" sx={{ fontFamily: '"Oswald", sans-serif' }}>{stats.remaining}</Typography>
        </Box>
        <Box className="statItem statItemHold">
          <Typography variant="caption" className="statItemLabel" sx={{ fontFamily: '"Oswald", sans-serif' }}>On Hold</Typography>
          <Typography className="statItemValue" sx={{ fontFamily: '"Oswald", sans-serif' }}>{stats.hold}</Typography>
        </Box>
      </Box>

      {recentItems.length > 0 && (
        <Box className="pendingTasksSection">
          <Typography variant="caption" className="pendingTasksTitle" sx={{ fontFamily: '"Oswald", sans-serif' }}>
            Pending Tasks
          </Typography>
          <Box component="ul" className="pendingTasksList" sx={{ fontSize: '0.55rem', fontFamily: '"Oswald", sans-serif' }}>
            {recentItems.map((item, idx) => (
              <Box key={idx} component="li" className="pendingTaskItem">
                <Typography className="pendingTaskDescription" sx={{ fontFamily: '"Oswald", sans-serif' }}>
                  {item.description}
                </Typography>
                <Chip
                  label={item.status}
                  className="pendingTaskChip"
                  sx={{ bgcolor: getStatusColor(item.status) }}
                />
              </Box>
            ))}
          </Box>
          {(() => {
            let totalPending = 0
            system.categories?.forEach(cat => {
              cat.progress?.forEach(item => { if (item.status !== 'done') totalPending++ })
            })
            return totalPending > 2 ? (
              <Typography className="pendingTasksEllipsis" sx={{ fontFamily: '"Oswald", sans-serif' }}>......</Typography>
            ) : null
          })()}
          <Button
            size="small"
            onClick={onNavigate}
            className="viewAllButton"
            sx={{ fontSize: '10px', fontFamily: '"Oswald", sans-serif' }}
          >
            View All
          </Button>
        </Box>
      )}
    </Box>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const userPermissions = user?.role?.access_permissions || []
  const canFilterByTeam = userPermissions.includes('Dashboard.FilterTeam')
  const { isSidebarCollapsed = false, isSidebarLocked = false } = useOutletContext() || {}
  const [selectedTeam, setSelectedTeam] = useState('')
  const [systemsSearchQuery, setSystemsSearchQuery] = useState('')

  const [forceChangePasswordOpen, setForceChangePasswordOpen] = useState(
    () => localStorage.getItem('forceChangePassword') === 'true'
  )

  const debouncedSystemsSearch = useDebounce(systemsSearchQuery, 500)

  const { data: teamsData } = useGetTeamsQuery({
    status: 'active',
    paginate: 'none',
    pagination: 'none',
  })

  const teams = Array.isArray(teamsData?.data?.data)
    ? teamsData.data.data
    : Array.isArray(teamsData?.data)
    ? teamsData.data
    : Array.isArray(teamsData)
    ? teamsData
    : []

  const buildQueryParams = () => {
    const isUserRole = user?.role?.name?.toLowerCase() === "user"
    const baseParams = {}
    if (selectedTeam) {
      baseParams.status = "active"
      baseParams.scope = "per_team"
      baseParams.team_id = selectedTeam
    } else if (isUserRole && user?.team?.id) {
      baseParams.status = "active"
      baseParams.scope = "per_team"
      baseParams.team_id = user.team.id
    } else {
      baseParams.status = "active"
      baseParams.scope = "global"
    }
    if (debouncedSystemsSearch) baseParams.search = debouncedSystemsSearch
    return baseParams
  }

  const queryParams = buildQueryParams()
  const { data: systemsData, isLoading: systemsLoading, error: systemsError, refetch: refetchSystems } = useGetSystemsListQuery(queryParams)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try { await refetchSystems() } finally { setIsRefreshing(false) }
  }

  const filteredSystems = Array.isArray(systemsData) ? systemsData : []

  const calculateOverallStats = () => {
    let totalSum = 0, completedSum = 0, pendingSum = 0
    if (Array.isArray(filteredSystems)) {
      filteredSystems.forEach((system) => {
        if (system.categories && Array.isArray(system.categories)) {
          system.categories.forEach((category) => {
            if (category.progress && Array.isArray(category.progress)) {
              category.progress.forEach((item) => {
                totalSum++
                if (item.status === 'done') completedSum++
                else if (item.status === 'pending') pendingSum++
              })
            }
          })
        }
      })
    }
    const percentage = totalSum > 0 ? Math.round((completedSum / totalSum) * 100) : 0
    return { pending: pendingSum, completed: completedSum, percentage }
  }

  const stats = calculateOverallStats()

  const StatCard = ({ title, count, icon: Icon, color, isPercentage = false }) => (
    <Paper elevation={0} className="statCard" sx={{ bgcolor: '#f3f3f3' }}>
      <Box className="statCardContent">
        <Box className="statCardIcon" sx={{ bgcolor: `${color}15` }}>
          <Icon sx={{ fontSize: 20, color }} />
        </Box>
        <Box className="statCardValue">
          <Typography variant="h6" className="statCardNumber" sx={{ fontFamily: '"Oswald", sans-serif' }}>
            {count}{isPercentage && '%'}
          </Typography>
          <Typography variant="body2" className="statCardLabel" sx={{ fontFamily: '"Oswald", sans-serif' }}>
            {title}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )

  if (systemsLoading) {
    return (
      <Box className="dashboardLoadingContainer">
        <Loading />
      </Box>
    )
  }

  return (
    <Box className="dashboardContainer">

      <ForceChangePasswordDialog
        open={forceChangePasswordOpen}
        onClose={() => setForceChangePasswordOpen(false)}
        user={user}
      />

      <Box className="welcomeSection" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" className="welcomeTitle" sx={{ fontFamily: '"Oswald", sans-serif' }}>
          Welcome back, {user?.first_name || 'User'}!
        </Typography>

        {canFilterByTeam && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Refresh systems" placement="top">
              <IconButton
                onClick={handleRefresh}
                disabled={isRefreshing}
                sx={{ color: '#03346E', '&:hover': { backgroundColor: 'rgba(3, 52, 110, 0.08)' } }}
              >
                <CachedIcon sx={{
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }
                }} />
              </IconButton>
            </Tooltip>
            <FormControl className="filterSelect" size="small">
              <Select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                displayEmpty
                className="filterSelectInput"
              >
                <MenuItem value="">
                  <Typography className="filterMenuItemText" sx={{ fontFamily: '"Oswald", sans-serif' }}>All Teams</Typography>
                </MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              placeholder="Search systems..."
              value={systemsSearchQuery}
              onChange={(e) => setSystemsSearchQuery(e.target.value)}
              size="small"
              className="systemsSearchField"
              InputProps={{
                startAdornment: <SearchIcon className="searchIcon" />,
                endAdornment: (systemsSearchQuery !== '' && (systemsLoading || systemsSearchQuery !== debouncedSystemsSearch)) ? (
                  <CircularProgress size={20} sx={{ color: '#03346E', mr: 1 }} />
                ) : null,
              }}
              sx={{ minWidth: 250 }}
            />
          </Box>
        )}
      </Box>

      <Box className="summarySectionWrapper">
        <Box className="summaryCardBox">
          <StatCard title="Pending" count={stats.pending} icon={PendingActionsIcon} color="#857fe0" />
        </Box>
        <Box className="summaryCardBox">
          <StatCard title="Progress" count={parseInt(stats.percentage)} icon={CheckCircleIcon} color="#160d92" isPercentage={true} />
        </Box>
      </Box>

      {systemsError ? (
        <Box className="emptyStateContainer">
          <Box className="emptyStateContent">
            <Box><Nodata /></Box>
            <Box className="emptyStateText">
              <Typography variant="h6" className="emptyStateTitle" sx={{ fontFamily: '"Oswald", sans-serif' }}>
                {user?.team?.name || 'Your Team'}
              </Typography>
              <Typography variant="body2" className="emptyStateDescription" sx={{ fontFamily: '"Oswald", sans-serif' }}>
                Currently no system
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : !Array.isArray(filteredSystems) || filteredSystems.length === 0 ? (
        <Box className="emptyStateContainer">
          <Box className="emptyStateContent">
            <Box component="img" src={nodataImg} alt="No data" className="emptyStateImage" />
            <Box className="emptyStateText">
              <Typography variant="h6" className="emptyStateTitle" sx={{ fontFamily: '"Oswald", sans-serif' }}>
                {user?.team?.name || 'Projects'}
              </Typography>
              <Typography variant="body2" className="emptyStateDescription">
                Currently no system
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box className="systemsGrid">
          {filteredSystems.map((system, idx) => (
            <Box
              key={`${system.systemName}-${idx}`}
              onClick={() => navigate(`/SystemCategory/${system.systemName}`)}
              className="systemCard"
            >
              <Typography variant='h6' className="projectName" sx={{ fontFamily: '"Oswald", sans-serif' }}>
                {system.systemName}
              </Typography>
              <Box className="systemCardContent">
                <SystemProgress
                  system={system}
                  onNavigate={() => navigate(`/SystemCategory/${system.systemName}`)}
                />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default Dashboard