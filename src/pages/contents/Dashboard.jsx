import { Avatar, AvatarGroup, Box, Button, IconButton, Paper, TextField, Typography } from '@mui/material';
import React, { useState } from 'react'
import WebIcon from '@mui/icons-material/Web';
import TaskIcon from '@mui/icons-material/Task';
import PendingIcon from '@mui/icons-material/Pending';
import ConstructionIcon from '@mui/icons-material/Construction';
import PublicIcon from '@mui/icons-material/Public';


const Dashboard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState('note or the todo list');

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // You can add logic here to save to backend/database
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Optionally reset to original text
  };

  const topbox = {
    height: '80px', 
    width: '180px',  
    flexDirection:'column',
    fontSize: '1.2rem', 
    color:'#161616',
    borderRadius: 1,
  };

  const noteBox = {
  display:'flex',
          alignItems:'center',
          gap:1 , 
          fontSize:'0.8rem',
          color:'#1f1f1f', 
          fontWeight:'400',
          ml:1,
          mt:1,
  };
  return (
   <Box sx={{
    display:'flex',
    alignItems:'flex-start',
    justifyContent:'space-evenly',
    
    margin:2,
    gap:1,
    }}>

      {/* This is for the total projects */}
      <Paper sx={{...topbox, bgcolor:'#5b5eeb'}}>
        
        <Box sx={{...noteBox}}>
          <WebIcon/>
          Total Projects
        </Box>
                {/* This is number of the project */}
        <Box sx={{display:'flex', justifyContent:'flex-end', mr:2,}}>
          <h1 style={{fontSize:'1.3rem', color:'#161616'}}>100</h1>
          </Box>

      </Paper>

      {/* This is for the completed projects */}

      <Paper sx={{...topbox, bgcolor:'#f4f4f4', }}>
        
        <Box sx={{...noteBox, color:'#1f1f1f'}}>
          <TaskIcon/>
          Completed Projects  
        </Box>
                {/* This is number of the project */}
        <Box sx={{display:'flex', justifyContent:'flex-end', mr:2,}}>
          <h1 style={{fontSize:'1.3rem', color:'#161616'}}>100</h1>
          </Box>

      </Paper>
      
      {/* This is for the pending projects */}
      <Paper sx={{...topbox, bgcolor:'#f4f4f4', }}>
        
        <Box sx={{...noteBox, color:'#1f1f1f'}}>
          <PendingIcon/>
          Pending Projects  
        </Box>
                {/* This is number of the project */}
        <Box sx={{display:'flex', justifyContent:'flex-end', mr:2,}}>
          <h1 style={{fontSize:'1.3rem', color:'#161616'}}>100</h1>
          </Box>

      </Paper>
        {/* This is for the under construction projects */}
      <Paper sx={{...topbox, bgcolor:'#f4f4f4', }}>
        
        <Box sx={{...noteBox, color:'#1f1f1f'}}>
          <ConstructionIcon/>
          Under Construction Projects  
        </Box>
                {/* This is number of the project */}
        <Box sx={{display:'flex', justifyContent:'flex-end', mr:2,}}>
          <h1 style={{fontSize:'1.3rem', color:'#161616'}}>100</h1>
          </Box>

      </Paper>

      {/* This is for the currently Running projects */}
      <Paper sx={{...topbox, bgcolor:'#f4f4f4', }}>
        
        <Box sx={{...noteBox, color:'#1f1f1f'}}>
          <PublicIcon/>
          Currently Running Projects  
        </Box>
                {/* This is number of the project */}
        <Box sx={{display:'flex', justifyContent:'flex-end', mr:2,}}>
          <h1 style={{fontSize:'1.3rem', color:'#161616'}}>100</h1>
          </Box>

      </Paper>

      </Box>
    
  )
}

export default Dashboard;