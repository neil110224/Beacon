import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  AvatarGroup,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { useGetTeamsQuery, useRestoreTeamMutation } from '../../../features/api/team/teamApi';
import { useGetUsersQuery } from '../../../features/api/user/userApi';


const TeamArchive = () => {
  const [archivedTeams, setArchivedTeams] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { data: teamsData, isLoading: teamsLoading } = useGetTeamsQuery({
    status: 'inactive', // fetch archived teams
    pagination: false,
  });
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({ status: 'active' });
  const [restoreTeam] = useRestoreTeamMutation(); // API to restore team

  const isLoading = teamsLoading || usersLoading;

  useEffect(() => {
    if (!teamsData || !usersData) return;

    const teamsArray = Array.isArray(teamsData?.data) ? teamsData.data : Array.isArray(teamsData) ? teamsData : [];
    const usersArray = Array.isArray(usersData?.data) ? usersData.data : Array.isArray(usersData) ? usersData : [];

    // Only proceed if teamsArray is actually an array
    if (!Array.isArray(teamsArray)) return;

    const archived = teamsArray.map(team => {
      const members = usersArray
        .filter(user => user.team && user.team.id === team.id)
        .map(user => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          avatar: user.avatar || user.profile_picture,
          role: user.role?.name || 'Member',
        }));

      return { ...team, members };
    });

    setArchivedTeams(archived);
  }, [teamsData, usersData]);

  const handleMenuOpen = (event, team) => {
    setAnchorEl(event.currentTarget);
    setSelectedTeam(team);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTeam(null);
  };

  const handleRestore = async () => {
    if (!selectedTeam) return;

    try {
      // Call API to restore the team
      await restoreTeam({ id: selectedTeam.id, deleted_at: null }).unwrap();

      setArchivedTeams(prev => prev.filter(t => t.id !== selectedTeam.id));

      setSnackbar({ open: true, message: `Team "${selectedTeam.name}" restored!`, severity: 'success' });
      handleMenuClose();
    } catch (err) {
      console.error('Failed to restore team:', err);
      setSnackbar({ open: true, message: 'Failed to restore team', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Archived Teams
      </Typography>

      {archivedTeams.length === 0 && <Typography>No archived teams found.</Typography>}

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
        {archivedTeams.map(team => (
          <Card key={team.id} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
            <CardContent>
              {/* Header with MoreVertIcon */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
                <AvatarGroup max={5} sx={{ mb: 2 }}>
                  {team.members.map(member => (
                    <Avatar key={member.id} src={member.avatar}>
                      {!member.avatar && member.name.charAt(0)}
                    </Avatar>
                  ))}
                </AvatarGroup>
              )}

              {/* Full Member List */}
              {team.members && team.members.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {team.members.map(member => (
                    <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Menu for restore */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleRestore}>Restore</MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeamArchive;
