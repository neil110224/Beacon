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
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/api/slice/authSlice";


import ChangeProfileDialog from "../pages/dialog/ChangeProfileDialog";  
import MainContent from "./MainContent";
import Confirmation from "./reuseable/Confirmation";

import { useCreateUserMutation } from "../features/api/user/userApi";
import TopNavContent from "./TopNavContent";
import AddNewUserDialog from "../pages/dialog/adddialog/AddNewUserDialog";
import AddNewTeamDialog from "../pages/dialog/adddialog/AddNewTeamDialog";
import { useCreateTeamMutation } from "../features/api/team/teamApi";
import Sidebar from "./sidebar";

const Navbar = () => {
  const user = useSelector(selectCurrentUser);
  const firstName = user?.first_name;
  const location = useLocation();
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  const [activePage, setActivePage] = useState("HOME");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const theme = useTheme();
  
  // Check if current route is dashboard
  const isDashboard = useLocation().pathname === '/Dashboard';

  // Initialize sidebar collapsed state based on page
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isDashboard);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);

  // Custom breakpoints matching your SCSS
  const isXxs = useMediaQuery('(max-width:500px)');
  const isXs = useMediaQuery('(max-width:575.98px)');
  const isSm = useMediaQuery('(max-width:768px)');
  const isLm = useMediaQuery('(max-width:930.98px)');
  const isMd = useMediaQuery('(max-width:991.98px)');
  const isLg = useMediaQuery('(max-width:1199.98px)');

  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [createTeam, { isLoading: creatingTeam }] = useCreateTeamMutation();

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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    window.location.replace("http://localhost:5173");
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
      setAddUserOpen(true);
    } else if (activePage === "TEAM") {
      setAddTeamOpen(true);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData).unwrap();
      setAddUserOpen(false);
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user: ' + (error?.data?.message || 'Unknown error'));
    }
  };

  const handleCreateTeam = async (teamData) => {
    try {
      await createTeam(teamData).unwrap();
      setAddTeamOpen(false);
    } catch (error) {
      console.error("Failed to create team:", error);
      alert("Failed to create team: " + (error?.data?.message || "Unknown error"));
    }
  };

  // Determine sidebar behavior based on screen size
  const showMobileSidebar = isMd;

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Desktop Sidebar */}
      {!showMobileSidebar && (
        <Box
          sx={{
            flexShrink: 0,
            display: { xs: "none", md: "block" },
          }}
        >
          <Sidebar user={user} onChangeProfile={() => setProfileDialogOpen(true)} isSidebarLocked={isSidebarLocked} onToggleSidebarLock={handleToggleSidebarLock} isSidebarCollapsed={isSidebarCollapsed} />
        </Box>
      )}

      {/* Mobile Drawer Sidebar */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleToggleMobileDrawer}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 250,
            bgcolor: "#1e1e1e",
          },
        }}
      >
        <Sidebar user={user} onChangeProfile={() => setProfileDialogOpen(true)} isSidebarLocked={isSidebarLocked} onToggleSidebarLock={handleToggleSidebarLock} isSidebarCollapsed={isSidebarCollapsed} />
      </Drawer>

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top Bar / Navbar */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            height: { xs: '60px', sm: '70px' },
            minHeight: { xs: '60px', sm: '70px' },
            maxHeight: { xs: '60px', sm: '70px  ' },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, sm: 3, md: 4 },
            py: 0,
            color: "#f4f4f4",
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Left side - Toggle buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Mobile Menu Button */}
            {showMobileSidebar && (
              <IconButton
                onClick={handleToggleMobileDrawer}
                sx={{ 
                  display: { xs: "flex", md: "none" }, 
                  color: "#ffffff",
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                  },
                  width: 40,
                  height: 40,
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>

          {/* User Info */}
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: { xs: 2, sm: 2.5 },
              cursor: 'pointer',
            }}
            onClick={handleAvatarClick}
          >
            <Typography 
              sx={{ 
                display: "block",
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1.05rem" },
                fontWeight: 500,
                color: "#ffffff",
                letterSpacing: '0.3px',
                fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
              }}
            >
              {firstName}
            </Typography>

            <Avatar 
              src={user?.profile_picture || "/static/images/avatar/2.jpg"}
              sx={{ 
                width: { xs: 38, sm: 44 },
                height: { xs: 38, sm: 44 },
                cursor: "pointer",
                border: '2px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  transform: 'scale(1.05)',
                }
              }}
            />
          </Box>

          <Menu 
            anchorEl={anchorEl} 
            open={open} 
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                background: '#ffffff',
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem 
              onClick={handleChangeProfile}
              sx={{
                py: 1.5,
                px: 2.5,
                gap: 2,
                fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                '&:hover': {
                  bgcolor: 'rgba(22, 33, 62, 0.06)',
                }
              }}
            >
              <PersonIcon sx={{ fontSize: '1.25rem', color: '#16213e' }} />
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                Change Profile
              </Typography>
            </MenuItem>
            <MenuItem 
              onClick={handleLogoutClick}
              sx={{
                py: 1.5,
                px: 2.5,
                gap: 2,
                fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
                '&:hover': {
                  bgcolor: 'rgba(220, 53, 69, 0.06)',
                }
              }}
            >
              <LogoutIcon sx={{ fontSize: '1.25rem', color: '#dc3545' }} />
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                Logout
              </Typography>
            </MenuItem>
          </Menu>
        </Box>

        {/* Body Content */}
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: "#f9f9f9",
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Conditionally render TopNavContent - only show when NOT on Dashboard */}
          {!isDashboard && <TopNavContent />}
          
          <Box sx={{ padding: { xs: 1, sm: 2 }, flexGrow: 1, overflow: "auto" }}>
            <Outlet />
          </Box>
        </Box>

        <AddNewUserDialog
          open={addUserOpen}
          onClose={() => setAddUserOpen(false)}
          onSave={handleCreateUser}
          isLoading={isCreatingUser} 
        />

        <AddNewTeamDialog
          open={addTeamOpen}
          onClose={() => setAddTeamOpen(false)}
          onSave={handleCreateTeam}
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