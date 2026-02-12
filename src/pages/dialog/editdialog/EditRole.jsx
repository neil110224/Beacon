import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useState } from 'react';

const Transition = ({ children, ...props }) => {
  return <Slide direction="up" {...props}>{children}</Slide>;
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 17,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 15,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function createRole(id, roleName, description, created_at, updated_at) {
  return { id, roleName, description, created_at, updated_at };
}

const roles = [
  createRole(1, 'Frontend', 'Handles client-side development', '2023-01-15', '2023-10-20'),
  createRole(2, 'Backend', 'Manages server-side logic and databases', '2023-01-15', '2023-09-18'),
  createRole(3, 'FullStack', 'Works on both frontend and backend', '2023-01-15', '2023-11-05'),
  createRole(4, 'UIX', 'Focuses on user interface and experience design', '2023-02-01', '2023-08-22'),
  createRole(5, 'DOCUMENTS', 'Handles documentation and technical writing', '2023-02-10', '2023-07-30'),
  createRole(6, 'SENIOR DEV', 'Senior developer with leadership responsibilities', '2023-01-20', '2023-10-15'),
];

const availableRoles = ['Frontend', 'Backend', 'FullStack', 'UIX', 'DOCUMENTS', 'SENIOR DEV'];

export default function RolesTable() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const open = Boolean(anchorEl);

  const handleClick = (event, role) => {
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setDialogOpen(true);
    setNewRoleName(selectedRole?.roleName || '');
    handleClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewRoleName('');
  };

  const handleRoleClick = (role) => {
    setNewRoleName(role);
    console.log('Selected role:', role);
  };

  const handleConfirm = () => {
    console.log('Updating role:', selectedRole.id, 'to:', newRoleName);
    // Add your role update logic here
    handleDialogClose();
    setSelectedRole(null);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="roles table">
          <TableHead sx={{ bgcolor: '#dadada' }}>
            <TableRow>
              <StyledTableCell>ID</StyledTableCell>
              <StyledTableCell align="left">Role Name</StyledTableCell>
              <StyledTableCell align="left">Description</StyledTableCell>
              <StyledTableCell align="left">Created At</StyledTableCell>
              <StyledTableCell align="left">Updated At</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <StyledTableRow key={role.id}>
                <StyledTableCell component="th" scope="row">
                  {role.id}
                </StyledTableCell>
                <StyledTableCell align="left">{role.roleName}</StyledTableCell>
                <StyledTableCell align="left">{role.description}</StyledTableCell>
                <StyledTableCell align="left">{role.created_at}</StyledTableCell>
                <StyledTableCell align="left">{role.updated_at}</StyledTableCell>
                <StyledTableCell align="center">
                  <IconButton
                    aria-label="more"
                    aria-controls={open ? 'role-menu' : undefined}
                    aria-haspopup="true"
                    onClick={(e) => handleClick(e, role)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        id="role-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'role-button',
        }}
      >
        <MenuItem onClick={handleEdit}>EDIT</MenuItem>
      </Menu>

      <Dialog
        open={dialogOpen}
        slots={{
          transition: Transition,
        }}
        keepMounted
        onClose={handleDialogClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"CHOOSE TO CHANGE THE ROLE"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description" sx={{ mb: 2 }}>
            Select a role from the list below:
          </DialogContentText>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {availableRoles.map((role) => (
              <Chip
                key={role}
                label={role}
                onClick={() => handleRoleClick(role)}
                color={newRoleName === role ? 'primary' : 'default'}
                variant={newRoleName === role ? 'filled' : 'outlined'}
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained" disabled={!newRoleName}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}