import { Avatar, AvatarGroup, Box, Button, IconButton, Paper, TextField } from '@mui/material';
import React, { useState } from 'react'



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
    width: '150px', 
    display:'flex', 
    alignItems:'center', 
    justifyContent:'center',
    padding:2, 
    fontSize: '2.2rem', 
    color:'#fff'
  };
  return (
   <Box sx={{
    display:'flex',
    alignItems:'flex-start',
    justifyContent:'space-evenly',
    flexWrap: 'wrap',
    margin:2,
    gap:5,
    }}>

      <Paper sx={{...topbox, bgcolor:'#b90000'}}>
        Pending 
      </Paper>
      <Paper sx={{...topbox, bgcolor:'#0502a0'}}>
        Completed 
      </Paper>
      <Paper sx={{...topbox, bgcolor:'#52b104'}}>
        Holding 
      </Paper>
      <Paper sx={{...topbox, bgcolor:'#9d05e4'}}>
        Percentage 
      </Paper>
      <Paper sx={{...topbox, bgcolor:'#9d05e4'}}>
        Total 
      </Paper>

      </Box>
    
  )
}

export default Dashboard;