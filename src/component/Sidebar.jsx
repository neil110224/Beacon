import React, { useState } from 'react';
// Helper to format date and time
function useCurrentDateTime() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return { date, time };
}
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Menu, MenuItem, Tooltip, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
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

// ✅ Threshold: auto-collapse when dragged below this width
const COLLAPSE_THRESHOLD = 220;

const MenuItem_ = ({ item, isActive, isCollapsed, onClick }) => {
  const Icon = item.icon;
  return (
    <Tooltip title={isCollapsed ? item.label : ""} placement="right">
      <ListItemButton
        className={`listItemButton ${isActive ? 'listItemButton--active' : ''} ${isCollapsed ? 'listItemButton--collapsed' : ''}`}
        onClick={onClick}
        sx={{
          gap: '1rem',
          backgroundColor: isActive ? '#89D4FF' : 'transparent',
          fontSize: 'var(--sidebar-btn-font-size)',
          '&:hover': {
            backgroundColor: isActive ? 'rgba(137, 212, 255, 0.85)' : 'rgba(137, 212, 255, 0.2)'
          }
        }}
      >
        <ListItemIcon className="listItemIcon" sx={{ minWidth: '0', margin: '0', color: 'var(--sidebar-icon-color)', fontSize: 'var(--sidebar-icon-font-size)' }}>
          <Icon />
        </ListItemIcon>
        {!isCollapsed && (
          <ListItemText
            primary={item.label}
            sx={{ '& .MuiTypography-root': { fontSize: 'var(--sidebar-btn-font-size)', fontWeight: 500, display: 'flex', justifyContent: 'flex-start', color: 'var(--sidebar-text-color)', fontFamily: '"Oswald", sans-serif' } }}
            className="listItemText"
          />
        )}
      </ListItemButton>
    </Tooltip>
  );
};

