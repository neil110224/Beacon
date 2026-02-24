import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Autocomplete,
} from '@mui/material';
import {
  Edit as EditIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import React, { useState, useEffect } from 'react';

import {
  useGetTeamsQuery,
  useUpdateTeamMutation,
} from '../../../features/api/team/teamApi';
import {
  useUpdateUserMutation,
} from '../../../features/api/user/userApi';

import Snackbar from '../../../component/reuseable/snackbar';

const EditTeam = ({ open, onClose, team, refetchTeams }) => {
  const { data: teamsData } = useGetTeamsQuery({ status: 'active' });

  const [updateTeam] = useUpdateTeamMutation();
  const [updateUser] = useUpdateUserMutation();

  const [editNameDialogOpen, setEditNameDialogOpen] = useState(false);
  const [changeTeamDialogOpen, setChangeTeamDialogOpen] = useState(false);

  const [teamName, setTeamName] = useState('');
  const [currentTeam, setCurrentTeam] = useState(null);

  const [userToChange, setUserToChange] = useState(null);
  const [selectedNewTeam, setSelectedNewTeam] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSuccess = (message) =>
    setSnackbar({ open: true, message, severity: 'success' });

  const showError = (message) =>
    setSnackbar({ open: true, message, severity: 'error' });

  useEffect(() => {
    if (open && team) {
      setCurrentTeam({
        id: team.id,
        name: team.name,
        members: [...(team.members || [])],
      });
      setTeamName(team.name);
    } else {
      setCurrentTeam(null);
      setTeamName('');
    }
  }, [open, team]);

  if (!open || !currentTeam) return null;

  const teams = Array.isArray(teamsData?.data)
    ? teamsData.data
    : Array.isArray(teamsData)
    ? teamsData
    : [];

  /* ================= Edit Team Name ================= */

  const handleSaveTeamName = async () => {
    if (!teamName.trim()) {
      showError('Team name cannot be empty');
      return;
    }

    try {
      await updateTeam({
        id: currentTeam.id,
        name: teamName,
      }).unwrap();

      // 🔥 Force refresh parent list
      if (refetchTeams) {
        await refetchTeams();
      }

      setCurrentTeam((prev) => ({ ...prev, name: teamName }));
      setEditNameDialogOpen(false);
      showSuccess('Team name updated successfully');
    } catch (error) {
      console.error(error);
      showError('Failed to update team name');
    }
  };

  /* ================= Change Member Team ================= */

  const handleChangeTeam = (member) => {
    setUserToChange(member);
    setSelectedNewTeam(null);
    setChangeTeamDialogOpen(true);
  };

  const handleConfirmChangeTeam = async () => {
    if (!userToChange || !selectedNewTeam) return;

    try {
      await updateUser({
        id: userToChange.id,
        data: { team_id: selectedNewTeam.id },
      }).unwrap();

      // Remove user from current team UI immediately
      setCurrentTeam((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.id !== userToChange.id),
      }));

      if (refetchTeams) {
        await refetchTeams();
      }

      setChangeTeamDialogOpen(false);
      setUserToChange(null);
      setSelectedNewTeam(null);

      showSuccess("Member's team changed successfully");
    } catch (error) {
      showError("Failed to change member's team");
    }
  };

  const availableTeams = teams.filter((t) => t.id !== currentTeam.id);

  return (
    <>
      {/* ================= MAIN DIALOG ================= */}
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Team: {currentTeam.name}</DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Team Name */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                p: 2,
                border: '1px solid #ddd',
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Team Name
                </Typography>
                <Typography variant="h6">{currentTeam.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {currentTeam.id}
                </Typography>
              </Box>

              <IconButton onClick={() => setEditNameDialogOpen(true)}>
                <EditIcon />
              </IconButton>
            </Box>

            {/* Members */}
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Members ({currentTeam.members.length})
            </Typography>

            <Stack spacing={1}>
              {currentTeam.members.length ? (
                currentTeam.members.map((member) => (
                  <Box
                    key={member.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Typography fontWeight={500}>
                        {member.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.role}
                      </Typography>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={() => handleChangeTeam(member)}
                      title="Change team"
                    >
                      <GroupIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary" align="center">
                  No members
                </Typography>
              )}
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ================= EDIT NAME ================= */}
      <Dialog
        open={editNameDialogOpen}
        onClose={() => setEditNameDialogOpen(false)}
      >
        <DialogTitle>Edit Team Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditNameDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTeamName}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= CHANGE TEAM ================= */}
      <Dialog
        open={changeTeamDialogOpen}
        onClose={() => setChangeTeamDialogOpen(false)}
      >
        <DialogTitle>
          Change Team for {userToChange?.name}
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            options={availableTeams}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) =>
              option.id === value.id
            }
            value={selectedNewTeam}
            onChange={(e, newValue) => setSelectedNewTeam(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select New Team"
                margin="dense"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangeTeamDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!selectedNewTeam}
            onClick={handleConfirmChangeTeam}
          >
            Change Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= SNACKBAR ================= */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() =>
          setSnackbar((s) => ({ ...s, open: false }))
        }
      />
    </>
  );
};

export default EditTeam;
