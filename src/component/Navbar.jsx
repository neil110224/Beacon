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
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/api/slice/authSlice";
import NestedList from "./sidebar";

import ChangeProfileDialog from "../pages/dialog/ChangeProfileDialog";  
import MainContent from "./MainContent";

import { useCreateUserMutation } from "../features/api/user/userApi";
import TopNavContent from "./TopNavContent";
import AddNewUserDialog from "../pages/dialog/adddialog/AddNewUserDialog";
import AddNewTeamDialog from "../pages/dialog/adddialog/AddNewTeamDialog";
import { useCreateTeamMutation } from "../features/api/team/teamApi";

const Navbar = () => {
  const user = useSelector(selectCurrentUser);
  const firstName = user?.first_name;
  const location = useLocation(); // Add this line
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  const [activePage, setActivePage] = useState("HOME");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const theme = useTheme();
  
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

  // Check if current route is dashboard - Add this line
  const isDashboard = location.pathname === '/Dashboard';

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleChangeProfile = () => {
    setProfileDialogOpen(true);
    handleClose();
  };

  const handleProfileDialogClose = () => {
    setProfileDialogOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    window.location.replace("http://localhost:5173");
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
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
  const sidebarWidth = isSidebarCollapsed ? "70px" : isLg ? "100px" : "215px";

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Desktop Sidebar */}
      {!showMobileSidebar && (
        <Box
          sx={{
            width: sidebarWidth,
            transition: "width 0.3s ease",
            flexShrink: 0,
            display: { xs: "none", md: "block" },
          }}
        >
          <NestedList
            onToggleSidebar={handleToggleSidebar}
            isCollapsed={isSidebarCollapsed}
            onSelectPage={setActivePage}
          />
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
            bgcolor: "#f4f4f4",
          },
        }}
      >
        <NestedList
          isMobileDrawer={true}
          onCloseMobileDrawer={handleToggleMobileDrawer}
          onSelectPage={(page) => {
            setActivePage(page);
            setMobileDrawerOpen(false);
          }}
        />
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
            bgcolor: "#f4f4f4",
            height: { xs: 50, sm: 60 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 1, sm: 2 },
           
            color: "#f4f4f4",
          }}
        >
          {/* Left side - Toggle buttons */}
          <Box sx={{ display: "flex", alignItems: "center",  }}>
            {/* Mobile Menu Button */}
            {showMobileSidebar && (
              <IconButton
                onClick={handleToggleMobileDrawer}
                sx={{ display: { xs: "block", md: "none" }, color: "#fff" }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Desktop Sidebar Toggle Button - only show when expanded */}
            {!showMobileSidebar && !isSidebarCollapsed && (
              <Tooltip title="Collapse sidebar">
                <IconButton
                  onClick={handleToggleSidebar}
                  sx={{ display: { xs: "none", md: "block" }, color: "#070606" }}
                  size={isXs ? "small" : "medium"}
                >
                  <ArrowBackIosIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* User Info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography 
              sx={{ 
                display: { xs: "none", sm: "block" },
                fontSize: { sm: "0.875rem", md: "1rem" },
                color: "#000000",
              }}
            >
              {firstName}
            </Typography>

            <Avatar 
              src={user?.profile_picture || "/static/images/avatar/2.jpg"}
              sx={{ 
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                cursor: "pointer",
              }}
              onClick={handleAvatarClick}
            />
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
    </Box>
  );
};

export default Navbar;