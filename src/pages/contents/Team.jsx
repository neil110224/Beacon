import React, { useEffect, useState, useMemo } from "react";
import {
  Avatar,
  AvatarGroup,
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Button,
} from "@mui/material";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/api/slice/authSlice";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useDebounce } from "../../hooks/useDebounce";

import TeamFormDialog from "../dialog/TeamFormDialog";
import Confirmation from "../../component/reuseable/Confirmation";

import { useGetTeamsQuery, useDeleteTeamMutation, useCreateTeamMutation, useUpdateTeamMutation } from "../../features/api/team/teamApi";
import { useGetUsersQuery } from "../../features/api/user/userApi";

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
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

  /* ================= Listen for archive toggle ================= */
  useEffect(() => {
    const handleArchiveToggle = (event) => {
      setShowArchived(event.detail.showArchived);
    };

    window.addEventListener('teamArchiveToggle', handleArchiveToggle);

    return () => {
      window.removeEventListener('teamArchiveToggle', handleArchiveToggle);
    };
  }, []);

  /* ================= Load Teams & Members ================= */
  useEffect(() => {
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

  /* ================= Menu ================= */
  const handleMenuOpen = (event, team) => {
    setAnchorEl(event.currentTarget);
    setSelectedTeam(team);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setTeamDialogOpen(true);
    handleMenuClose();
  };

  const handleArchiveClick = () => {
    if (!selectedTeam) return;
    setArchiveDialogOpen(true);
    handleMenuClose();
  };

  const handleArchiveDialogClose = () => {
    setArchiveDialogOpen(false);
    setSelectedTeam(null);
  };

  const handleTeamDialogClose = () => {
    setTeamDialogOpen(false);
    setSelectedTeam(null);
    refetch();
  };

  const handleArchiveConfirm = async () => {
    if (!selectedTeam) return;

    try {
      await deleteTeam(selectedTeam.id).unwrap();

      const action = selectedTeam.deleted_at ? "restored" : "archived";
      setSnackbar({
        open: true,
        message: `Team "${selectedTeam.name}" ${action}!`,
        severity: "success"
      });

      handleArchiveDialogClose();
      setTimeout(() => refetch(), 500);
    } catch (err) {
      console.error("Failed to archive/restore team:", err);
      setSnackbar({ open: true, message: "Failed to update team", severity: "error" });
    }
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleTabChange = (event, newValue) => {
    setShowArchived(newValue === 1);
    setTeams([]); // clear previous tab's teams while new data loads
  };

  // Filter teams by debounced search term
  const filteredTeams = useMemo(() => {
    if (!debouncedSearchTerm) return Array.isArray(teams) ? teams : [];
    return (Array.isArray(teams) ? teams : []).filter(team =>
      team.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [teams, debouncedSearchTerm]);

  /* ================= Loading ================= */
  if (isLoading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  /* ================= Render ================= */
  return (
    <Box sx={{ p: 2 }}>
      {/* Search Bar and Add Button */}
      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <TextField
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9e9e9e' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: '#fff',
              '&:hover fieldset': { borderColor: '#2c3e50' },
              '&.Mui-focused fieldset': { borderColor: '#2c3e50' },
            },
          }}
        />
        {canAddTeam && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedTeam(null);
              setTeamDialogOpen(true);
            }}
            sx={{
              backgroundColor: '#2c3e50',
              textTransform: 'none',
              borderRadius: '8px',
              padding: '6px 20px',
              fontWeight: 500,
              '&:hover': { backgroundColor: '#34495e' },
            }}
          >
            Create
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1.5 }}>
        <Tabs
          value={showArchived ? 1 : 0}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              minHeight: 38,
              py: 1,
              color: '#666',
              '&.Mui-selected': { color: '#2c3e50' },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2c3e50',
              height: 2,
            },
          }}
        >
          <Tab label="Active" />
          <Tab label="Archived" />
        </Tabs>
      </Box>

      {/* Empty / Error State */}
      {!isLoading && filteredTeams.length === 0 && (
        <Box mb={2}>
          <Alert severity="info">
            {showArchived
              ? "Currently no teams in the archive."
              : "No teams data available."}
          </Alert>
        </Box>
      )}

      {/* Team Cards */}
      {filteredTeams.length > 0 && (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 2 }}>
          {filteredTeams.map(team => (
            <Card key={team.id} sx={{ borderRadius: 2, border: "1px solid #e0e0e0", boxShadow: "none" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{team.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{team.members?.length || 0} members</Typography>
                  </Box>
                  <IconButton onClick={(e) => handleMenuOpen(e, team)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {/* Avatar Group */}
                {team.members && team.members.length > 0 && (
                  <AvatarGroup max={5} sx={{ mb: 2, justifyContent: 'flex-start' }}>
                    {team.members.map(member => (
                      <Avatar key={member.id} src={member.avatar}>
                        {!member.avatar && member.name.charAt(0)}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                )}

                {/* Full Member List */}
                {team.members && team.members.length > 0 && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {team.members.map(member => (
                      <Box key={member.id} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36 }} src={member.avatar}>
                          {!member.avatar && member.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{member.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{member.role}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* No members state */}
                {(!team.members || team.members.length === 0) && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No members assigned.
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectedTeam?.deleted_at ? (
          <MenuItem
            onClick={handleArchiveClick}
            sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
          >
            <RestoreIcon fontSize="small" sx={{ mr: 1.5, color: '#2e7d32' }} />
            Restore
          </MenuItem>
        ) : [
          <MenuItem
            key="edit"
            onClick={handleEdit}
            sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1.5, color: '#1976d2' }} />
            Edit
          </MenuItem>,
          <MenuItem
            key="archive"
            onClick={handleArchiveClick}
            sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
          >
            <ArchiveIcon fontSize="small" sx={{ mr: 1.5, color: '#ed6c02' }} />
            Archive
          </MenuItem>
        ]}
      </Menu>

      {/* Archive / Restore Confirmation */}
      {selectedTeam && (
        <Confirmation
          open={archiveDialogOpen}
          onClose={handleArchiveDialogClose}
          onConfirm={handleArchiveConfirm}
          title={`Confirm ${selectedTeam.deleted_at ? 'Restore' : 'Archive'}`}
          message={`Are you sure you want to ${selectedTeam.deleted_at ? 'restore' : 'archive'} "${selectedTeam.name}"?`}
        />
      )}

      {/* Merged Team Form Dialog (Add/Edit) */}
      <TeamFormDialog
        key={teamDialogOpen ? (selectedTeam ? `edit-${selectedTeam.id}` : 'add') : 'closed'}
        open={teamDialogOpen}
        onClose={handleTeamDialogClose}
        team={selectedTeam}  // null = add mode, object = edit mode
        onSave={selectedTeam ? updateTeam : createTeam}
        isLoading={isDialogLoading}
      />

      {/* Snackbar */}
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