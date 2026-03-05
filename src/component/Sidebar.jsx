import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Menu, MenuItem, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import logo from "../assets/logo.png";
import plogo from "../assets/pl.png";
import "./scss/sidebar.scss";

// Menu items configuration
const MENU_ITEMS = [
  { key: 'dashboard', path: '/Dashboard', label: 'Dashboard', icon: HomeIcon, permission: 'Dashboard', isMasterlist: false },
  { key: 'users', path: '/users', label: 'Users', icon: PeopleIcon, permission: 'Users', isMasterlist: true },
  { key: 'role', path: '/role', label: 'Role', icon: PersonIcon, permission: 'Role', isMasterlist: true },
  { key: 'charging', path: '/charging', label: 'Charging', icon: LocationCityIcon, permission: 'Charging', isMasterlist: true },
  { key: 'category', path: '/category', label: 'Category', icon: CategoryIcon, permission: 'Category', isMasterlist: true },
  { key: 'team', path: '/team', label: 'Team', icon: GroupsIcon, permission: 'Team', isMasterlist: true },
  { key: 'systems', path: '/systems', label: 'Systems', icon: SettingsSystemDaydreamIcon, permission: 'Systems', isMasterlist: false },
];

const MASTERLIST_ITEMS = MENU_ITEMS.filter(item => item.isMasterlist === true);

