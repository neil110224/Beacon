import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Avatar,
  Stack,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material'
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetSystemsListQuery } from '../../features/api/system/systemApi'
import reindeer from "../../assets/reindeer.jpg";

const Systems = () => {
  const navigate = useNavigate()
  const { data: systemsData, isLoading, error } = useGetSystemsListQuery()
  const scrollContainerRefs = React.useRef({})
  const scrollAnimationRefs = React.useRef({})
  const [searchQuery, setSearchQuery] = React.useState('')

  // Group systems by team
  const groupedSystems = React.useMemo(() => {
    if (!Array.isArray(systemsData)) return {}

    const groups = {}
    systemsData.forEach((system) => {
      // Filter by search query
      if (searchQuery && !system.systemName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return
      }
      
      const teamName = system.team?.name || 'No Team'
      if (!groups[teamName]) {
        groups[teamName] = []
      }
      groups[teamName].push(system)
    })

    return groups
  }, [systemsData, searchQuery])

  const handleSystemClick = (systemTitle) => {
    navigate(`/SystemCategory/${systemTitle}`)
  }

  const handleAddSystem = () => {
    // TODO: Implement add system dialog/modal
    console.log('Add system clicked')
  }

  const createHandleWheel = (teamName) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const container = scrollContainerRefs.current[teamName]

    if (container) {
      if (scrollAnimationRefs.current[teamName]) {
        cancelAnimationFrame(scrollAnimationRefs.current[teamName])
      }

      const currentScroll = container.scrollLeft
      const targetScroll = currentScroll + (e.deltaY > 0 ? 300 : -300)
      const duration = 400
      const startTime = performance.now()

      const easeInOutQuad = (t) =>
        t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

      const scroll = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = easeInOutQuad(progress)

        container.scrollLeft =
          currentScroll + (targetScroll - currentScroll) * easeProgress

        if (progress < 1) {
          scrollAnimationRefs.current[teamName] = requestAnimationFrame(scroll)
        } else {
          scrollAnimationRefs.current[teamName] = null
        }
      }

      scrollAnimationRefs.current[teamName] = requestAnimationFrame(scroll)
    }
  }

  // Store wheel handlers in a ref to access them in cleanup
  const wheelHandlersRef = React.useRef({})

  // Add native wheel event listeners with passive: false
  React.useEffect(() => {
    // Clean up old listeners first
    Object.entries(wheelHandlersRef.current).forEach(([teamName, handler]) => {
      const container = scrollContainerRefs.current[teamName]
      if (container && handler) {
        container.removeEventListener('wheel', handler)
      }
    })
    wheelHandlersRef.current = {}

    // Add new listeners for all current containers
    Object.entries(scrollContainerRefs.current).forEach(([teamName, container]) => {
      if (container) {
        const handler = (e) => {
          e.preventDefault()
          e.stopPropagation()
          createHandleWheel(teamName)(e)
        }
        wheelHandlersRef.current[teamName] = handler
        container.addEventListener('wheel', handler, { passive: false })
      }
    })

    return () => {
      // Cleanup
      Object.entries(wheelHandlersRef.current).forEach(([teamName, handler]) => {
        const container = scrollContainerRefs.current[teamName]
        if (container && handler) {
          container.removeEventListener('wheel', handler)
        }
      })
    }
  }, [groupedSystems])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        Error loading systems:{' '}
        {error?.data?.message || error?.error || String(error?.status) || 'Unknown error'}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with Search and Add Button */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        gap: 2,
        borderBottom: '1px solid #1a1a2e'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
          Systems
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            placeholder="Search systems..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6c757d' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: '250px',
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f5f5f5',
                '&:hover fieldset': {
                  borderColor: '#3b82f6',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                },
              },
            }}
          />
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSystem}
            sx={{
              bgcolor: '#3b82f6',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
              '&:hover': {
                bgcolor: '#2563eb',
              },
            }}
          >
            Add System
          </Button>
        </Box>
      </Box>

      {/* Systems Container */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto' }}>
      {Object.entries(groupedSystems).map(([teamName, systems]) => (
        <Box
          key={teamName}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderBottom: '1px solid #1a1a2e',
            gap: 2,
          }}
        >
          <Typography variant="h5" sx={{ ml: 2, mt: 2, textDecoration: 'underline' }}>
            {teamName}
          </Typography>
          <Box
            ref={(el) => { scrollContainerRefs.current[teamName] = el }}
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-start',
              margin: '0 20px 20px 15px',
              overflowX: 'auto',
              maxWidth: 'calc(100% - 40px)',
              flexWrap: 'nowrap',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {systems.map((system, index) => (
              <Paper
                key={`${system.systemName}-${index}`}
                onClick={() => handleSystemClick(system.systemName)}
                sx={{
                  bgcolor: '#272741',
                  width: '130px',
                  height: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 1,
                  flexShrink: 0,
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 },
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant="h9"
                  sx={{
                    color: '#f4f4f4',
                    fontWeight: 100,
                    lineHeight: 1.3,
                    fontSize: '0.9rem',
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    paddingRight: '28px',
                  }}
                >
                  {system.systemName}
                </Typography>
                <Box sx={{ position: 'absolute', bottom: 4, left: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Avatar
                    alt="System Avatar"
                    src={reindeer}
                    sx={{ width: 24, height: 24 }}
                  />
                </Box>
                <Box sx={{ position: 'absolute', bottom: 4, right: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowCircleRightIcon sx={{ color: '#e2e2e2', width: 20, height: 20 }} />
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      ))}
      </Box>
    </Box>
  )
}

export default Systems