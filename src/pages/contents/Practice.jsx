import { Box } from '@mui/material'
import React from 'react'

const Practice = () => {
  return (
    <Box sx={{ bgcolor: '#aaa7a7', height: '140px', display: 'flex', gap: 2, p: 2 }}>

      {/* LEFT SIDE */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '20%' }}>
        
        {/* SYSTEM NAME */}
        <Box
          sx={{
            bgcolor: '#6d1313',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '8px',
            color: 'white',
            height: '50%'
          }}
        >
          <h4 style={{ margin: 0 }}>System Name</h4>
        </Box>

        {/* ON PROGRESS */}
        <Box
          sx={{
            bgcolor: '#032992',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '8px',
            color: 'white',
            height: '50%'
          }}
        >
          On Progress
        </Box>

      </Box>

      {/* RIGHT SIDE 4 BOXES */}
      <Box
        sx={{
          width: '40%',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1
        }}
      >
        <Box sx={{ bgcolor: 'white', borderRadius: '6px', textAlign: 'center', p: 1 }}>
          <div>0</div>
          <small>Total</small>
        </Box>

        <Box sx={{ bgcolor: 'white', borderRadius: '6px', textAlign: 'center', p: 1 }}>
          <div>0</div>
          <small>Done</small>
        </Box>

        <Box sx={{ bgcolor: 'white', borderRadius: '6px', textAlign: 'center', p: 1 }}>
          <div>0</div>
          <small>Pending</small>
        </Box>

        <Box sx={{ bgcolor: 'white', borderRadius: '6px', textAlign: 'center', p: 1 }}>
          <div>0</div>
          <small>Hold</small>
        </Box>
      </Box>

    </Box>
  )
}

export default Practice