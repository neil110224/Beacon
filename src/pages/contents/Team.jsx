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
  const [refreshing, setRefreshing] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  

  const getRandomColor = (seed) => {
    return '#03346E';
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

  const { data: teamsData, isLoading: teamsLoading, isError: teamsError, error: teamsErrorData, refetch: refetchTeams } = useGetTeamsQuery({
    status: showArchived ? 'inactive' : 'active',
    term: debouncedSearchTerm,
  });
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useGetUsersQuery({
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
  const handleTeamDialogClose = () => { setTeamDialogOpen(false); setSelectedTeam(null); refetchTeams(); };

  // Unified refresh handler for MasterlistTab
  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([refetchTeams(), refetchUsers()]).finally(() => {
      setTimeout(() => setRefreshing(false), 600); // keep spinning for a bit
    });
  };

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
    let filtered = Array.isArray(teams) ? teams : [];
    // Only show archived teams in archive tab, active teams in active tab
    filtered = filtered.filter(team => showArchived ? !!team.deleted_at : !team.deleted_at);
    if (!debouncedSearchTerm) return filtered;
    return filtered.filter(team => team.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  }, [teams, debouncedSearchTerm, showArchived]);

  if (isLoading) {
    return (
      <Box className="teamLoadingContainer">
        <Loading />
      </Box>
    );
  }

  // Show Nodata if searching and no teams found (active or archive), regardless of error
  // Handle 404 error (no teams found) for archive tab
  const is404 = teamsError && teamsErrorData?.errors?.[0]?.status === 404;
  const showNoData = !isLoading && filteredTeams.length === 0 && searchTerm && !showArchived;
  const showArchiveNoData = (!isLoading && filteredTeams.length === 0 && showArchived);

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
        addLabel="CREATE"
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {showNoData && (
        <Box className="teamEmptyStateWrapper">
          <Box className="teamEmptyStateBox">
            <Box>
              <Nodata />
            </Box>
            <Box className="teamEmptyTextBox">
              <Typography variant="h6" className="teamEmptyTitle" sx={{fontFamily: '"Oswald", sans-serif'}}>Teams</Typography>
              <Typography variant="body2" sx={{fontFamily: '"Oswald", sans-serif'}}>Currently no "{searchTerm}" data.</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {showArchiveNoData && (
        <Box className="teamEmptyStateWrapper">
          <Box className="teamEmptyStateBox">
            <Nodata />
            <Box className="teamEmptyTextBox">
              <Typography variant="h6" className="teamEmptyTitle" sx={{fontFamily: '"Oswald", sans-serif'}}>Teams</Typography>
              <Typography variant="body2" sx={{fontFamily: '"Oswald", sans-serif'}}>
                {searchTerm
                  ? `Currently no "${searchTerm}" data in the archive.`
                  : 'No team currently on the archived.'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {!showNoData && !showArchiveNoData && (filteredTeams.length > 0 || isLoading) ? (
        <Box className="teamCardsGrid">
          {filteredTeams.map(team => (
            <Card key={team.id} className="teamCard" style={{ backgroundColor: teamColorMap[team.id] }} onClick={() => handleOpenMembersDialog(team)}>
              <CardContent>
                <Box className="teamCardContent">
                  <Box className="teamCardInfo">
                    <Typography variant="subtitle1" className="teamCardTitle" sx={{fontFamily: '"Oswald", sans-serif'}}>{team.name}</Typography>
                    <Typography variant="body2" sx={{ color: '#f4f4f4', fontFamily: '"Oswald", sans-serif' }}>
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
      ) : null}

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
        <DialogTitle sx={{fontFamily: '"Oswald", sans-serif'}}>{selectedTeamForMembers?.name} - Members</DialogTitle>
        <DialogContent>
          {selectedTeamForMembers?.members && selectedTeamForMembers.members.length > 0 ? (
            <Box className="teamMembersContentBox">
              {selectedTeamForMembers.members.map(member => (
                <Box key={member.id} className="teamMemberItem">
                  <Avatar sx={{ width: 48, height: 48 }} src={member.avatar}>
                    {!member.avatar && member.name.charAt(0)}
                  </Avatar>
                  <Box className="teamMemberInfo">
                    <Typography variant="body2" className="teamMemberName" sx={{ color: '#03346E', fontFamily: '"Oswald", sans-serif' }}>{member.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#03346E', fontFamily: '"Oswald", sans-serif' }}>{member.role}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" className="teamEmptyMembersText" sx={{fontFamily: '"Oswald", sans-serif'}}>
              No members assigned.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMembersDialog} variant="contained" sx={{fontFamily: '"Oswald", sans-serif'}}>
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
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Team;