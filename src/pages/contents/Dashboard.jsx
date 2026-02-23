import { Box, Typography, Paper, IconButton, CircularProgress, Button } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../features/api/slice/authSlice'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useGetSystemsListQuery } from '../../features/api/system/systemApi'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, width: '100%', height: '100%' }}>
      {/* Progress Percentage Display */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: '#f9fafb',
        borderRadius: 1.5,
        p: 0.8,
        border: '1px solid #e5e7eb'
      }}>
        <Box sx={{
          bgcolor: '#3b82f6',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
            {stats.percentage}%
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#6b7280', display: 'block' }}>
            Progress
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1f2937' }}>
            Completed
          </Typography>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6 }}>
        <Box sx={{
          bgcolor: '#f3f4f6',
          borderRadius: 1,
          p: 0.6,
          borderLeft: '3px solid #3b82f6'
        }}>
          <Typography variant="caption" sx={{ fontSize: '0.55rem', color: '#6b7280', display: 'block', mb: 0.15 }}>
            Total
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2937' }}>
            {stats.total}
          </Typography>
        </Box>

        <Box sx={{
          bgcolor: '#f0fdf4',
          borderRadius: 1,
          p: 0.6,
          borderLeft: '3px solid #22c55e'
        }}>
          <Typography variant="caption" sx={{ fontSize: '0.55rem', color: '#22c55e', display: 'block', mb: 0.15, fontWeight: 600 }}>
            Done
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#15803d' }}>
            {stats.done}
          </Typography>
        </Box>

        <Box sx={{
          bgcolor: '#fef3c7',
          borderRadius: 1,
          p: 0.6,
          borderLeft: '3px solid #f59e0b'
        }}>
          <Typography variant="caption" sx={{ fontSize: '0.55rem', color: '#92400e', display: 'block', mb: 0.15, fontWeight: 600 }}>
            Remaining
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#b45309' }}>
            {stats.remaining}
          </Typography>
        </Box>

        <Box sx={{
          bgcolor: '#fee2e2',
          borderRadius: 1,
          p: 0.6,
          borderLeft: '3px solid #ef4444'
        }}>
          <Typography variant="caption" sx={{ fontSize: '0.55rem', color: '#991b1b', display: 'block', mb: 0.15, fontWeight: 600 }}>
            On Hold
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#dc2626' }}>
            {stats.hold}
          </Typography>
        </Box>
      </Box>



      {/* Recent Items Section */}
      {recentItems.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#6b7280', fontWeight: 600, mb: 0.3, display: 'block' }}>
            Pending Tasks
          </Typography>
          <Box component="ul" sx={{ 
            m: 0,
            pl: 2,
            listStyleType: 'disc',
            color: '#000',
            display: 'flex',
            flexDirection: 'column', 
            gap: 0.2,
            fontSize: '0.65rem',
          }}>
            {recentItems.map((item, idx) => (
              <Box
                key={idx}
                component="li"
                sx={{
                  fontSize: '0.65rem',
                  color: '#1f2937',
                  display: 'flex',
                  gap: 0.3,
                  alignItems: 'flex-start',
                }}
              >
                <Typography sx={{ fontSize: '0.65rem', color: '#1f2937', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                  {item.description}
                </Typography>
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: getStatusColor(item.status),
                  color: '#fff',
                  px: 0.3,
                  py: 0.15,
                  borderRadius: '2px',
                  fontSize: '0.55rem',
                  fontWeight: 600,
                  flexShrink: 0,
                  minWidth: 'fit-content'
                }}>
                  {item.status}
                </Box>
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
              <Typography sx={{ fontSize: '0.6rem', color: '#6b7280', mt: 0.15 }}>
                ......
              </Typography>
            ) : null
          })()}
          <Button
            size="small"
            onClick={onNavigate}
            sx={{
              mt: 0.3,
              textTransform: 'none',
              fontSize: '0.65rem',
              color: '#3b82f6',
              padding: 0,
              '&:hover': { textDecoration: 'underline' }
            }}
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
  const { data: systemsData, isLoading: systemsLoading, error: systemsError } = useGetSystemsListQuery()

  // Calculate overall stats from all systems
  const calculateOverallStats = () => {
    let totalSum = 0, completedSum = 0, pendingSum = 0

    if (Array.isArray(systemsData)) {
      systemsData.forEach((system) => {
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
      sx={{
        p: 1.5,
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        maxWidth: '100%',
        boxSizing: 'border-box',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            minWidth: 40,
            borderRadius: '8px',
            bgcolor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ fontSize: 20, color }} />
        </Box>
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0, fontSize: '1.25rem' }}>
            {count}{isPercentage && '%'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 500, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            {title}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )

  if (systemsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (systemsError) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        Error loading systems: {systemsError?.data?.message || systemsError?.error || 'Unknown error'}
      </Box>
    )
  }

  return (
    <Box sx={{ 
      p: 1, 
      width: '100%', 
      maxWidth: '100%',
      minHeight: '100vh',
      overflow: 'auto',
      boxSizing: 'border-box'
    }}>
      {/* Welcome Message */}
      <Box sx={{ mb: 1.5 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            color: '#2c3e50',
            mb: 0.5,
            fontSize: '1.1rem'
          }}
        >
          Welcome back, {user?.first_name || 'User'}!
        </Typography>
        <Typography variant="body2" sx={{ color: '#6c757d', fontSize: '0.85rem' }}>
          Here's an overview of your projects
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box sx={{
        display: 'flex',
        gap: 1.5, 
        width: '100%',
        maxWidth: '100%',
        flexWrap: 'nowrap'
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <StatCard
            title="Pending"
            count={stats.pending}
            icon={PendingActionsIcon}
            color="#f59e0b"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <StatCard
            title="Progress"
            count={parseInt(stats.percentage)}
            icon={CheckCircleIcon}
            color="#22c55e"
            isPercentage={true}
          />
        </Box>
      </Box>

      {/* Systems Grid */}
      <Box sx={{
        mt: 1,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 1.7,
        justifyContent: 'flex-start'
      }}>
        {Array.isArray(systemsData) && systemsData.map((system, idx) => (
          <Box
            key={`${system.systemName}-${idx}`}
            onClick={() => navigate(`/SystemCategory/${system.systemName}`)}
            sx={{
              bgcolor: '#dfdfdf',
              flex: '0 1 calc(31% - 8px)',
              height: { xs: '280px', sm: '350px' },
              borderRadius: 2,
              position: 'relative',
              boxShadow: 2,
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-4px)',
              }
            }}
          >
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 0.5 }}>
              <Typography variant='h6' sx={{ p: 0.5, pl: 0, fontWeight: 600, m: 0, fontSize: '1rem' }}>
                {system.systemName}
              </Typography>
              <IconButton sx={{ p: 0.5, color: '#6c757d' }}>
                <ArrowForwardIosIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
            <Box
              sx={{
                bgcolor: '#f4f4f4',
                width: '92%',
                flex: 1,
                p: 1.5,
                mt: 0.5,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <SystemProgress 
                system={system} 
                onNavigate={() => navigate(`/SystemCategory/${system.systemName}`)}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default Dashboard