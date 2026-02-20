import { Box, Typography, Paper } from '@mui/material'
import React from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../features/api/slice/authSlice'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import PauseCircleIcon from '@mui/icons-material/PauseCircle'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const Dashboard = () => {
  const user = useSelector(selectCurrentUser)

  // Sample data - replace with actual API data later
  const stats = {
    pending: 12,
    hold: 3,
    completed: 45
  }

  // Calculate total and completion percentage
  const total = stats.pending + stats.hold + stats.completed
  const completionPercentage = total > 0 ? Math.round((stats.completed / total) * 100) : 0

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

  return (
    <Box sx={{ 
      p: 1, 
      width: '100%', 
      maxWidth: '100%',
      maxHeight: '100vh', 
      overflow: 'hidden',
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
          Welcome back, {user?.name || 'User'}!
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
            title="On Hold"
            count={stats.hold}
            icon={PauseCircleIcon}
            color="#ef4444"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <StatCard
            title="Completed"
            count={completionPercentage}
            icon={CheckCircleIcon}
            color="#22c55e"
            isPercentage={true}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Dashboard