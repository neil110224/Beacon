import React, { useState } from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Collapse, IconButton } from '@mui/material';
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

const Sidebarw = () => {
  const [openMasterlist, setOpenMasterlist] = useState(false);
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleMasterlistToggle = () => {
    setOpenMasterlist(!openMasterlist);
  };

  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setOpenMasterlist(false); // Close masterlist when collapsing
    }
  };

  return (
    <Box 
      sx={{
        bgcolor: '#1e1e1e', 
        height: '100vh', 
        width: isCollapsed ? '80px' : '15%',
        minWidth: isCollapsed ? '80px' : '200px',
        color: '#f4f4f4',
        overflow: 'auto',
        transition: 'width 0.3s ease, min-width 0.3s ease',
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

      <List component="nav">
        {/* Dashboard */}
        <ListItemButton
          onClick={() => handleItemClick('Dashboard')}
          sx={{
            bgcolor: activeItem === 'Dashboard' ? '#ffe600' : 'transparent',
            color: activeItem === 'Dashboard' ? '#000' : '#f4f4f4',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            '&:hover': {
              bgcolor: activeItem === 'Dashboard' ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <ListItemIcon sx={{ color: activeItem === 'Dashboard' ? '#000' : '#f4f4f4', minWidth: isCollapsed ? 'auto' : '56px' }}>
            <HomeIcon />
          </ListItemIcon>
          {!isCollapsed && <ListItemText primary="Dashboard" />}
        </ListItemButton>

        {/* Systems */}
        <ListItemButton
          onClick={() => handleItemClick('Systems')}
          sx={{
            bgcolor: activeItem === 'Systems' ? '#ffe600' : 'transparent',
            color: activeItem === 'Systems' ? '#000' : '#f4f4f4',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            '&:hover': {
              bgcolor: activeItem === 'Systems' ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <ListItemIcon sx={{ color: activeItem === 'Systems' ? '#000' : '#f4f4f4', minWidth: isCollapsed ? 'auto' : '56px' }}>
            <SettingsSystemDaydreamIcon />
          </ListItemIcon>
          {!isCollapsed && <ListItemText primary="Systems" />}
        </ListItemButton>

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
            <Collapse in={openMasterlist} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
            {/* Role */}
            <ListItemButton
              onClick={() => handleItemClick('Role')}
              sx={{
                pl: 4,
                bgcolor: activeItem === 'Role' ? '#ffe600' : 'transparent',
                color: activeItem === 'Role' ? '#000' : '#f4f4f4',
                '&:hover': {
                  bgcolor: activeItem === 'Role' ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: activeItem === 'Role' ? '#000' : '#f4f4f4' }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Role" />
            </ListItemButton>

            {/* User */}
            <ListItemButton
              onClick={() => handleItemClick('User')}
              sx={{
                pl: 4,
                bgcolor: activeItem === 'User' ? '#ffe600' : 'transparent',
                color: activeItem === 'User' ? '#000' : '#f4f4f4',
                '&:hover': {
                  bgcolor: activeItem === 'User' ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: activeItem === 'User' ? '#000' : '#f4f4f4' }}>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="User" />
            </ListItemButton>

            {/* Team */}
            <ListItemButton
              onClick={() => handleItemClick('Team')}
              sx={{
                pl: 4,
                bgcolor: activeItem === 'Team' ? '#ffe600' : 'transparent',
                color: activeItem === 'Team' ? '#000' : '#f4f4f4',
                '&:hover': {
                  bgcolor: activeItem === 'Team' ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: activeItem === 'Team' ? '#000' : '#f4f4f4' }}>
                <GroupsIcon />
              </ListItemIcon>
              <ListItemText primary="Team" />
            </ListItemButton>

            {/* Charging */}
            <ListItemButton
              onClick={() => handleItemClick('Charging')}
              sx={{
                pl: 4,
                bgcolor: activeItem === 'Charging' ? '#ffe600' : 'transparent',
                color: activeItem === 'Charging' ? '#000' : '#f4f4f4',
                '&:hover': {
                  bgcolor: activeItem === 'Charging' ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: activeItem === 'Charging' ? '#000' : '#f4f4f4' }}>
                <LocationCityIcon />
              </ListItemIcon>
              <ListItemText primary="Charging" />
            </ListItemButton>

            {/* Category */}
            <ListItemButton
              onClick={() => handleItemClick('Category')}
              sx={{
                pl: 4,
                bgcolor: activeItem === 'Category' ? '#ffe600' : 'transparent',
                color: activeItem === 'Category' ? '#000' : '#f4f4f4',
                '&:hover': {
                  bgcolor: activeItem === 'Category' ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: activeItem === 'Category' ? '#000' : '#f4f4f4' }}>
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText primary="Category" />
            </ListItemButton>
              </List>
            </Collapse>
          </>
        )}

        {/* Collapsed Masterlist Children - Show as icons only */}
        {isCollapsed && (
          <>
            <ListItemButton
              onClick={() => handleItemClick('Role')}
              sx={{
                bgcolor: activeItem === 'Role' ? '#ffe600' : 'transparent',
                color: activeItem === 'Role' ? '#000' : '#f4f4f4',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: activeItem === 'Role' ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: activeItem === 'Role' ? '#000' : '#f4f4f4', minWidth: 'auto' }}>
                <PersonIcon />
              </ListItemIcon>
            </ListItemButton>

            <ListItemButton
              onClick={() => handleItemClick('User')}
              sx={{
                bgcolor: activeItem === 'User' ? '#ffe600' : 'transparent',
                color: activeItem === 'User' ? '#000' : '#f4f4f4',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: activeItem === 'User' ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: activeItem === 'User' ? '#000' : '#f4f4f4', minWidth: 'auto' }}>
                <PeopleIcon />
              </ListItemIcon>
            </ListItemButton>

            <ListItemButton
              onClick={() => handleItemClick('Team')}
              sx={{
                bgcolor: activeItem === 'Team' ? '#ffe600' : 'transparent',
                color: activeItem === 'Team' ? '#000' : '#f4f4f4',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: activeItem === 'Team' ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: activeItem === 'Team' ? '#000' : '#f4f4f4', minWidth: 'auto' }}>
                <GroupsIcon />
              </ListItemIcon>
            </ListItemButton>

            <ListItemButton
              onClick={() => handleItemClick('Charging')}
              sx={{
                bgcolor: activeItem === 'Charging' ? '#ffe600' : 'transparent',
                color: activeItem === 'Charging' ? '#000' : '#f4f4f4',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: activeItem === 'Charging' ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: activeItem === 'Charging' ? '#000' : '#f4f4f4', minWidth: 'auto' }}>
                <LocationCityIcon />
              </ListItemIcon>
            </ListItemButton>

            <ListItemButton
              onClick={() => handleItemClick('Category')}
              sx={{
                bgcolor: activeItem === 'Category' ? '#ffe600' : 'transparent',
                color: activeItem === 'Category' ? '#000' : '#f4f4f4',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: activeItem === 'Category' ? '#c7c7c7' : 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: activeItem === 'Category' ? '#000' : '#f4f4f4', minWidth: 'auto' }}>
                <CategoryIcon />
              </ListItemIcon>
            </ListItemButton>
          </>
        )}

        {/* Log out */}
        <ListItemButton
          onClick={() => handleItemClick('Logout')}
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
    </Box>
  );
};

export default Sidebarw;