const MenuItem_ = ({ item, isActive, isCollapsed, onClick }) => {
  const Icon = item.icon;
  return (
    <Tooltip title={isCollapsed ? item.label : ""} placement="right">
      <ListItemButton
        className={`listItemButton ${isActive ? 'listItemButton--active' : ''} ${isCollapsed ? 'listItemButton--collapsed' : ''}`}
        onClick={onClick}
        sx={{ 
          gap: '1rem',
          backgroundColor: isActive ? 'rgba(82, 152, 114, 0.35)' : 'transparent',
          '&:hover': {
            backgroundColor: isActive ? 'rgba(82, 152, 114, 0.45)' : 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <ListItemIcon className="listItemIcon" sx={{ minWidth: '0', margin: '0', color: '#03346E' }}>
          <Icon />
        </ListItemIcon>
        {!isCollapsed && <ListItemText primary={item.label} sx={{ '& .MuiTypography-root': { fontSize: '1.05rem', fontWeight: 600, display:'flex', justifyContent:'flex-start', color: '#03346E'  } }} className="listItemText"  />}
      </ListItemButton>
    </Tooltip>
  );
};

const NavMenuItem = ({ item, isCollapsed, isActive, inMenu = false }) => {
  return (
    <NavLink to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
      {({ isActive: isNavActive }) => {
        const active = inMenu ? isActive : isNavActive;
        if (inMenu) {
          return (
            <MenuItem className={`menuItem ${active ? 'menuItem--active' : ''}`}>
              <ListItemIcon sx={{ color:'#03346E', minWidth: '36px' }}>
                {item.icon && <item.icon fontSize="large" />}
              </ListItemIcon>
              {item.label}
            </MenuItem>
          );
        }
        return (
          <MenuItem_ item={item} isActive={active} isCollapsed={isCollapsed} />
        );
      }}
    </NavLink>
  );
};

const Sidebar = ({ user, onChangeProfile, isSidebarCollapsed = false }) => {
  const location = useLocation();
  const userPermissions = user?.role?.access_permissions || [];
  const isCollapsed = isSidebarCollapsed;

  const [openMasterlist, setOpenMasterlist] = useState(
    MASTERLIST_ITEMS.some(item => 
      userPermissions.includes(item.permission) && location.pathname.startsWith(item.path)
    )
  );
  const [masterlistMenuAnchor, setMasterlistMenuAnchor] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClose = () => setAnchorEl(null);
  const handleChangeProfile = () => {
    onChangeProfile?.();
    handleClose();
  };
  const handleMasterlistToggle = () => setOpenMasterlist(!openMasterlist);
  const handleMasterlistMenuClick = (e) => setMasterlistMenuAnchor(e.currentTarget);
  const handleMasterlistMenuClose = () => setMasterlistMenuAnchor(null);

  const hasMasterlistAccess = MASTERLIST_ITEMS.some(item => userPermissions.includes(item.permission));

  return (
    <Box className={`sidebarWrapper ${isCollapsed ? 'sidebarWrapper--collapsed' : 'sidebarWrapper--expanded'}`}>
      {/* Header with Logo and Title */}
      <Box className="header">
        <Box className="logoBox">
          <Link to="/dashboard">
            <img src={plogo} alt="Beacon Logo" />
          </Link>
        </Box>
        {!isCollapsed && <Box component="h4" className="title">Beacon</Box>}
      </Box>

      <List component="nav" className="list">
        {/* Dashboard */}
        {MENU_ITEMS.filter(item => 
          item.key === 'dashboard' && userPermissions.includes(item.permission)
        ).map(item => (
          <NavLink key={item.key} to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
            {({ isActive }) => (
              <MenuItem_ item={item} isActive={isActive} isCollapsed={isCollapsed} />
            )}
          </NavLink>
        ))}

        {/* Masterlist Section */}
        {hasMasterlistAccess && (
          <>
            <Tooltip title={isCollapsed ? "Masterlist" : ""} placement="right">
              <ListItemButton
                onClick={isCollapsed ? handleMasterlistMenuClick : handleMasterlistToggle}
                className={`listItemButton ${openMasterlist && !isCollapsed ? 'listItemButton--active' : ''} ${isCollapsed ? 'listItemButton--collapsed' : ''}`}
                sx={{
                  gap: '1rem',
                  backgroundColor: openMasterlist && !isCollapsed ? 'transparent' : 'transparent',
                  '&:hover': {
                    backgroundColor: openMasterlist && !isCollapsed ? 'rgba(82, 152, 114, 0.45)' : 'rgba(255, 255, 255, 0.1)'
                  },
                  '& .MuiTypography-root': { fontSize: '1.05rem',  fontWeight: 600, color: '#03346E' }
                }}
              >
                <ListItemIcon className="listItemIcon" sx={{ minWidth: '0', margin: '0', color: '#03346E' }}>
                  <LibraryBooksIcon />
                </ListItemIcon>
                {!isCollapsed && (
                  <>
                    <ListItemText primary="Masterlist" className="listItemText" sx={{ '& .MuiTypography-root': { color: '#03346E' } }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                      {openMasterlist ? <ExpandLess sx={{ color: '#03346E' }} /> : <ExpandMore sx={{ color: '#03346E' }} />}
                    </Box>
                  </>
                )}
              </ListItemButton>
            </Tooltip>

            {/* Expanded Masterlist */}
            {!isCollapsed && (
              <Collapse in={openMasterlist}>
                <List component="div" disablePadding>
                  {MASTERLIST_ITEMS.filter(item => 
                    userPermissions.includes(item.permission)
                  ).map(item => (
                    <NavLink key={item.key} to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {({ isActive }) => (
                        <ListItemButton 
                          className={`nestedItem ${isActive ? 'nestedItem--active' : ''}`}
                          sx={{
                            paddingLeft: '3.5rem',
                            gap: '1rem',
                            backgroundColor: isActive ? 'rgba(82, 152, 114, 0.35)' : 'transparent',
                            '&:hover': {
                              backgroundColor: isActive ? 'rgba(82, 152, 114, 0.45)' : 'rgba(82, 152, 114, 0.1)'
                            },
                            '& .MuiTypography-root': { fontSize: '1rem' , fontWeight: 600, color: '#03346E' }
                          }}
                        >
                          <ListItemIcon sx={{ color: '#03346E', minWidth: '0', margin: '0' }}>
                            <item.icon />
                          </ListItemIcon>
                          <ListItemText primary={item.label} sx={{ '& .MuiTypography-root': { color: '#03346E' } }} />
                        </ListItemButton>
                      )}
                    </NavLink>
                  ))}
                </List>
              </Collapse>
            )}

            {/* Collapsed Masterlist Menu */}
            {isCollapsed && (
              <Menu
                anchorEl={masterlistMenuAnchor}
                open={Boolean(masterlistMenuAnchor)}
                onClose={handleMasterlistMenuClose}
                PaperProps={{ elevation: 8, className: 'menuPaper' }}
              >
                {MASTERLIST_ITEMS.filter(item => 
                  userPermissions.includes(item.permission)
                ).map(item => (
                  <NavLink key={item.key} to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {({ isActive }) => (
                      <MenuItem 
                        onClick={handleMasterlistMenuClose}
                        className={`menuItem ${isActive ? 'menuItem--active' : ''}`}
                      >
                        <ListItemIcon sx={{ color: '#03346E', minWidth: '36px' }}>
                          <item.icon fontSize="small" />
                        </ListItemIcon>
                        {item.label}
                      </MenuItem>
                    )}
                  </NavLink>
                ))}
              </Menu>
            )}
          </>
        )}

        {/* Systems */}
        {MENU_ITEMS.filter(item => 
          item.key === 'systems' && userPermissions.includes(item.permission)
        ).map(item => (
          <NavLink key={item.key} to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
            {({ isActive }) => (
              <MenuItem_ item={item} isActive={isActive} isCollapsed={isCollapsed} />
            )}
          </NavLink>
        ))}
      </List>

      <Box className="spacer" />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleChangeProfile}>
          <ListItemIcon sx={{ minWidth: '0', margin: '0', mr: 1 }}>
            <PersonIcon />
          </ListItemIcon>
          Change Profile
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Sidebar;