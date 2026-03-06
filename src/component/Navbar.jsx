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
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";  
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout } from "../features/api/slice/authSlice";

import ChangeProfileDialog from "../pages/dialog/ChangeProfileDialog";  
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

const Navbar = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const firstName = user?.first_name;
  const location = useLocation();
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [activePage, setActivePage] = useState("HOME");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const navigate = useNavigate();

  const theme = useTheme();

  // Update date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Check if current route is dashboard
  const isDashboard = location.pathname.toLowerCase() === '/dashboard';

  // Initialize sidebar collapsed state - closed only on dashboard, otherwise restore from localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (isDashboard) {
      return true; // Always collapsed on dashboard
    }
    // On other pages, restore from localStorage, default to false (expanded)
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);

  // Custom breakpoints matching your SCSS
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

  // Save sidebar state to localStorage (except for dashboard)
  useEffect(() => {
    if (!isDashboard) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
    }
  }, [isSidebarCollapsed, isDashboard]);

  // Collapse sidebar when navigating to dashboard
  useEffect(() => {
    if (isDashboard) {
      setIsSidebarCollapsed(true);
    }
  }, [isDashboard]);

  const open = Boolean(anchorEl);

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleChangeProfile = () => {
    setProfileDialogOpen(true);
    handleClose();
  };

  const handleProfileDialogClose = () => {
    setProfileDialogOpen(false);
  };

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
    handleClose();
  };

  const handleConfirmLogout = () => {
    setLogoutConfirmOpen(false);
    dispatch(logout());
    // Use window.location to force a hard redirect, bypassing React routing caches
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleToggleSidebarLock = () => {
    setIsSidebarCollapsed((prev) => !prev);
    setIsSidebarLocked(true);
  };

  const handleToggleMobileDrawer = () => {
    setMobileDrawerOpen((prev) => !prev);
  };

  const handleAddClick = () => {
    if (activePage === "USERS") {
      setUserDialogOpen(true);
    } else if (activePage === "TEAM") {
      setTeamDialogOpen(true);
    }
  };

  // Determine sidebar behavior based on screen size
  const showMobileSidebar = isMd;

  return (
    <Box className="navbarContainer">
      {/* Desktop Sidebar */}
      {!showMobileSidebar && (
        <Box className="desktopSidebar">
          <Sidebar user={user} onChangeProfile={() => setProfileDialogOpen(true)} isSidebarLocked={isSidebarLocked} onToggleSidebarLock={handleToggleSidebarLock} isSidebarCollapsed={isSidebarCollapsed} isMobile={false} />
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
        <Sidebar user={user} onChangeProfile={() => setProfileDialogOpen(true)} isSidebarLocked={isSidebarLocked} onToggleSidebarLock={handleToggleSidebarLock} isSidebarCollapsed={isSidebarCollapsed} isMobile={true} mobileDrawerOpen={mobileDrawerOpen} onCloseMobileDrawer={handleToggleMobileDrawer} />
      </Drawer>

      {/* Main Content Area */}
      <Box className="mainContentArea">
        {/* Top Bar / Navbar */}
        <Box className="topBar">
          {/* Left side - Date and Time */}
          <Box className="topBarLeft">
            {/* Sidebar Toggle Button */}
            {!showMobileSidebar && (
              <Tooltip title={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}>
                <IconButton
                  onClick={handleToggleSidebarLock}
                  className="sidebarToggleButton"
                >
                  {isSidebarCollapsed ? (
                    <ArrowForwardIosIcon className="toggleIcon" />
                  ) : (
                    <ArrowBackIosNewIcon className="toggleIcon" />
                  )}
                </IconButton>
              </Tooltip>
            )}

            {/* Mobile Menu Button */}
            {showMobileSidebar && (
              <IconButton
                onClick={handleToggleMobileDrawer}
                className="mobileMenuButton"
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>

          {/* User Info */}
          <Box 
            className="userInfoContainer"
            onClick={handleAvatarClick}
          >
            <Typography className="userName" sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
              {firstName}
            </Typography>

            <Avatar 
              src={user?.profile_picture || "/static/images/avatar/2.jpg"}
              className="userAvatar"
            />
          </Box>

          <Menu 
            anchorEl={anchorEl} 
            open={open} 
            onClose={handleClose}
            className="menu"
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem 
              onClick={handleChangeProfile}
              className="menuItem"
            >
              <PersonIcon className="menuIcon" />
              <Typography className="menuItemText">
                Change Profile
              </Typography>
            </MenuItem>
            <MenuItem 
              onClick={handleLogoutClick}
              className="menuItem logoutItem"
            >
              <LogoutIcon className="menuIcon" />
              <Typography className="menuItemText">
                Logout
              </Typography>
            </MenuItem>
          </Menu>
        </Box>

        {/* Body Content */}
        <Box className="bodyContent">
          {/* Conditionally render TopNavContent - only show when NOT on Dashboard */}
          {!isDashboard && <TopNavContent />}
          
          <Box className="contentWrapper">
            <Outlet context={{ isSidebarCollapsed, isSidebarLocked }} />
          </Box>
        </Box>

        <UserFormDialog
          open={userDialogOpen}
          onClose={() => setUserDialogOpen(false)}
          user={null}  // null = add mode
          onSave={createUser}
          isLoading={isCreatingUser}
        />

        <TeamFormDialog
          open={teamDialogOpen}
          onClose={() => setTeamDialogOpen(false)}
          team={null}  // null = add mode
          onSave={createTeam}
          isLoading={creatingTeam}
        />
      </Box>

      <ChangeProfileDialog
        open={profileDialogOpen}
        onClose={handleProfileDialogClose}
        user={user}
      />

      <Confirmation
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to logout?"
      />
    </Box>
  );
};

export default Navbar;