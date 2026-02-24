import React, { useState } from 'react';
import Confirmation from './reuseable/Confirmation';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Collapse, IconButton, Avatar, Typography, Menu, MenuItem, Tooltip, Popover } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import mis from "../assets/mis.png";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const Sidebar = ({ user, onChangeProfile, isSidebarLocked = false, onToggleSidebarLock = () => {}, isSidebarCollapsed = false }) => {
  const location = useLocation();
  const [openMasterlist, setOpenMasterlist] = useState(
    location.pathname.startsWith('/role') || 
    location.pathname.startsWith('/users') || 
    location.pathname.startsWith('/team') || 
    location.pathname.startsWith('/charging') ||
    location.pathname.startsWith('/category')
  );
  const [isHovered, setIsHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [masterlistMenuAnchor, setMasterlistMenuAnchor] = useState(null);
  
  const open = Boolean(anchorEl);
  const firstName = user?.first_name;

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeProfile = () => {
    if (onChangeProfile) {
      onChangeProfile();
    }
    handleClose();
  };

  const handleMasterlistToggle = () => {
    setOpenMasterlist(!openMasterlist);
  };

  const handleMasterlistMenuClick = (event) => {
    setMasterlistMenuAnchor(event.currentTarget);
  };

  const handleMasterlistMenuClose = () => {
    setMasterlistMenuAnchor(null);
  };

  // Determine actual collapsed state based on lock and hover
  const isCollapsed = isSidebarCollapsed ? isSidebarLocked : (isSidebarCollapsed && !isHovered);

  const handleSidebarMouseEnter = () => {
    setIsHovered(true);
  };

  const handleSidebarMouseLeave = () => {
    setIsHovered(false);
  };




  return (
    <Box 
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
      sx={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        height: '100vh', 
        width: isCollapsed ? '80px' : '200px',
        minWidth: isCollapsed ? '80px' : '200px',
        maxWidth: isCollapsed ? '80px' : '200px',
        color: '#f4f4f4',
        overflow: 'hidden',
        transition: 'width 1s ease, min-width 1s ease, max-width 1s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header with Logo and Title */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          px: isCollapsed ? 1 : { xs: 1, sm: 2 },
          py: 0,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          height: { xs: '70px', sm: '80px' },
          minHeight: { xs: '70px', sm: '80px' },
          maxHeight: { xs: '70px', sm: '80px' },
          gap: 1,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          }
        }}
      >
        {!isCollapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, justifyContent: 'flex-start' }}>
            <Box
              sx={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              <Link to="/dashboard">
              <img 
                src={mis} 
                alt="MIS Logo" 
                style={{ 
                  width: '28px', 
                  height: '28px',
                  objectFit: 'contain' 
                }} 
              />
              </Link>
            </Box>
            <Box
              component="h3"
              sx={{
                margin: 0,
                fontSize: '1.3rem',
                fontWeight: 600,
                letterSpacing: '0.5px',
                fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                color: '#ffffff',
              }}
            >
              Beacon
            </Box>
          </Box>
        )}
        
        {/* Arrow button - show when not collapsed (close button) */}
        {!isCollapsed && (
          <Tooltip title={isSidebarLocked ? "Unlock sidebar" : "Lock sidebar"}> 
            <IconButton
              onClick={onToggleSidebarLock}
              sx={{ 
                color: '#ffffff',
               
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                },
                width: 36,
                height: 36,
                flexShrink: 0,
              }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: '0.9rem', transition: 'transform 0.3s ease' }} />
            </IconButton>
          </Tooltip>
        )}

        {/* Arrow button - show when collapsed (open button) */}
        {isCollapsed && (
          <Tooltip title="Expand sidebar">
            <IconButton
              onClick={onToggleSidebarLock}
              sx={{ 
                color: '#ffffff',
                
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                },
                width: 36,
                height: 36,
                flexShrink: 0,
              }}
            >
              <ArrowForwardIosIcon sx={{ fontSize: '0.9rem', transition: 'transform 1s ease' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <List 
        component="nav" 
        sx={{ 
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: isCollapsed ? 0.5 : 1,
          py: 1,
          // Hide scrollbar for Chrome, Safari and Opera
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          // Hide scrollbar for IE, Edge and Firefox
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {/* Dashboard */}
        <NavLink
          to="/Dashboard"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {({ isActive }) => (
            <Tooltip title={isCollapsed ? "Dashboard" : ""} placement="right">
              <ListItemButton
                sx={{
                  background: isActive 
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)'
                    : 'transparent',
                  color: '#ffffff',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  borderRadius: isCollapsed ? '8px' : '12px',
                  mb: 0.5,
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  backdropFilter: isActive ? 'blur(10px)' : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 100%)'
                      : 'rgba(255, 255, 255, 0.08)',
                    transform: 'translateX(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: '#ffffff', 
                    minWidth: isCollapsed ? 'auto' : '48px',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <HomeIcon sx={{ fontSize: isCollapsed ? '1.5rem' : '1.3rem' }} />
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText 
                    primary="Dashboard" 
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: isActive ? 600 : 500,
                      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          )}
        </NavLink>

        {/* Masterlist */}
        <Tooltip title={isCollapsed ? "Masterlist" : ""} placement="right">
          <ListItemButton
            onClick={isCollapsed ? handleMasterlistMenuClick : handleMasterlistToggle}
            sx={{
              background: openMasterlist && !isCollapsed
                ? 'rgba(255, 255, 255, 0.08)'
                : 'transparent',
              color: '#ffffff',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              borderRadius: isCollapsed ? '8px' : '12px',
              mb: 0.5,
              border: '1px solid transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                transform: isCollapsed ? 'none' : 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: '#ffffff',
                minWidth: isCollapsed ? 'auto' : '48px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <LibraryBooksIcon sx={{ fontSize: isCollapsed ? '1.5rem' : '1.3rem' }} />
            </ListItemIcon>
            {!isCollapsed && (
              <>
                <ListItemText 
                  primary="Masterlist" 
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                  }}
                />
                {openMasterlist ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItemButton>
        </Tooltip>

        {!isCollapsed && (
          <>
            {/* Masterlist Children */}
            
            <Collapse in={openMasterlist} timeout={1000} unmountOnExit>
              <List component="div" disablePadding>
                {/* Role */}
                <NavLink
                  to="/role"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {({ isActive }) => (
                    <ListItemButton
                      sx={{
                        pl: 4,
                        bgcolor: isActive ? '#2e244b' : 'transparent',
                        color: isActive ? '#fff' : '#f4f4f4',
                        '&:hover': {
                          bgcolor: isActive ? '#2e244b' : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? '#fff' : '#f4f4f4' }}>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText primary="Role" />
                    </ListItemButton>
                  )}
                </NavLink>

                {/* User */}
                <NavLink
                  to="/users"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {({ isActive }) => (
                    <ListItemButton
                      sx={{
                        pl: 4,
                        bgcolor: isActive ? '#2e244b' : 'transparent',
                        color: isActive ? '#fff' : '#f4f4f4',
                        '&:hover': {
                          bgcolor: isActive ? '#2e244b' : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? '#fff' : '#f4f4f4' }}>
                        <PeopleIcon />
                      </ListItemIcon>
                      <ListItemText primary="Users" />
                    </ListItemButton>
                  )}
                </NavLink>

                {/* Team */}
                <NavLink
                  to="/team"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {({ isActive }) => (
                    <ListItemButton
                      sx={{
                        pl: 4,
                        bgcolor: isActive ? '#2e244b' : 'transparent',
                        color: isActive ? '#fff' : '#f4f4f4',
                        '&:hover': {
                          bgcolor: isActive ? '#2e244b' : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? '#fff' : '#f4f4f4' }}>
                        <GroupsIcon />
                      </ListItemIcon>
                      <ListItemText primary="Team" />
                    </ListItemButton>
                  )}
                </NavLink>

                {/* Charging */}
                <NavLink
                  to="/charging"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {({ isActive }) => (
                    <ListItemButton
                      sx={{
                        pl: 4,
                        bgcolor: isActive ? '#2e244b' : 'transparent',
                        color: isActive ? '#fff' : '#f4f4f4',
                        '&:hover': {
                          bgcolor: isActive ? '#2e244b' : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? '#fff' : '#f4f4f4' }}>
                        <LocationCityIcon />
                      </ListItemIcon>
                      <ListItemText primary="Charging" />
                    </ListItemButton>
                  )}
                </NavLink>

                {/* Category */}
                <NavLink
                  to="/category"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {({ isActive }) => (
                    <ListItemButton
                      sx={{
                        pl: 4,
                        bgcolor: isActive ? '#2e244b' : 'transparent',
                        color: isActive ? '#fff' : '#f4f4f4',
                        '&:hover': {
                          bgcolor: isActive ? '#2e244b' : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? '#fff' : '#f4f4f4' }}>
                        <CategoryIcon />
                      </ListItemIcon>
                      <ListItemText primary="Category" />
                    </ListItemButton>
                  )}
                </NavLink>
              </List>
            </Collapse>
          </>
        )}

        {/* Collapsed Masterlist Menu */}
        {isCollapsed && (
          <Menu
            anchorEl={masterlistMenuAnchor}
            open={Boolean(masterlistMenuAnchor)}
            onClose={handleMasterlistMenuClose}
            PaperProps={{
              elevation: 8,
              sx: {
                bgcolor: '#1a1a2e',
                color: '#f4f4f4',
                borderRadius: '8px',
                mt: 1,
                minWidth: '160px',
                backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              }
            }}
          >
            <NavLink
              to="/role"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {({ isActive }) => (
                <MenuItem 
                  onClick={handleMasterlistMenuClose}
                  sx={{
                    bgcolor: isActive ? '#2e244b' : 'transparent',
                    color: isActive ? '#fff' : '#f4f4f4',
                    '&:hover': {
                      bgcolor: isActive ? '#2e244b' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#fff' : '#f4f4f4', minWidth: '36px' }}>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Role
                </MenuItem>
              )}
            </NavLink>

            <NavLink
              to="/users"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {({ isActive }) => (
                <MenuItem 
                  onClick={handleMasterlistMenuClose}
                  sx={{
                    bgcolor: isActive ? '#2e244b' : 'transparent',
                    color: isActive ? '#fff' : '#f4f4f4',
                    '&:hover': {
                      bgcolor: isActive ? '#2e244b' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#fff' : '#f4f4f4', minWidth: '36px' }}>
                    <PeopleIcon fontSize="small" />
                  </ListItemIcon>
                  Users
                </MenuItem>
              )}
            </NavLink>

            <NavLink
              to="/team"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {({ isActive }) => (
                <MenuItem 
                  onClick={handleMasterlistMenuClose}
                  sx={{
                    bgcolor: isActive ? '#2e244b' : 'transparent',
                    color: isActive ? '#fff' : '#f4f4f4',
                    '&:hover': {
                      bgcolor: isActive ? '#2e244b' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#fff' : '#f4f4f4', minWidth: '36px' }}>
                    <GroupsIcon fontSize="small" />
                  </ListItemIcon>
                  Team
                </MenuItem>
              )}
            </NavLink>

            <NavLink
              to="/charging"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {({ isActive }) => (
                <MenuItem 
                  onClick={handleMasterlistMenuClose}
                  sx={{
                    bgcolor: isActive ? '#2e244b' : 'transparent',
                    color: isActive ? '#fff' : '#f4f4f4',
                    '&:hover': {
                      bgcolor: isActive ? '#2e244b' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#fff' : '#f4f4f4', minWidth: '36px' }}>
                    <LocationCityIcon fontSize="small" />
                  </ListItemIcon>
                  Charging
                </MenuItem>
              )}
            </NavLink>

            <NavLink
              to="/category"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {({ isActive }) => (
                <MenuItem 
                  onClick={handleMasterlistMenuClose}
                  sx={{
                    bgcolor: isActive ? '#2e244b' : 'transparent',
                    color: isActive ? '#fff' : '#f4f4f4',
                    '&:hover': {
                      bgcolor: isActive ? '#2e244b' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#fff' : '#f4f4f4', minWidth: '36px' }}>
                    <CategoryIcon fontSize="small" />
                  </ListItemIcon>
                  Category
                </MenuItem>
              )}
            </NavLink>
          </Menu>
        )}

        {/* Systems */}
        <NavLink
          to="/Systems"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {({ isActive }) => (
            <Tooltip title={isCollapsed ? "Systems" : ""} placement="right">
              <ListItemButton
                sx={{
                  background: isActive 
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)'
                    : 'transparent',
                  color: '#ffffff',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  borderRadius: isCollapsed ? '8px' : '12px',
                  mb: 0.5,
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  backdropFilter: isActive ? 'blur(10px)' : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 100%)'
                      : 'rgba(255, 255, 255, 0.08)',
                    transform: 'translateX(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: '#ffffff', 
                    minWidth: isCollapsed ? 'auto' : '48px',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <SettingsSystemDaydreamIcon sx={{ fontSize: isCollapsed ? '1.5rem' : '1.3rem' }} />
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText 
                    primary="Systems" 
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: isActive ? 600 : 500,
                      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          )}
        </NavLink>
      </List>

      {/* Spacer to push footer to bottom */}
      <Box sx={{ flexGrow: 1 }} />

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleChangeProfile}>
          <PersonIcon sx={{ mr: 1 }} />
          Change Profile
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Sidebar;