const Sidebar = ({
  user,
  onChangeProfile,
  isSidebarCollapsed = false,
  onCollapse,           // ✅ callback from Navbar to set collapsed state
  isMobile = false,
  mobileDrawerOpen = false,
  onCloseMobileDrawer = null
}) => {
  const location = useLocation();
  // Add current time and date state
  const { date, time } = useCurrentDateTime();
  const userPermissions = user?.role?.access_permissions || [];
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  const [openMasterlist, setOpenMasterlist] = useState(
    MASTERLIST_ITEMS.some(item =>
      userPermissions.includes(item.permission) && location.pathname.startsWith(item.path)
    )
  );
  const [masterlistMenuAnchor, setMasterlistMenuAnchor] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClose = () => setAnchorEl(null);
  const handleChangeProfile = () => { onChangeProfile?.(); handleClose(); };
  const handleMasterlistToggle = () => setOpenMasterlist(!openMasterlist);

  // Close Masterlist when another parent is clicked
  const handleParentMenuClick = (parentKey) => {
    if (openMasterlist && parentKey !== 'masterlist') {
      setOpenMasterlist(false);
    }
  };
  const handleMasterlistMenuClick = (e) => setMasterlistMenuAnchor(e.currentTarget);
  const handleMasterlistMenuClose = () => setMasterlistMenuAnchor(null);

  const hasMasterlistAccess = MASTERLIST_ITEMS.some(item => userPermissions.includes(item.permission));

  // isSidebarCollapsed is the single source of truth from parent (Navbar)
  const isCollapsed = isSidebarCollapsed;

  const handleMouseDown = () => setIsResizing(true);

  React.useEffect(() => {
    let animationFrameId = null;

    const handleMouseMove = (e) => {
      if (!isResizing) return;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const newWidth = e.clientX;

        if (newWidth < COLLAPSE_THRESHOLD) {
          // ✅ Auto-collapse: tell parent to collapse
          onCollapse?.(true)
        } else if (newWidth >= COLLAPSE_THRESHOLD && newWidth < 500) {
          // Ensure it's expanded when dragging back above threshold
          onCollapse?.(false)
          setSidebarWidth(newWidth)
        }
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };

    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ew-resize';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'auto';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isResizing, onCollapse]);

  // Close Masterlist when sidebar is collapsed
  React.useEffect(() => {
    if (isCollapsed && openMasterlist) {
      setOpenMasterlist(false);
    }
    // Do not auto-open when expanding
    // eslint-disable-next-line
  }, [isCollapsed]);

  return (
    <Box
      className={`sidebarWrapper ${isCollapsed ? 'sidebarWrapper--collapsed' : 'sidebarWrapper--expanded'}`}
      sx={{
        width: isCollapsed ? '90px' : `${sidebarWidth}px`,
        transition: isResizing ? 'none' : 'all 0.3s ease'
      }}
    >
      {/* Resize Handle — only shown when expanded */}
      {!isCollapsed && (
        <Tooltip title="Drag to resize sidebar" placement="right" arrow>
          <Box
            onMouseDown={handleMouseDown}
            className="sidebarResizeHandle"
            sx={{ zIndex: 1000 }}
          />
        </Tooltip>
      )}

      {/* Header */}
      <Box className="header">
        <Box className="logoBox">
          <Link to="/dashboard">
            <img src={plogo} alt="Beacon Logo" />
          </Link>
        </Box>
        {!isCollapsed && <Box component="h4" className="title">Beacon</Box>}
        {isMobile && mobileDrawerOpen && (
          <IconButton
            onClick={onCloseMobileDrawer}
            className="mobileCloseButton"
            sx={{ position: 'absolute', top: '20px', right: '1px', color: '#03346E', width: '36px', height: '36px' }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: '0.9rem' }} />
          </IconButton>
        )}
      </Box>

      <List component="nav" className="list">
        {/* Dashboard */}
        {MENU_ITEMS.filter(item =>
          item.key === 'dashboard' && userPermissions.includes(item.permission)
        ).map(item => (
          <NavLink key={item.key} to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
            {({ isActive }) => (
              <div onClick={() => handleParentMenuClick(item.key)}>
                <MenuItem_ item={item} isActive={isActive} isCollapsed={isCollapsed} />
              </div>
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
                  backgroundColor: 'transparent',
                  '&:hover': { backgroundColor: 'rgba(137, 212, 255, 0.2)' },
                  '& .MuiTypography-root': { fontSize: 'var(--sidebar-btn-font-size)', fontWeight: 500, color: 'var(--sidebar-text-color)' }
                }}
              >
                <ListItemIcon className="listItemIcon" sx={{ minWidth: '0', margin: '0', color: 'var(--sidebar-icon-color)', fontSize: 'var(--sidebar-icon-font-size)' }}>
                  <LibraryBooksIcon />
                </ListItemIcon>
                {!isCollapsed && (
                  <>
                    <ListItemText
                      primary="Masterlist"
                      className="listItemText"
                      sx={{ '& .MuiTypography-root': { fontSize: 'var(--sidebar-btn-font-size)', color: 'var(--sidebar-text-color)', fontFamily: '"Oswald", sans-serif' } }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                      {openMasterlist
                        ? <ExpandLess sx={{ color: 'var(--sidebar-icon-color)', fontSize: '1.1rem' }} />
                        : <ExpandMore sx={{ color: 'var(--sidebar-icon-color)', fontSize: '1.1rem' }} />
                      }
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
                            backgroundColor: isActive ? '#89D4FF' : 'transparent',
                            '&:hover': { backgroundColor: isActive ? 'rgba(137, 212, 255, 0.85)' : 'rgba(137, 212, 255, 0.2)' },
                            '& .MuiTypography-root': { fontSize: 'var(--sidebar-btn-font-size)', fontWeight: 500, color: 'var(--sidebar-text-color)' }
                          }}
                        >
                          <ListItemIcon className="listItemIcon" sx={{ color: 'var(--sidebar-icon-color)', minWidth: '0', margin: '0' }}>
                            <item.icon />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.label}
                            sx={{ '& .MuiTypography-root': { color: 'var(--sidebar-text-color-active)', fontFamily: '"Oswald", sans-serif' } }}
                          />
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
                        <ListItemIcon sx={{ color: 'var(--sidebar-icon-color)', minWidth: '36px', fontSize: 'var(--sidebar-icon-font-size)' }}>
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
              <div onClick={() => handleParentMenuClick(item.key)}>
                <MenuItem_ item={item} isActive={isActive} isCollapsed={isCollapsed} />
              </div>
            )}
          </NavLink>
        ))}
      </List>

      <Box className="spacer" />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleChangeProfile}>
          <ListItemIcon sx={{ minWidth: '0', margin: '0', mr: 1, fontSize: 'var(--sidebar-icon-font-size)', color: 'var(--sidebar-icon-color)' }}>
            <PersonIcon />
          </ListItemIcon>
          Change Information
        </MenuItem>
      </Menu>

      {/* Time and Date at the bottom */}
      <Box sx={{
        width: '100%',
        textAlign: 'flex-start',
        color: '#03346E',
        fontFamily: '"Oswald", sans-serif',
        fontWeight: 600,
        fontSize: 'var(--sidebar-btn-font-size)',
        letterSpacing: '0.5px',
        mb: 2,
        mt: 1,
        userSelect: 'none',
        ml: isCollapsed ? '0.4rem' : '1rem',

      }}>
        <div>{time}</div>
        <div style={{
          fontSize: '0.15rem',
          fontWeight: 400,
          fontSize: 'var(--sidebar-btn-font-size)',
        }}>{date}</div>
      </Box>
    </Box>
  );
};

export default Sidebar;