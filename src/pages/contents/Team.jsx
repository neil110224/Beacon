import React, { useState, useMemo } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Loading from "../../component/reuseable/Loading";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/api/slice/authSlice";
import Nodata from '../../component/reuseable/Nodata'
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import EditIcon from "@mui/icons-material/Edit";
import { useDebounce } from "../../hooks/useDebounce";

import TeamFormDialog from "../dialog/TeamFormDialog";
import Confirmation from "../../component/reuseable/Confirmation";
import "../contentscss/Team.scss";

import { useGetTeamsQuery, useDeleteTeamMutation, useCreateTeamMutation, useUpdateTeamMutation } from "../../features/api/team/teamApi";
import { useGetUsersQuery } from "../../features/api/user/userApi";
import MasterlistTab from "../../component/reuseable/MasterlistTab";

const Team = () => {
  const currentUser = useSelector(selectCurrentUser);
  const userPermissions = currentUser?.role?.access_permissions || [];
  const canAddTeam = userPermissions.includes('Team.Add');
  const [teams, setTeams] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const getRandomColor = (seed) => {
    const colors = ['#FFB6C1', '#87CEEB', '#98FB98', '#FFD700', '#FF6347', '#DDA0DD', '#F0E68C', '#87CEEB', '#FFA07A', '#20B2AA', '#DA70D6', '#F08080', '#B0E0E6', '#FFE4B5', '#F0FFFF'];
    return colors[seed % colors.length];
  };

  const teamColorMap = useMemo(() => {
    const colorMap = {};
    if (Array.isArray(teams)) {
      teams.forEach((team, index) => {
        colorMap[team.id] = getRandomColor(index);
      });
    }
    return colorMap;
  }, [teams]);

  const { data: teamsData, isLoading: teamsLoading, isError: teamsError, error: teamsErrorData, refetch } = useGetTeamsQuery({
    status: showArchived ? 'inactive' : 'active',
    term: debouncedSearchTerm,
  });
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({
    status: 'active',
    paginate: 'none',
    pagination: 'none',
  });
  const [deleteTeam] = useDeleteTeamMutation();
  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation();
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation();

  const isLoading = teamsLoading || usersLoading;
  const isDialogLoading = isCreating || isUpdating;

  React.useEffect(() => {
    if (!teamsData || !usersData) return;

    const teamsArray = Array.isArray(teamsData?.data?.data)
      ? teamsData.data.data
      : Array.isArray(teamsData?.data)
      ? teamsData.data
      : Array.isArray(teamsData)
      ? teamsData
      : [];

    const rawUsers = usersData?.data?.data ?? usersData?.data ?? usersData;
    const usersArray = Array.isArray(rawUsers) ? rawUsers : Object.values(rawUsers || {});

    if (!teamsArray.length) {
      setTeams([]);
      return;
    }

    const teamsWithMembers = teamsArray.map(team => {
      const members = usersArray
        .filter(user => {
          const userTeamId = user.team?.id ?? user.team_id;
          return userTeamId === team.id;
        })
        .map(user => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          avatar: user.avatar || user.profile_picture,
          role: user.role?.name || "Member",
        }));

      return { ...team, members };
    });

    setTeams(teamsWithMembers);
  }, [teamsData, usersData, showArchived]);

  const handleMenuOpen = (event, team) => { setAnchorEl(event.currentTarget); setSelectedTeam(team); };
  const handleMenuClose = () => { setAnchorEl(null); };
  const handleOpenMembersDialog = (team) => { setSelectedTeamForMembers(team); setMemberDialogOpen(true); };
  const handleCloseMembersDialog = () => { setMemberDialogOpen(false); setSelectedTeamForMembers(null); };
  const handleEdit = () => { setTeamDialogOpen(true); handleMenuClose(); };
  const handleArchiveClick = () => { if (!selectedTeam) return; setArchiveDialogOpen(true); handleMenuClose(); };
  const handleArchiveDialogClose = () => { setArchiveDialogOpen(false); setSelectedTeam(null); };
  const handleTeamDialogClose = () => { setTeamDialogOpen(false); setSelectedTeam(null); refetch(); };

  const handleArchiveConfirm = async () => {
    if (!selectedTeam) return;
    try {
      await deleteTeam(selectedTeam.id).unwrap();
      const action = selectedTeam.deleted_at ? "restored" : "archived";
      setSnackbar({ open: true, message: `Team "${selectedTeam.name}" ${action}!`, severity: "success" });
      handleArchiveDialogClose();
      setTimeout(() => refetch(), 500);
    } catch (err) {
      console.error("Failed to archive/restore team:", err);
      setSnackbar({ open: true, message: "Failed to update team", severity: "error" });
    }
  };

  const handleCloseSnackbar = (_, reason) => { if (reason === "clickaway") return; setSnackbar(prev => ({ ...prev, open: false })); };
  const handleTabChange = (event, newValue) => { setShowArchived(newValue === 1); setTeams([]); };

  const filteredTeams = useMemo(() => {
    if (!debouncedSearchTerm) return Array.isArray(teams) ? teams : [];
    return (Array.isArray(teams) ? teams : []).filter(team => team.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  }, [teams, debouncedSearchTerm]);

  if (isLoading) {
    return (
      <Box className="teamContainer" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
        <Loading />
      </Box>
    );
  }

  return (
    <Box className="teamContainer">
      <MasterlistTab
  showArchived={showArchived}
  onTabChange={handleTabChange}
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="Search Team..."
  canAdd={canAddTeam}
  onAddClick={() => setTeamDialogOpen(true)}
  addLabel="Add Team"
/>

      {!isLoading && filteredTeams.length === 0 && (
        <Box className="teamEmptyStateWrapper">
          <Box className="teamEmptyStateBox">
            <Box>
              <Nodata />
            </Box>
            <Box className="teamEmptyTextBox">
              <Typography variant="h6" className="teamEmptyTitle">
                Teams
              </Typography>
              <Typography variant="body2">
                {showArchived
                  ? "Currently no teams in the archive."
                  : "No teams data available."}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {filteredTeams.length > 0 || isLoading ? (
        <Box className="teamCardsGrid">
          {filteredTeams.map(team => (
            <Card key={team.id} className="teamCard" style={{ backgroundColor: teamColorMap[team.id] }} onClick={() => handleOpenMembersDialog(team)}>
              <CardContent>
                <Box className="teamCardContent">
                  <Box className="teamCardInfo">
                    <Typography variant="subtitle1" className="teamCardTitle">{team.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {team.members?.length || 0} {team.members?.length === 1 ? 'member' : 'members'}
                    </Typography>
                  </Box>
                  <IconButton className="teamCardActions" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, team); }} size="small">
                    <MoreVertIcon className="teamMenuIcon" fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box className="teamEmptyStateWrapper">
          <Box className="teamEmptyStateBox">
            <Box>
              <Nodata />
            </Box>
            <Box className="teamEmptyTextBox">
              <Typography variant="h6" className="teamEmptyTitle">Teams</Typography>
              <Typography variant="body2">{showArchived ? "Currently no teams in the archive." : "No teams data available."}</Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Menu className="teamMenu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectedTeam?.deleted_at ? (
          <MenuItem onClick={handleArchiveClick}>
            <RestoreIcon fontSize="small" className="teamMenuItemRestore" sx={{ mr: 1.5 }} />
            Restore
          </MenuItem>
        ) : (
          <>
            <MenuItem onClick={handleEdit}>
              <EditIcon fontSize="small" className="teamMenuItemEdit" sx={{ mr: 1.5 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={handleArchiveClick}>
              <ArchiveIcon fontSize="small" className="teamMenuItemArchive" sx={{ mr: 1.5 }} />
              Archive
            </MenuItem>
          </>
        )}
      </Menu>

      <Dialog className="teamMembersDialog" open={memberDialogOpen} onClose={handleCloseMembersDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTeamForMembers?.name} - Members</DialogTitle>
        <DialogContent>
          {selectedTeamForMembers?.members && selectedTeamForMembers.members.length > 0 ? (
            <Box className="teamMembersContentBox">
              {selectedTeamForMembers.members.map(member => (
                <Box key={member.id} className="teamMemberItem">
                  <Avatar sx={{ width: 48, height: 48 }} src={member.avatar}>
                    {!member.avatar && member.name.charAt(0)}
                  </Avatar>
                  <Box className="teamMemberInfo">
                    <Typography variant="body2" className="teamMemberName">{member.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{member.role}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" className="teamEmptyMembersText">
              No members assigned.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMembersDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {selectedTeam && (
        <Confirmation
          open={archiveDialogOpen}
          onClose={handleArchiveDialogClose}
          onConfirm={handleArchiveConfirm}
          title={`Confirm ${selectedTeam.deleted_at ? 'Restore' : 'Archive'}`}
          message={`Are you sure you want to ${selectedTeam.deleted_at ? 'restore' : 'archive'} "${selectedTeam.name}"?`}
        />
      )}

      <TeamFormDialog
        key={teamDialogOpen ? (selectedTeam ? `edit-${selectedTeam.id}` : 'add') : 'closed'}
        open={teamDialogOpen}
        onClose={handleTeamDialogClose}
        team={selectedTeam}
        onSave={selectedTeam ? updateTeam : createTeam}
        isLoading={isDialogLoading}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Team;