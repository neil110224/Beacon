import React, { useState } from 'react';
import Confirmation from './reuseable/Confirmation';
import { NavLink, useLocation } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Collapse, IconButton, Avatar, Typography, Menu, MenuItem } from '@mui/material';
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
import MenuIcon from '@mui/icons-material/Menu';
import mis from "../assets/mis.png";
import beacon from '../assets/beacon.jpg'

const Sidebar = ({ user, onChangeProfile }) => {
  const location = useLocation();
  const [openMasterlist, setOpenMasterlist] = useState(
    location.pathname.startsWith('/role') || 
    location.pathname.startsWith('/users') || 
    location.pathname.startsWith('/team') || 
    location.pathname.startsWith('/charging') ||
    location.pathname.startsWith('/category')
  );
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
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

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setOpenMasterlist(false);
    }
  };




  return (
    <Box 
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
          flexDirection: isCollapsed ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          px: isCollapsed ? 1 : { xs: 1, sm: 2 },
          py: 0,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          height: { xs: '70px', sm: '80px' },
          minHeight: { xs: '70px', sm: '80px' },
          maxHeight: { xs: '70px', sm: '80px' },
          gap: isCollapsed ? 1 : 0,
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
              <img 
                src={mis} 
                alt="MIS Logo" 
                style={{ 
                  width: '28px', 
                  height: '28px',
                  objectFit: 'contain' 
                }} 
              />
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
        
        {isCollapsed && (
          <>
            <IconButton
              onClick={handleToggleSidebar}
              sx={{
                color: '#f4f4f4',
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              sx={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <img 
                src={mis} 
                alt="MIS Logo" 
                style={{ 
                  width: '28px', 
                  height: '28px',
                  objectFit: 'contain' 
                }} 
              />
            </Box>
          </>
        )}

        {!isCollapsed && (
          <IconButton
            onClick={handleToggleSidebar}
            sx={{
              color: '#f4f4f4',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              width: 32,
              height: 32,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.15)',
              },
            }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
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
          )}
        </NavLink>

        {/* Systems */}
        <NavLink
          to="/Systems"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {({ isActive }) => (
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
          )}
        </NavLink>

        {/* Masterlist */}
        {!isCollapsed && (
          <>
            <ListItemButton
              onClick={handleMasterlistToggle}
              sx={{
                color: '#ffffff',
                borderRadius: '12px',
                mb: 0.5,
                border: '1px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: '#ffffff',
                  minWidth: '48px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <LibraryBooksIcon sx={{ fontSize: '1.3rem' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Masterlist" 
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                }}
              />
              {openMasterlist ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

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
                        bgcolor: isActive ? '#424242' : 'transparent',
                        color: isActive ? '#000' : '#f4f4f4',
                        '&:hover': {
                          bgcolor: isActive ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? '#000' : '#f4f4f4' }}>
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
                        bgcolor: isActive ? '#424242' : 'transparent',
                        color: isActive ? '#000' : '#f4f4f4',
                        '&:hover': {
                          bgcolor: isActive ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? '#000' : '#f4f4f4' }}>
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
                        bgcolor: isActive ? '#424242' : 'transparent',
                        color: isActive ? '#000' : '#f4f4f4',
                        '&:hover': {
                          bgcolor: isActive ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? '#000' : '#f4f4f4' }}>
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
                        bgcolor: isActive ? '#424242' : 'transparent',
                        color: isActive ? '#000' : '#f4f4f4',
                        '&:hover': {
                          bgcolor: isActive ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? '#000' : '#f4f4f4' }}>
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
                        bgcolor: isActive ? '#424242' : 'transparent',
                        color: isActive ? '#000' : '#f4f4f4',
                        '&:hover': {
                          bgcolor: isActive ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? '#000' : '#f4f4f4' }}>
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

        {/* Collapsed Masterlist Children - Show as icons only */}
        {isCollapsed && (
          <>
            <NavLink
              to="/role"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {({ isActive }) => (
                <ListItemButton
                  sx={{
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)'
                      : 'transparent',
                    color: '#ffffff',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    mb: 0.5,
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 100%)'
                        : 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#ffffff', minWidth: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <PersonIcon sx={{ fontSize: '1.5rem' }} />
                  </ListItemIcon>
                </ListItemButton>
              )}
            </NavLink>

            <NavLink
              to="/users"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {({ isActive }) => (
                <ListItemButton
                  sx={{
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)'
                      : 'transparent',
                    color: '#ffffff',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    mb: 0.5,
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 100%)'
                        : 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#ffffff', minWidth: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <PeopleIcon sx={{ fontSize: '1.5rem' }} />
                  </ListItemIcon>
                </ListItemButton>
              )}
            </NavLink>

            <NavLink
              to="/team"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {({ isActive }) => (
                <ListItemButton
                  sx={{
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)'
                      : 'transparent',
                    color: '#ffffff',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    mb: 0.5,
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 100%)'
                        : 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#ffffff', minWidth: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <GroupsIcon sx={{ fontSize: '1.5rem' }} />
                  </ListItemIcon>
                </ListItemButton>
              )}
            </NavLink>

            <NavLink
              to="/charging"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {({ isActive }) => (
                <ListItemButton
                  sx={{
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)'
                      : 'transparent',
                    color: '#ffffff',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    mb: 0.5,
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 100%)'
                        : 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#ffffff', minWidth: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <LocationCityIcon sx={{ fontSize: '1.5rem' }} />
                  </ListItemIcon>
                </ListItemButton>
              )}
            </NavLink>

            <NavLink
              to="/category"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {({ isActive }) => (
                <ListItemButton
                  sx={{
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)'
                      : 'transparent',
                    color: '#ffffff',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    mb: 0.5,
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 100%)'
                        : 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#ffffff', minWidth: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <CategoryIcon sx={{ fontSize: '1.5rem' }} />
                  </ListItemIcon>
                </ListItemButton>
              )}
            </NavLink>
          </>
        )}
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