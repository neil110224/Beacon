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
import { Outlet } from "react-router-dom";
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
  const sidebarWidth = isSidebarCollapsed ? "70px" : isLg ? "100px" : "250px";

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

      {/* Right side */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#eeeded",
          marginRight: { xs: 0, sm: 1, md: 2, lg: 5 },
          borderRadius: { xs: 0, sm: 2 },
          overflow: "hidden",
        }}
      >
        {/* Top Bar */}
        <Box
          sx={{
            bgcolor: "#f4f4f4",
            height: { xs: 80, sm: 90 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 1, sm: 2 },
          }}
        >
          {/* Left side - Toggle buttons */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* Mobile Menu Button */}
            {showMobileSidebar && (
              <IconButton
                onClick={handleToggleMobileDrawer}
                sx={{ display: { xs: "block", md: "none" } }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Desktop Sidebar Toggle Button */}
            {!showMobileSidebar && (
              <Tooltip title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                <IconButton
                  onClick={handleToggleSidebar}
                  sx={{ display: { xs: "none", md: "block" } }}
                  size={isXs ? "small" : "medium"}
                >
                  {isSidebarCollapsed ? (
                    <ArrowForwardIosIcon fontSize="small" />
                  ) : (
                    <ArrowBackIosIcon fontSize="small" />
                  )}
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
              }}
            >
              {firstName}
            </Typography>

            <Avatar 
              Size="large"
              src={user?.profile_picture || "/static/images/avatar/2.jpg"}
              sx={{ 
                width: { xs: 62, sm: 40 },
                height: { xs: 32, sm: 40 },
                cursor: "pointer",
                Size: 'large',
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

        <TopNavContent 
          activePage={activePage} 
          onAddClick={handleAddClick}
        />

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

        <Box 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 1, sm: 2, md: 3 }, 
            overflowY: "auto" 
          }}
        >
          <Outlet />
        </Box>
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