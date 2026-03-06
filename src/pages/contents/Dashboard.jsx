import { Box, Typography, Paper, IconButton, Button, FormControl, Select, MenuItem, Chip, TextField, Tooltip } from '@mui/material'
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
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { useDebounce } from '../../hooks/useDebounce'
import SearchIcon from '@mui/icons-material/Search'
import CachedIcon from '@mui/icons-material/Cached'

const SystemProgress = ({ system, onNavigate }) => {
  // Calculate stats from the system's nested data
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

  // Get recent pending items (limit to 2, exclude done items)
  const getRecentItems = (sys) => {
    const items = []
    if (sys.categories && Array.isArray(sys.categories)) {
      for (let i = 0; i < sys.categories.length && items.length < 2; i++) {
        const category = sys.categories[i]
        if (category.progress && Array.isArray(category.progress)) {
          for (let j = 0; j < category.progress.length && items.length < 2; j++) {
            // Only add pending and hold items, skip done items
            if (category.progress[j].status !== 'done') {
              items.push({
                ...category.progress[j],
                category: category.categoryName
              })
            }
          }
        }
      }
    }
    return items
  }

  const recentItems = getRecentItems(system)

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      done: '#4caf50',
      hold: '#2196f3',
      inprogress: '#9c27b0',
    }
    return colors[status?.toLowerCase()] || '#9e9e9e'
  }

  return (
    <Box className="systemProgressContainer">
      {/* Progress Percentage Display */}
      <Box className="progressPercentageBox">
        <Box className="progressPercentageCircle">
          <Typography className="progressPercentageText">
            {stats.percentage}%
          </Typography>
        </Box>
        <Box className="progressInfoBox">
          <Typography variant="caption" className="progressLabel">
            Progress
          </Typography>
          <Typography className="progressCompleted">
            Completed
          </Typography>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Box className="statsGridContainer">
        <Box className="statItem statItemTotal">
          <Typography variant="caption" className="statItemLabel">
            Total
          </Typography>
          <Typography className="statItemValue">
            {stats.total}
          </Typography>
        </Box>

        <Box className="statItem statItemDone">
          <Typography variant="caption" className="statItemLabel">
            Done
          </Typography>
          <Typography className="statItemValue">
            {stats.done}
          </Typography>
        </Box>

        <Box className="statItem statItemRemaining">
          <Typography variant="caption" className="statItemLabel">
            Remaining
          </Typography>
          <Typography className="statItemValue">
            {stats.remaining}
          </Typography>
        </Box>

        <Box className="statItem statItemHold">
          <Typography variant="caption" className="statItemLabel">
            On Hold
          </Typography>
          <Typography className="statItemValue">
            {stats.hold}
          </Typography>
        </Box>
      </Box>



      {/* Recent Items Section */}
      {recentItems.length > 0 && (
        <Box className="pendingTasksSection">
          <Typography variant="caption" className="pendingTasksTitle">
            Pending Tasks
          </Typography>
          <Box component="ul" className="pendingTasksList">
            {recentItems.map((item, idx) => (
              <Box
                key={idx}
                component="li"
                className="pendingTaskItem"
              >
                <Typography className="pendingTaskDescription">
                  {item.description}
                </Typography>
                {/* Chip for status */}
                <Chip 
                  label={item.status} 
                  className="pendingTaskChip"
                  sx={{
                    bgcolor: getStatusColor(item.status),
                  }}
                />
              </Box>
            ))}
          </Box>
          {(() => {
            // Count total pending/hold items
            let totalPending = 0
            system.categories?.forEach(cat => {
              cat.progress?.forEach(item => {
                if (item.status !== 'done') totalPending++
              })
            })
            return totalPending > 2 ? (
              <Typography className="pendingTasksEllipsis">
                ......
              </Typography>
            ) : null
          })()}
          <Button
            size="small"
            onClick={onNavigate}
            className="viewAllButton"
          >
            View All
          </Button>
        </Box>
      )}
    </Box>
  )
}

