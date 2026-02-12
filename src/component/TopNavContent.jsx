import { 
  Box, 
  Button, 
  IconButton, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import CloseIcon from '@mui/icons-material/Close';
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';

import UserArchive from "../pages/dialog/archivedialog/UserArchive";
import RoleArchive from "../pages/dialog/archivedialog/RoleArchive";
import TeamArchive from "../pages/dialog/archivedialog/TeamArchive";
import ChargingArchive from "../pages/dialog/archivedialog/ChargingArchive";
import ProjectArchive from "../pages/dialog/archivedialog/ProjectArchive";
import { useNavigate } from "react-router-dom";
import AddUserDialog from "../pages/dialog/adddialog/AddNewUserDialog";
import AddTeamDialog from "../pages/dialog/adddialog/AddNewTeamDialog";

const pageConfig = {
  HOME: {
    
    hasArchive: true,
    archiveTitle: "Archived Projects",
    archiveComponent: ProjectArchive,
  },
  USERS: {
    title: "Users",
    buttonLabel: "Create",
    mobileButtonLabel: "Add",
    hasArchive: true,
    archiveTitle: "Archived Users",
    archivedTitle: "Archived Users",
    archiveComponent: UserArchive,
  },
  ROLE: {
    title: "Roles",
    buttonLabel: "Create",
    mobileButtonLabel: "Add",
    hasArchive: true,
    archiveTitle: "Archived Roles",
    archiveComponent: RoleArchive,
  },
  TEAM: {
    title: "Team",
    buttonLabel: "Create",
    mobileButtonLabel: "Add",
    hasArchive: true,
    archiveTitle: "Archived Teams",
    archivedTitle: "Archived Teams",
    archiveComponent: TeamArchive,
  },
  SDLC: {
    title: "SDLC",
    buttonLabel: "Create",
    mobileButtonLabel: "Add",
    hasArchive: true,
  },
  CHARGING: {
    title: "Charging",
    buttonLabel: "Create",
    mobileButtonLabel: "Add",
    hasArchive: true,
    archiveTitle: "Archived CHARGING",
    archiveComponent: ChargingArchive,
  },
};

const getPageKeyFromPath = (pathname) => {
  if (pathname.startsWith("/role")) return "ROLE";
  if (pathname.startsWith("/users")) return "USERS";
  if (pathname.startsWith("/team")) return "TEAM";
  if (pathname.startsWith("/charging")) return "CHARGING";
  if (pathname.startsWith("/sdlc")) return "SDLC";
  return "HOME";
};

const TopNavContent = () => {
  const location = useLocation();
  const theme = useTheme();
  const isXxs = useMediaQuery('(max-width:500px)');
  const isSm = useMediaQuery('(max-width:768px)');

  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const activePage = getPageKeyFromPath(location.pathname);
  const config = pageConfig[activePage] || {
    title: activePage,
    buttonLabel: "Add",
    mobileButtonLabel: "Add",
    hasArchive: false,
  };

  const handleOpenAdd = () => setOpenAddDialog(true);
  const handleCloseAdd = () => setOpenAddDialog(false);

  const handleOpenArchive = () => {
    if (activePage === "USERS" || activePage === "TEAM" || activePage === "CHARGING") {
      const newShowArchived = !showArchived;
      setShowArchived(newShowArchived);
      window[`__${activePage}_SHOW_ARCHIVED__`] = newShowArchived;
      window.dispatchEvent(new CustomEvent('archiveToggle', { detail: { showArchived: newShowArchived } }));
    } else {
      setOpenArchiveDialog(true);
    }
  };

  const handleCloseArchive = () => setOpenArchiveDialog(false);
  const ArchiveComponent = config.archiveComponent;

  const displayTitle = (activePage === "USERS" || activePage === "TEAM") && showArchived 
    ? config.archivedTitle || `Archived ${config.title}`
    : config.title;


  const ArchiveIconComponent = (activePage === "USERS" || activePage === "TEAM") && showArchived
    ? UnarchiveIcon
    : ArchiveIcon;

  const buttonLabel = isSm ? config.mobileButtonLabel : config.buttonLabel;

  return (
    <>
      <Box
        sx={{
          
          display: "flex",
          height: { xs: "60px", sm: "70px", md: "80px" },
          justifyContent: "space-between",
          alignItems: "center",
          padding: { xs: "0 1rem", sm: "0 1.5rem", md: "0 2rem" },
          borderRadius: { xs: "0", sm: "10px 10px 0 0" },
          borderBottom: "1px solid #9e9d9d",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
          {displayTitle}
        </Typography>

        <Box sx={{ display: "flex", gap: 2 ,}}>
          {activePage !== "HOME" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              sx={{ textTransform: "none" }}
            >
              {buttonLabel}
            </Button>
          )}

          {config.hasArchive && (
            <IconButton onClick={handleOpenArchive} sx={{ color: '#505050' }}>
              <ArchiveIconComponent fontSize="large" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Add Dialogs */}
      {activePage === "USERS" && (
        <AddUserDialog
          open={openAddDialog}
          onClose={handleCloseAdd}
          onSave={(data) => {
            console.log("Saving user", data);
            handleCloseAdd();
          }}
        />
      )}

      {activePage === "TEAM" && (
        <AddTeamDialog
          open={openAddDialog}
          onClose={handleCloseAdd}
          onSave={(data) => {
            console.log("Saving team", data);
            handleCloseAdd();
          }}
        />
      )}

      {/* Archive Dialog for other pages */}
      {activePage !== "USERS" && activePage !== "TEAM" && ArchiveComponent && (
        <Dialog
          open={openArchiveDialog}
          onClose={handleCloseArchive}
          maxWidth="xl"
          fullWidth
          fullScreen={isSm}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {config.archiveTitle}
            <IconButton onClick={handleCloseArchive}>
              <MenuIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <ArchiveComponent />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TopNavContent;
