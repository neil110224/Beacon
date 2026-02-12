// src/components/MainContent.jsx
import { Box } from "@mui/material";

import Dashboard from "../pages/contents/Dashboard";
import Users from "../pages/contents/Users";
import Team from "../pages/contents/Team";
import SDLC from "../pages/contents/SDLC";
import Charging from "../pages/contents/Charging";
import UserArchive from "../pages/dialog/archivedialog/UserArchive";
import Role from "../pages/contents/Role";


const MainContent = ({ activePage }) => {
  return (
    <Box
      sx={{
        bgcolor: "#000000",
        flexGrow: 1,
        padding: 2,
        overflow: "auto",
        minHeight: 0,
      }}
    >
      {activePage === "HOME" && <Dashboard />}
      {activePage === "ROLE" && <Role />}
      {activePage === "USERS" && <Users />}
      {activePage === "TEAM" && <Team />}
      {activePage === "SDLC" && <SDLC />}
      {activePage === "CHARGING" && <Charging />}
      {activePage === "ARCHIVED_USERS" && <UserArchive />} {/* ✅ ADD THIS */}
    </Box>
  );
};

export default MainContent;
