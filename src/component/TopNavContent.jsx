import { Box, TextField, InputAdornment, Typography } from '@mui/material'
import React from 'react'
import SearchIcon from '@mui/icons-material/Search';
import ArchiveIcon from '@mui/icons-material/Archive';

const TopNavContent = () => {
  return (
    <Box sx={{
      display:'flex',
      gap:2,
      bgcolor:'#9c9999',
      height:'40px',
      alignItems:'center',
      justifyContent:'space-between',
      padding: 2,
    }}>

      <Typography sx={{color:'white', fontSize:'1rem'}}>ACTIVE PAGE</Typography>
      
      <Box sx={{display:'flex', alignItems:'center', gap:2}}>
        <ArchiveIcon sx={{color:'white', cursor:'pointer'}} />
        <TextField
          placeholder="Search"
          sx={{
            backgroundColor: 'white',
            borderRadius: 1,
            width: '200px',
            '& .MuiOutlinedInput-root': {
              height: '35px',
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  )
}

export default TopNavContent