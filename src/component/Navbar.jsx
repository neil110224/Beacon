import {
  Avatar,
  Box,
  Typography,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  IconButton,
  Drawer,
  Tooltip,
} from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import PersonIcon from "@mui/icons-material/Person";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout } from "../features/api/slice/authSlice";
import LockOpenIcon from '@mui/icons-material/LockOpen';

import ChangeProfileDialog from "../pages/dialog/ChangeProfileDialog";
import Changepassword from "../pages/dialog/Changepassword";
import MainContent from "./MainContent";
import Confirmation from "./reuseable/Confirmation";

import { useCreateUserMutation, useUpdateUserMutation } from "../features/api/user/userApi";
import TopNavContent from "./TopNavContent";
import UserFormDialog from "../pages/dialog/UserFormDialog";
import TeamFormDialog from "../pages/dialog/TeamFormDialog";
import { useCreateTeamMutation, useUpdateTeamMutation } from "../features/api/team/teamApi";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

import "./scss/navbar.scss";

const OSWALD = '"Oswald", sans-serif';

const Navbar = () => {
    const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'dark');
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const firstName = user?.first_name;
  const lastName = user?.last_name;
  // Compute initials for Avatar
  const getInitials = (first, last) => {
    const firstInitial = first ? first.charAt(0).toUpperCase() : '';
    const lastInitial = last ? last.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };
  // Generate a random color on each login (persist for session)
  const pastelColors = [
    '#F48FB1', '#81D4FA', '#FFD54F', '#A5D6A7', '#CE93D8',
    '#FFAB91', '#90CAF9', '#E6EE9C', '#B0BEC5', '#FFCC80',
    '#B39DDB', '#80CBC4', '#FF8A65', '#C5E1A5', '#F06292',
    '#BA68C8', '#4DB6AC', '#FFD740', '#9575CD', '#AED581'
  ];
  const getRandomColor = () => {
    // Try to persist for session so it doesn't change on every re-render
    let color = sessionStorage.getItem('avatarBgColor');
    if (!color) {
      color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
      sessionStorage.setItem('avatarBgColor', color);
    }
    return color;
  };
  const location = useLocation();
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  // Determine active page from route, with Masterlist parent
  const routeToPage = {
    '/dashboard': 'Dashboard',
    '/users': 'Users',
    '/role': 'Role',
    '/charging': 'Charging',
    '/category': 'Category',
    '/team': 'Team',
    '/systems': 'Systems',
  };
  const masterlistRoutes = ['/users', '/role', '/charging', '/category', '/team'];
  const path = location.pathname.toLowerCase();
  let activePage = routeToPage[path] || (path.startsWith('/systemcategory') ? 'System Category' : '');
  let isMasterlist = false;
  let masterlistChild = '';
  if (masterlistRoutes.includes(path)) {
    isMasterlist = true;
    masterlistChild = routeToPage[path];
  }
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const navigate = useNavigate();

  const theme = useTheme();

  const isDashboard = location.pathname.toLowerCase() === '/dashboard';

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (isDashboard) return true;
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);

  const isXxs = useMediaQuery('(max-width:500px)');
  const isXs = useMediaQuery('(max-width:575.98px)');
  const isSm = useMediaQuery('(max-width:768px)');
  const isLm = useMediaQuery('(max-width:930.98px)');
  const isMd = useMediaQuery('(max-width:991.98px)');
  const isLg = useMediaQuery('(max-width:1199.98px)');

  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [createTeam, { isLoading: creatingTeam }] = useCreateTeamMutation();
  const [updateTeam] = useUpdateTeamMutation();

  useEffect(() => {
    if (!isDashboard) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
    }
  }, [isSidebarCollapsed, isDashboard]);

  useEffect(() => {
    if (isDashboard) setIsSidebarCollapsed(true);
  }, [isDashboard]);

  useEffect(() => {
    sessionStorage.setItem('appRunning', 'true');
  }, []);

  useEffect(() => {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(themeMode === 'light' ? 'theme-light' : 'theme-dark');
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const open = Boolean(anchorEl);

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleChangeProfile = () => {
    setProfileDialogOpen(true);
    handleClose();
  };

  const handleProfileDialogClose = () => setProfileDialogOpen(false);
  const handleChangePasswordDialogOpen = () => {
    setChangePasswordDialogOpen(true);
    handleClose();
  };
  const handleChangePasswordDialogClose = () => setChangePasswordDialogOpen(false);

  const handleLogoutClick = () => {
    handleClose();
    dispatch(logout());
    localStorage.clear();
    sessionStorage.clear();
    setTimeout(() => { window.location.href = "/login"; }, 100);
  };

  const handleToggleThemeMode = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    handleClose();
  };

  const handleToggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const handleToggleSidebarLock = () => {
    setIsSidebarCollapsed((prev) => !prev);
    setIsSidebarLocked(true);
  };

  const handleToggleMobileDrawer = () => setMobileDrawerOpen((prev) => !prev);

  const handleAddClick = () => {
    if (activePage === "USERS") setUserDialogOpen(true);
    else if (activePage === "TEAM") setTeamDialogOpen(true);
  };

  const showMobileSidebar = isMd;

  return (
    <Box className="navbarContainer">
      {/* Desktop Sidebar */}
      {!showMobileSidebar && (
        <Box className="desktopSidebar">
          <Sidebar
            user={user}
            onChangeProfile={() => setProfileDialogOpen(true)}
            isSidebarLocked={isSidebarLocked}
            onToggleSidebarLock={handleToggleSidebarLock}
            isSidebarCollapsed={isSidebarCollapsed}
            // ✅ Pass setter so Sidebar can auto-collapse via drag
            onCollapse={setIsSidebarCollapsed}
            isMobile={false}
          />
        </Box>
      )}

      {/* Mobile Drawer Sidebar */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleToggleMobileDrawer}
        hideBackdrop={true}
        slotProps={{ backdrop: { sx: { display: 'none' } } }}
        className="mobileDrawer"
      >
        <Sidebar
          user={user}
          onChangeProfile={() => setProfileDialogOpen(true)}
          isSidebarLocked={isSidebarLocked}
          onToggleSidebarLock={handleToggleSidebarLock}
          isSidebarCollapsed={isSidebarCollapsed}
          // ✅ Pass setter so Sidebar can auto-collapse via drag
          onCollapse={setIsSidebarCollapsed}
          isMobile={true}
          mobileDrawerOpen={mobileDrawerOpen}
          onCloseMobileDrawer={handleToggleMobileDrawer}
        />
      </Drawer>

      {/* Main Content Area */}
      <Box className="mainContentArea">
        {/* Top Bar */}
        <Box className="topBar">
          {/* Left side */}
          <Box className="topBarLeft">
            {!showMobileSidebar && (
              <Tooltip
                title={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
                componentsProps={{ tooltip: { sx: { fontFamily: OSWALD } } }}
              >
                <IconButton onClick={handleToggleSidebarLock} className="sidebarToggleButton">
                  {isSidebarCollapsed ? (
                    <ArrowForwardIosIcon className="toggleIcon" sx={{ fontSize: '1rem',  }} />
                  ) : (
                    <ArrowBackIosNewIcon className="toggleIcon" sx={{ fontSize: '1rem' }} />
                  )}
                </IconButton>
              </Tooltip>
            )}

            {/* Mobile Menu Button (left of active page) */}
            {showMobileSidebar && (
              <IconButton onClick={handleToggleMobileDrawer} className="mobileMenuButton" sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}

            {/* Active Page Name */}
            <Typography
              className="activePageLabel"
              sx={{
                fontFamily: OSWALD,
                fontWeight: 600,
                fontSize: '1.1rem',
                ml: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                minWidth: '95px', 
                display: (activePage || isMasterlist) ? 'block' : 'none',
              }}
            >
              {isMasterlist ? (
                <>
                  <span
                    style={{
                      fontSize: '0.75em',
                      fontWeight: 600,
                      opacity: 0.85,
                      letterSpacing: '0.5px',
                    }}
                  >
                    Masterlist
                  </span>
                  <span style={{ margin: '0 0.4em', fontSize: '1.1rem', opacity: 0.7, }}>{'>'}</span>
                  <span
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                    }}
                  >
                    {masterlistChild}
                  </span>
                </>
              ) : (
                activePage
              )}
            </Typography>
          </Box>

          {/* User Info */}
          <Box className="userInfoContainer" onClick={handleAvatarClick}>
            <Typography
              className="userName"
              sx={{ fontFamily: OSWALD, fontSize: '1rem', fontWeight: 500 }}
            >
              {firstName}
            </Typography>

            <Avatar
              src={user?.profile_picture || undefined}
              className="userAvatar"
              sx={{
                width: 30,
                height: 30,
                marginLeft: '8px',
                bgcolor: !user?.profile_picture ? getRandomColor() : undefined,
                color: !user?.profile_picture ? '#fff' : undefined,
                fontWeight: 600,
                fontFamily: OSWALD,
                fontSize: '1rem',
              }}
            >
              {!user?.profile_picture && getInitials(firstName, lastName)}
            </Avatar>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            className="menu"
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: {
                  '& .MuiMenuItem-root': { fontFamily: OSWALD },
                  '& .MuiTypography-root': { fontFamily: OSWALD },
                }
              }
            }}
          >
            <MenuItem onClick={handleChangeProfile} className="menuItem">
              <PersonIcon className="menuIcon" />
              <Typography className="menuItemText" sx={{ fontFamily: OSWALD }}>
                Change information
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleChangePasswordDialogOpen} className="menuItem">
              <LockOpenIcon className="menuIcon" />
              <Typography className="menuItemText" sx={{ fontFamily: OSWALD }}>
                Change password
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleToggleThemeMode} className="menuItem">
              {themeMode === 'dark' ? <DarkModeIcon className="menuIcon" /> : <LightModeIcon className="menuIcon" />}
              <Typography className="menuItemText" sx={{ fontFamily: OSWALD }}>
                Dark mode {themeMode === 'dark' ? 'On' : 'Off'}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogoutClick} className="menuItem logoutItem">
              <LogoutIcon className="menuIcon" />
              <Typography className="menuItemText" sx={{ fontFamily: OSWALD }}>
                Logout
              </Typography>
            </MenuItem>
          </Menu>
        </Box>

        {/* Body Content */}
        <Box className="bodyContent">
          {!isDashboard && <TopNavContent />}
          <Box className="contentWrapper">
            <Outlet context={{ isSidebarCollapsed, isSidebarLocked }} />
          </Box>
        </Box>

        <UserFormDialog
          open={userDialogOpen}
          onClose={() => setUserDialogOpen(false)}
          user={null}
          onSave={createUser}
          isLoading={isCreatingUser}
        />

        <TeamFormDialog
          open={teamDialogOpen}
          onClose={() => setTeamDialogOpen(false)}
          team={null}
          onSave={createTeam}
          isLoading={creatingTeam}
        />
      </Box>

      <ChangeProfileDialog
        open={profileDialogOpen}
        onClose={handleProfileDialogClose}
        user={user}
      />
      <Changepassword
        open={changePasswordDialogOpen}
        onClose={handleChangePasswordDialogClose}
        user={user}
      />
    </Box>
  );
};

export default Navbar;