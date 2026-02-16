import React, { useState } from 'react';
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    window.location.replace("http://localhost:5173");
  };

  return (
    <Box 
      sx={{
        bgcolor: '#1e1e1e', 
        height: '100vh', 
        width: isCollapsed ? '80px' : '200px',
        minWidth: isCollapsed ? '80px' : '200px',
        maxWidth: isCollapsed ? '80px' : '200px',
        color: '#f4f4f4',
        overflow: 'hidden', // Changed from 'auto' to 'hidden'
        transition: 'width 1s ease, min-width 1s ease, max-width 1s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header with Logo and Title */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isCollapsed ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '1rem 0.5rem' : '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          minHeight: '80px',
          gap: isCollapsed ? 1 : 0,
        }}
      >
        {!isCollapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img 
              src={mis} 
              alt="MIS Logo" 
              style={{ 
                width: '40px', 
                height: '40px',
                objectFit: 'contain' 
              }} 
            />
            <Box
              component="h3"
              sx={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
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
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <img 
              src={mis} 
              alt="MIS Logo" 
              style={{ 
                width: '40px', 
                height: '40px',
                objectFit: 'contain' 
              }} 
            />
          </>
        )}

        {!isCollapsed && (
          <IconButton
            onClick={handleToggleSidebar}
            sx={{
              color: '#f4f4f4',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
        )}
      </Box>

      <List 
        component="nav" 
        sx={{ 
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
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
                bgcolor: isActive ? '#424242' : 'transparent',
                color: isActive ? '#000' : '#f4f4f4',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                '&:hover': {
                  bgcolor: isActive ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#000' : '#f4f4f4', minWidth: isCollapsed ? 'auto' : '56px' }}>
                <HomeIcon />
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary="Dashboard" />}
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
                bgcolor: isActive ? '#424242' : 'transparent',
                color: isActive ? '#000' : '#f4f4f4',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                '&:hover': {
                  bgcolor: isActive ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#000' : '#f4f4f4', minWidth: isCollapsed ? 'auto' : '56px' }}>
                <SettingsSystemDaydreamIcon />
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary="Systems" />}
            </ListItemButton>
          )}
        </NavLink>

        {/* Masterlist */}
        {!isCollapsed && (
          <>
            <ListItemButton
              onClick={handleMasterlistToggle}
              sx={{
                color: '#f4f4f4',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#f4f4f4' }}>
                <LibraryBooksIcon />
              </ListItemIcon>
              <ListItemText primary="Masterlist" />
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
                    bgcolor: isActive ? '#424242' : 'transparent',
                    color: isActive ? '#000' : '#f4f4f4',
                    justifyContent: 'center',
                    '&:hover': {
                      bgcolor: isActive ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#000' : '#f4f4f4', minWidth: 'auto' }}>
                    <PersonIcon />
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
                    bgcolor: isActive ? '#424242' : 'transparent',
                    color: isActive ? '#000' : '#f4f4f4',
                    justifyContent: 'center',
                    '&:hover': {
                      bgcolor: isActive ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#000' : '#f4f4f4', minWidth: 'auto' }}>
                    <PeopleIcon />
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
                    bgcolor: isActive ? '#424242' : 'transparent',
                    color: isActive ? '#000' : '#f4f4f4',
                    justifyContent: 'center',
                    '&:hover': {
                      bgcolor: isActive ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#000' : '#f4f4f4', minWidth: 'auto' }}>
                    <GroupsIcon />
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
                    bgcolor: isActive ? '#424242' : 'transparent',
                    color: isActive ? '#000' : '#f4f4f4',
                    justifyContent: 'center',
                    '&:hover': {
                      bgcolor: isActive ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#000' : '#f4f4f4', minWidth: 'auto' }}>
                    <LocationCityIcon />
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
                    bgcolor: isActive ? '#424242' : 'transparent',
                    color: isActive ? '#000' : '#f4f4f4',
                    justifyContent: 'center',
                    '&:hover': {
                      bgcolor: isActive ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#000' : '#f4f4f4', minWidth: 'auto' }}>
                    <CategoryIcon />
                  </ListItemIcon>
                </ListItemButton>
              )}
            </NavLink>
          </>
        )}

        {/* Log out */}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            color: '#f4f4f4',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#f4f4f4', minWidth: isCollapsed ? 'auto' : '56px' }}>
            <LogoutIcon />
          </ListItemIcon>
          {!isCollapsed && <ListItemText primary="Log out" />}
        </ListItemButton>
      </List>

      {/* MIS Info at Bottom */}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: "column",
          alignItems: "center", 
          gap: 0.5,
          padding: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <img 
          src={beacon} 
          alt="MIS Logo" 
          style={{ 
            width: '50px', 
            height: '50px',
            objectFit: 'contain',
            borderRadius: 45
          }} 
        />
        
        {!isCollapsed && (
          <Typography 
            sx={{ 
              fontSize: "0.75rem",
              color: "#f4f4f4",
              textAlign: "center",
            }}
          >
            Run by MIS
          </Typography>
        )}
      </Box>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleChangeProfile}>
          <PersonIcon sx={{ mr: 1 }} />
          Change Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Sidebar;