import { Avatar, AvatarGroup, Box, IconButton, Paper, Typography, Dialog, DialogTitle, DialogContent } from '@mui/material'
import React, { useRef, useEffect, useState } from 'react'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import HandymanIcon from '@mui/icons-material/Handyman';
import PanToolIcon from '@mui/icons-material/PanTool';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import EditIcon from '@mui/icons-material/Edit';

const teamtitle = {p: 1, bgcolor: '#611c1c', height: '10vh', width: '200px', minWidth: '200px', borderRadius: 1, color: 'white',  display: 'flex',flexDirection: 'column',justifyContent: 'flex-start',flexWrap: 'wrap',}
const teamname = {fontSize: '1rem', fontWeight: '100',}
const teamavatar = {display: 'flex',justifyContent: 'space-between',alignItems: 'flex-end',mt: 2,}

const Dashboard = () => {
  const scrollContainerRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                         currentDate.getFullYear() === today.getFullYear();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

  const handleBoxClick = (e) => {
    // Check if the click is not on the edit button or inside the white box
    if (!e.target.closest('.edit-area')) {
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <>
    <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'flex-start' }}>
      {/* Left column - Teams and 3 boxes below */}
      <Box sx={{ width: '75%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Teams scrollable container */}
        <Box 
          ref={scrollContainerRef}
          sx={{
            bgcolor:'#b3b3b3',
            p: 1,
            borderRadius: 1,
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          <Paper sx={teamtitle}>
            <Box>
              <Typography variant="h1" sx={teamname}>
                OMEGA
              </Typography>
              <Box sx={teamavatar}>
                <AvatarGroup max={4} sx={{"& .MuiAvatar-root": {width: 23,height: 23,fontSize: 11,mb:1},}}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                  <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
                  <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
                  <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
                  <Avatar alt="Trevor Henderson" src="/static/images/avatar/5.jpg" />
                </AvatarGroup>
                <IconButton>
                  <ArrowForwardIcon sx={{ color: '#f4f4f4' }} />
                </IconButton>
              </Box>
            </Box>
          </Paper>
          <Paper sx={teamtitle}>
            <Box>
              <Typography variant="h1" sx={teamname}>
                OMEGA
              </Typography>
              <Box sx={teamavatar}>
                <AvatarGroup max={4} sx={{"& .MuiAvatar-root": {width: 23,height: 23,fontSize: 11,mb:1},}}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                  <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
                  <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
                  <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
                  <Avatar alt="Travis Henderson" src="/static/images/avatar/5.jpg" />
                </AvatarGroup>
                <IconButton>
                  <ArrowForwardIcon sx={{ color: '#f4f4f4' }} />
                </IconButton>
              </Box>
            </Box>
          </Paper>
          <Paper sx={teamtitle}>
            <Box>
              <Typography variant="h1" sx={teamname}>
                OMEGA
              </Typography>
              <Box sx={teamavatar}>
                <AvatarGroup max={4} sx={{"& .MuiAvatar-root": {width: 23,height: 23,fontSize: 11,mb:1},}}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                  <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
                  <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
                  <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
                  <Avatar alt="Trevor Henderson" src="/static/images/avatar/5.jpg" />
                </AvatarGroup>
                <IconButton>
                  <ArrowForwardIcon sx={{ color: '#f4f4f4' }} />
                </IconButton>
              </Box>
            </Box>
          </Paper>
          <Paper sx={teamtitle}>
            <Box>
              <Typography variant="h1" sx={teamname}>
                OMEGA
              </Typography>
              <Box sx={teamavatar}>
                <AvatarGroup max={4} sx={{"& .MuiAvatar-root": {width: 23,height: 23,fontSize: 11,mb:1},}}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                  <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
                  <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
                  <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
                  <Avatar alt="Trevor Henderson" src="/static/images/avatar/5.jpg" />
                </AvatarGroup>
                <IconButton>
                  <ArrowForwardIcon sx={{ color: '#f4f4f4' }} />
                </IconButton>
              </Box>
            </Box>
          </Paper>
          <Paper sx={teamtitle}>
            <Box>
              <Typography variant="h1" sx={teamname}>
                OMEGA
              </Typography>
              <Box sx={teamavatar}>
                <AvatarGroup max={4} sx={{"& .MuiAvatar-root": {width: 23,height: 23,fontSize: 11,mb:1},}}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                  <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
                  <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
                  <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
                  <Avatar alt="Trevor Henderson" src="/static/images/avatar/5.jpg" />
                </AvatarGroup>
                <IconButton>
                  <ArrowForwardIcon sx={{ color: '#f4f4f4' }} />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* 2 boxes below teams - 2 on top */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, maxWidth:'100%' }}>
          {/* First box - Systems */}
          <Box 
            sx={{ 
              bgcolor: '#4a5568', 
              height: '150px', 
              borderRadius: 1,
              color: 'white',
              p: 2,
              width: '370px',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <Typography variant='h6' sx={{ mb: 1 }}>
              Systems
            </Typography>
            
            {/* Scrollable container for system items */}
            <Box 
              onWheel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.scrollTop += e.deltaY;
              }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                flex: 1
              }}
            >
              {/* System Item 1 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                p: 1,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 1
              }}>
                <Avatar alt="Vladimir" src="/static/images/avatar/1.jpg" sx={{ width: 35, height: 35 }} />
                <Typography>Vladimir</Typography>
              </Box>

              {/* System Item 2 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                p: 1,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 1
              }}>
                <Avatar alt="Anna" src="/static/images/avatar/2.jpg" sx={{ width: 35, height: 35 }} />
                <Typography>Anna</Typography>
              </Box>

              {/* System Item 3 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                p: 1,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 1
              }}>
                <Avatar alt="John" src="/static/images/avatar/3.jpg" sx={{ width: 35, height: 35 }} />
                <Typography>John</Typography>
              </Box>

              {/* System Item 4 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                p: 1,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 1
              }}>
                <Avatar alt="Sarah" src="/static/images/avatar/4.jpg" sx={{ width: 35, height: 35 }} />
                <Typography>Sarah</Typography>
              </Box>
            </Box>
          </Box>

          {/* Second box - Team members */}
          <Box 
            sx={{ 
              bgcolor: '#2d3748', 
              height: '150px', 
              borderRadius: 1,
              color: 'white',
              p: 2,
              width: '370px',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <Typography variant='h6' sx={{ mb: 1 }}>
              Team members
            </Typography>
            
            {/* Scrollable container for system items */}
            <Box 
              onWheel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.scrollTop += e.deltaY;
              }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                flex: 1
              }}
            >
              {/* System Item 1 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                p: 1,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 1
              }}>
                <Avatar alt="Vladimir" src="/static/images/avatar/1.jpg" sx={{ width: 35, height: 35 }} />
                <Typography>Vladimir</Typography>
              </Box>

              {/* System Item 2 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                p: 1,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 1
              }}>
                <Avatar alt="Anna" src="/static/images/avatar/2.jpg" sx={{ width: 35, height: 35 }} />
                <Typography>Anna</Typography>
              </Box>

              {/* System Item 3 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                p: 1,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 1
              }}>
                <Avatar alt="John" src="/static/images/avatar/3.jpg" sx={{ width: 35, height: 35 }} />
                <Typography>John</Typography>
              </Box>

              {/* System Item 4 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                p: 1,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 1
              }}>
                <Avatar alt="Sarah" src="/static/images/avatar/4.jpg" sx={{ width: 35, height: 35 }} />
                <Typography>Sarah</Typography>
              </Box>
            </Box>
          </Box>

          {/* Project Management Box with Dialog */}
          <Box sx={{bgcolor:'#b3afaf', width:'100%', height:'500px', borderRadius:1, p:3}}>
            <Box 
              sx={{bgcolor:'#383737', height:'350px', width:'250px', borderRadius:1, p:1, cursor: 'pointer' }} 
              onClick={handleBoxClick}
            >
              <Typography variant='h5' sx={{display:'flex', justifyContent:'center', fontSize: 20,}}>
                Project management
              </Typography>
              <Box 
                className="edit-area"
                sx={{bgcolor:'#f4f4f4', height:"240px", borderRadius:1, p:1, position:'relative'}}
                onClick={(e) => e.stopPropagation()}
              >
                <IconButton sx={{position:'absolute', top:0, right:0}}>
                  <EditIcon/>
                </IconButton>
                sad
              </Box>
              <Box sx={{display:'flex', justifyContent:'flex-start', mt:2 }}>
                <AvatarGroup max={4} sx={{"& .MuiAvatar-root": {width: 33,height: 33,fontSize: 11,},}}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                  <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
                  <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
                  <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
                  <Avatar alt="Trevor Henderson" src="/static/images/avatar/5.jpg" />
                </AvatarGroup>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right column - statistics, calendar, and notes */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {/* Statistics box */}
        <Box sx={{ bgcolor:'#969191', color: 'white', borderRadius:1, display:'flex', flexDirection:'column',  height:'200px', justifyContent:'flex-start', p:1 }}>
          <Typography variant='h5' sx={{fontSize:20, fontWeight:'100', ml:1, mb:1 }}>
          Projects
          </Typography>
          <Box sx={{display:'flex', flexWrap:'wrap', gap:1, p: '0 0 10px 10px'}}>
            <Box sx={{bgcolor:'#f4f4f4', width:'90px', height: '60px', borderRadius:1, color:'#000000',p:0.5,  display:'flex',  flexDirection:'column', alignItems:'center'}}>
              <Typography sx={{ fontSize:10, fontWeight:'800'}}>
              Completed Project
              </Typography>
              <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                <CheckCircleIcon sx={{ fontSize:20 }} />
                <Typography variant='h5' sx={{ fontSize:20 }}>
                  23
                </Typography>
              </Box>
            </Box>
            <Box sx={{bgcolor:'#f4f4f4', width:'90px', height: '60px', borderRadius:1, color:'#000000' ,p:0.5,  display:'flex', flexDirection:'column', alignItems:'center'}}>
             <Typography sx={{ fontSize:10, fontWeight:'800'}}>
              Pending
              </Typography>
              <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                <PendingActionsIcon sx={{ fontSize:20 }}/>
                <Typography variant='h5' sx={{ fontSize:20 }}>
                  5
                </Typography>
              </Box>
            </Box>
            <Box sx={{bgcolor:'#f4f4f4', width:'90px', height: '60px', borderRadius:1, color:'#000000' ,p:0.5,  display:'flex', flexDirection:'column', alignItems:'center'}}>
              <Typography sx={{ fontSize:10, fontWeight:'800'}}>
              Ongoing
              </Typography>
              <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                <HandymanIcon sx={{ fontSize:20 }}/>
                <Typography variant='h5' sx={{ fontSize:20 }}>
                  7
                </Typography>
              </Box>
            </Box>
            <Box sx={{bgcolor:'#f4f4f4', width:'90px', height: '60px', borderRadius:1, color:'#000000',p:0.5, display:'flex', flexDirection:'column', alignItems:'center' }}>
              <Typography sx={{ fontSize:10, fontWeight:'800'}}>
              On hold
              </Typography>
              <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                <PanToolIcon sx={{ fontSize:20 }}/>
                <Typography variant='h5' sx={{ fontSize:20 }}>
                  1
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Calendar box */}
        <Box sx={{ 
          bgcolor:'#1a202c', 
          color: 'white', 
          borderRadius:1, 
          height:'300px', 
          p:2,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Calendar Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={previousMonth} sx={{ color: 'white' }}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant='h6'>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Typography>
            <IconButton onClick={nextMonth} sx={{ color: 'white' }}>
              <ChevronRightIcon />
            </IconButton>
          </Box>

          {/* Calendar Grid */}
          <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
            {/* Day headers */}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Box key={index} sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                color: 'rgba(255,255,255,0.7)'
              }}>
                {day}
              </Box>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <Box key={`empty-${index}`} />
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const isToday = isCurrentMonth && day === today.getDate();
              const isSelected = selectedDate === day;
              
              return (
                <Box 
                  key={day} 
                  onClick={() => handleDateClick(day)}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    bgcolor: isSelected ? 'rgba(96, 165, 250, 0.5)' : isToday ? 'rgba(255,255,255,0.2)' : 'transparent',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isSelected ? 'rgba(96, 165, 250, 0.7)' : 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  {day}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Notes section - shows when date is selected */}
        {selectedDate && (
          <Box sx={{ 
            bgcolor:'#2d3748', 
            color: 'white', 
            borderRadius:1, 
            height:'200px', 
            p:2,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <NoteAltIcon sx={{ fontSize: 24 }} />
              <Typography variant='h6'>
                Notes for {monthNames[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
              </Typography>
            </Box>
            
            <Box sx={{ 
              flex: 1, 
              bgcolor: 'rgba(255,255,255,0.1)', 
              borderRadius: 1, 
              p: 2,
              overflowY: 'auto'
            }}>
              <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                No notes for this date yet. Click here to add notes...
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>

    {/* Dialog */}
    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <DialogTitle>Category</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          This is the category
        </Box>
      </DialogContent>
    </Dialog>
    </>
  )
}

export default Dashboard