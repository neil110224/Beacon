import { Box, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material'
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import React from 'react'

const Systems = () => {
  const scrollContainerRef = React.useRef(null);
  const scrollAnimationRef = React.useRef(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedSystem, setSelectedSystem] = React.useState(null);
  const [systemName, setSystemName] = React.useState('');
  const [systemDescription, setSystemDescription] = React.useState('');

  const handleSystemClick = (systemId, systemTitle) => {
    setSelectedSystem(systemId);
    setSystemName(systemTitle);
    setSystemDescription('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSystem(null);
    setSystemName('');
    setSystemDescription('');
  };

  const handleSaveSystem = () => {
    // Add your save logic here
    console.log('Save system:', { systemName, systemDescription });
    handleCloseDialog();
  };

  const handleWheel = (e) => {
    if (scrollContainerRef.current) {
      e.preventDefault();

      // Cancel previous animation if still running
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }

      const container = scrollContainerRef.current;
      const currentScroll = container.scrollLeft;
      const targetScroll = currentScroll + (e.deltaY > 0 ? 300 : -300);
      const duration = 400; // Fast and snappy response
      const startTime = performance.now();

      const easeInOutQuad = (t) => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      };

      const scroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeInOutQuad(progress);

        container.scrollLeft = currentScroll + (targetScroll - currentScroll) * easeProgress;

        if (progress < 1) {
          scrollAnimationRef.current = requestAnimationFrame(scroll);
        } else {
          scrollAnimationRef.current = null;
        }
      };

      scrollAnimationRef.current = requestAnimationFrame(scroll);
    }
  };

  return (
    <Box sx={{display:'flex', flexDirection:'column'}} >

<Box sx={{display:'flex', flexDirection:'column',borderBottom: '1px solid #1a1a2e ', gap:2}}>

<Typography variant='h5' sx={{ml:2,mt:2, textDecoration:'underline'}}>
  OMEGA
</Typography>

<Box ref={scrollContainerRef} onWheel={handleWheel} sx={{display:'flex', gap:2, justifyContent:'flex-start', margin:'0 20px 20px 15px', overflowX:'auto', maxWidth:'calc(100% - 40px)', flexWrap:'nowrap', scrollbarWidth: 'none', msOverflowStyle: 'none', '&::-webkit-scrollbar': {display: 'none'}}}>
<Paper onClick={() => handleSystemClick(1, 'System 1')} sx={{bgcolor:'#1a1a2e', width:'200px', height:'100px', display:'flex', flexDirection:'column', justifyContent:'space-between', p:1, flexShrink: 0, cursor: 'pointer', '&:hover': {opacity: 0.8}}}>
  <Typography variant='h6' sx={{ml:0, mt:0, color:'#f4f4f4'}}>
  System 1
    </Typography>
    <Box sx={{display:'flex', justifyContent:'flex-end', alignItems:'flex-end'}}>
      <ArrowCircleRightIcon sx={{color: '#e2e2e2', width: 24, height: 24}}/>
    </Box>
</Paper>

<Paper onClick={() => handleSystemClick(2, 'System 2')} sx={{bgcolor:'#1a1a2e ', width:'200px', height:'100px', display:'flex', flexDirection:'column', justifyContent:'space-between', p:1, flexShrink: 0, cursor: 'pointer', '&:hover': {opacity: 0.8}}}>
  <Typography variant='h6' sx={{ml:0, mt:0, color:'#f4f4f4'}}>
  System 2
    </Typography>
    <Box sx={{display:'flex', justifyContent:'flex-end', alignItems:'flex-end'}}>
      <ArrowCircleRightIcon sx={{color: '#e2e2e2', width: 24, height: 24}}/>
    </Box>
</Paper>

<Paper onClick={() => handleSystemClick(3, 'System 3')} sx={{bgcolor:'#1a1a2e ', width:'200px', height:'100px', display:'flex', flexDirection:'column', justifyContent:'space-between', p:1, flexShrink: 0, cursor: 'pointer', '&:hover': {opacity: 0.8}}}>
  <Typography variant='h6' sx={{ml:0, mt:0, color:'#f4f4f4'}}>
  System 3
    </Typography>
    <Box sx={{display:'flex', justifyContent:'flex-end', alignItems:'flex-end'}}>
      <ArrowCircleRightIcon sx={{color: '#e2e2e2', width: 24, height: 24}}/>
    </Box>
</Paper>

<Paper onClick={() => handleSystemClick(4, 'System 4')} sx={{bgcolor:'#1a1a2e ', width:'200px', height:'100px', display:'flex', flexDirection:'column', justifyContent:'space-between', p:1, flexShrink: 0, cursor: 'pointer', '&:hover': {opacity: 0.8}}}>
  <Typography variant='h6' sx={{ml:0, mt:0, color:'#f4f4f4'}}>
  System 4
    </Typography>
    <Box sx={{display:'flex', justifyContent:'flex-end', alignItems:'flex-end'}}>
      <ArrowCircleRightIcon sx={{color: '#e2e2e2', width: 24, height: 24}}/>
    </Box>
</Paper>

<Paper onClick={() => handleSystemClick(5, 'System 5')} sx={{bgcolor:'#1a1a2e ', width:'200px', height:'100px', display:'flex', flexDirection:'column', justifyContent:'space-between', p:1, flexShrink: 0, cursor: 'pointer', '&:hover': {opacity: 0.8}}}>
  <Typography variant='h6' sx={{ml:0, mt:0, color:'#f4f4f4'}}>
  System 5
    </Typography>
    <Box sx={{display:'flex', justifyContent:'flex-end', alignItems:'flex-end'}}>
      <ArrowCircleRightIcon sx={{color: '#e2e2e2', width: 24, height: 24}}/>
    </Box>
</Paper>

<Paper onClick={() => handleSystemClick(6, 'System 6')} sx={{bgcolor:'#1a1a2e ', width:'200px', height:'100px', display:'flex', flexDirection:'column', justifyContent:'space-between', p:1, flexShrink: 0, cursor: 'pointer', '&:hover': {opacity: 0.8}}}>
  <Typography variant='h6' sx={{ml:0, mt:0, color:'#f4f4f4'}}>
  System 6
    </Typography>
    <Box sx={{display:'flex', justifyContent:'flex-end', alignItems:'flex-end'}}>
      <ArrowCircleRightIcon sx={{color: '#e2e2e2', width: 24, height: 24}}/>
    </Box>
</Paper>


</Box>
</Box>

<Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>System Details - {systemName}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="System Name"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Description"
              value={systemDescription}
              onChange={(e) => setSystemDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveSystem} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default Systems