const Dashboard = () => {
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const userPermissions = user?.role?.access_permissions || []
  const canFilterByTeam = userPermissions.includes('Dashboard.FilterTeam')
  const { isSidebarCollapsed = false, isSidebarLocked = false } = useOutletContext() || {}
  const [selectedTeam, setSelectedTeam] = useState('')
  const [systemsSearchQuery, setSystemsSearchQuery] = useState('')

  // Debounce systems search query
  const debouncedSystemsSearch = useDebounce(systemsSearchQuery, 500)

  // Mirror the same logic used in Sidebar to compute actual collapsed state
  const isActuallySidebarCollapsed = isSidebarCollapsed ? isSidebarLocked : false

  // Fetch teams for the filter
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
  
  // Build query params based on selected team or user role
  const buildQueryParams = () => {
    const isUserRole = user?.role?.name?.toLowerCase() === "user"
    
    // If a team is selected, use that team
    if (selectedTeam) {
      return {
        status: "active",
        scope: "per_team",
        team_id: selectedTeam
      }
    }
    
    // Otherwise, use the default logic based on user role
    if (isUserRole && user?.team?.id) {
      return {
        status: "active",
        scope: "per_team",
        team_id: user.team.id
      }
    } else {
      return {
        status: "active",
        scope: "global"
      }
    }
  }

  const queryParams = buildQueryParams()
  const { data: systemsData, isLoading: systemsLoading, error: systemsError, refetch: refetchSystems } = useGetSystemsListQuery(queryParams)
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchSystems();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter systems based on search query
  const filteredSystems = Array.isArray(systemsData)
    ? systemsData.filter(system =>
        system.systemName.toLowerCase().includes(debouncedSystemsSearch.toLowerCase())
      )
    : []

  // Calculate overall stats from filtered systems
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
    return {
      pending: pendingSum,
      completed: completedSum,
      percentage: percentage
    }
  }

  const stats = calculateOverallStats()

  const StatCard = ({ title, count, icon: Icon, color, isPercentage = false }) => (
    <Paper
      elevation={0}
      className="statCard"
      sx={{ bgcolor: '#f3f3f3', }}  
    >
      <Box className="statCardContent">
        <Box
          className="statCardIcon"
          sx={{ bgcolor: `${color}15` }}
        >
          <Icon sx={{ fontSize: 20, color }} />
        </Box>
        <Box className="statCardValue">
          <Typography variant="h6" className="statCardNumber">
            {count}{isPercentage && '%'}
          </Typography>
          <Typography variant="body2" className="statCardLabel">
            {title}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )

  if (systemsLoading) {
    return (
      <Box className="loadingContainer">
        <Loading />
      </Box>
    )
  }

  return (
    <Box className="dashboardContainer">
      {/* Welcome Message */}
      <Box className="welcomeSection">
        <Typography 
          variant="h6" 
          className="welcomeTitle"
        >
          Welcome back, {user?.first_name || 'User'}!
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box className="summarySectionWrapper">
        <Box className="summaryCardBox">
          <StatCard
            title="Pending"
            count={stats.pending}
            icon={PendingActionsIcon}
            color="#f59e0b"
          />
        </Box>
        <Box className="summaryCardBox">
          <StatCard
            title="Progress"
            count={parseInt(stats.percentage)}
            icon={CheckCircleIcon}
            color="#22c55e"
            isPercentage={true}
          />
        </Box>
      </Box>

      {/* Team Filter */}
      {canFilterByTeam && (
        <Box className="filterSection" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <FormControl className="filterSelect" size="small">
            <Select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              displayEmpty
              className="filterSelectInput"
            >
              <MenuItem value="">
                <Typography className="filterMenuItemText">All Teams</Typography>
              </MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'flex-end' }}>
            <Tooltip title="Refresh systems" placement="top">
              <IconButton
                onClick={handleRefresh}
                disabled={isRefreshing}
                sx={{
                  color: '#03346E',
                  '&:hover': { backgroundColor: 'rgba(3, 52, 110, 0.08)' }
                }}
              >
                <CachedIcon sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
              </IconButton>
            </Tooltip>
            <TextField
              placeholder="Search systems..."
              value={systemsSearchQuery}
              onChange={(e) => setSystemsSearchQuery(e.target.value)}
              size="small"
              className="systemsSearchField"
              InputProps={{
                startAdornment: <SearchIcon className="searchIcon" />,
              }}
              sx={{ minWidth: 250 }}
            />
          </Box>
        </Box>
      )}

      {/* Systems Grid */}
      {systemsError ? (
        <Box className="emptyStateContainer">
          <Box className="emptyStateContent">
            <Box>
              <Nodata />
            </Box>
            <Box className="emptyStateText">
              <Typography variant="h6" className="emptyStateTitle">
                {user?.team?.name || 'Your Team'}
              </Typography>
              <Typography variant="body2" className="emptyStateDescription">
                Currently no system
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : !Array.isArray(filteredSystems) || filteredSystems.length === 0 ? (
        <Box className="emptyStateContainer">
          <Box className="emptyStateContent">
            <Box
              component="img"
              src={nodataImg}
              alt="No data"
              className="emptyStateImage"
            />
            <Box className="emptyStateText">
              <Typography variant="h6" className="emptyStateTitle">
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
            <Box className="systemCardHeader">
              <Typography variant='h6' className="systemCardTitle">
                {system.systemName}
              </Typography>
              <IconButton className="systemCardArrow">
                <ArrowForwardIosIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
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