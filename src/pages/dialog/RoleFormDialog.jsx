import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Snackbar,
  Alert,
  IconButton,
  Collapse,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

/**
 * RoleFormDialog Component
 * 
 * A dialog for creating and editing roles with permission management
 * 
 * @param {boolean} props.open - Whether the dialog is open
 * @param {function} props.onClose - Callback when dialog closes
 * @param {object} props.role - The role object to edit (null for create)
 * @param {function} props.onSave - Callback with (roleData) for create or (id, data) for update
 * @param {boolean} props.isLoading - Loading state from mutation
 */
export default function RoleFormDialog({ open, onClose, role = null, onSave, isLoading = false }) {
  const isEdit = !!role;
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [localLoading, setLocalLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({ dashboard: false, masterlist: true, users: false, category: false, team: false, charging: false, role: false, systems: false });

  // Hierarchical permission structure
  const PERMISSION_STRUCTURE = {
    Dashboard: [],
    Systems: [],
    Masterlist: [
      'Users',
      'Category',
      'Team',
      'Charging',
      'Role',
    ],
  };

  // Sub-children permissions for Dashboard items
  const DASHBOARD_SUBCHILDREN = {
    Dashboard: ['Dashboard.FilterTeam'],
  };

  // Sub-children permissions for Masterlist items
  const MASTERLIST_SUBCHILDREN = {
    Users: ['Users.Add'],
    Category: ['Category.Add'],
    Team: ['Team.Add'],
    Charging: ['Charging.Add'],
    Role: ['Role.Add'],
  };

  // Sub-children permissions for Systems
  const SYSTEMS_SUBCHILDREN = {
    Systems: ['Systems.Add', 'Systems.Import'],
  };

  // Validation schema
  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .required('Role name is required')
      .min(2, 'Role name must be at least 2 characters'),
    permissions: yup
      .array()
      .min(1, 'At least one permission must be selected'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: '',
      permissions: [],
    },
  });

  // Watch permissions to update selected permissions
  const selectedPermissions = watch('permissions');

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const handleParentPermissionChange = (parent) => {
    const current = selectedPermissions || [];
    const children = PERMISSION_STRUCTURE[parent] || [];
    const parentAndChildren = [parent, ...children];

    // If any child is checked, uncheck all; otherwise check all
    const allSelected = parentAndChildren.every(p => current.includes(p));

    if (allSelected) {
      // Remove parent and all children
      setValue(
        'permissions',
        current.filter(p => !parentAndChildren.includes(p))
      );
    } else {
      // Add parent and all children
      const newPermissions = new Set(current);
      parentAndChildren.forEach(p => newPermissions.add(p));
      setValue('permissions', Array.from(newPermissions));
    }
  };

  const handleChildPermissionChange = (permission) => {
    const current = selectedPermissions || [];
    if (current.includes(permission)) {
      setValue(
        'permissions',
        current.filter((p) => p !== permission)
      );
    } else {
      setValue('permissions', [...current, permission]);
    }
  };

  const isParentChecked = (parent) => {
    const current = selectedPermissions || [];
    const children = PERMISSION_STRUCTURE[parent] || [];
    const parentAndChildren = [parent, ...children];
    return parentAndChildren.every(p => current.includes(p));
  };

  const isParentIndeterminate = (parent) => {
    const current = selectedPermissions || [];
    const children = PERMISSION_STRUCTURE[parent] || [];
    const parentAndChildren = [parent, ...children];
    const checkedCount = parentAndChildren.filter(p => current.includes(p)).length;
    return checkedCount > 0 && checkedCount < parentAndChildren.length;
  };

  // Handle sub-child permission (e.g., Users.Add)
  const handleSubchildPermissionChange = (subchild) => {
    const current = selectedPermissions || [];
    if (current.includes(subchild)) {
      setValue(
        'permissions',
        current.filter((p) => p !== subchild)
      );
    } else {
      setValue('permissions', [...current, subchild]);
    }
  };

  // Reset form when dialog opens/closes or when switching between add/edit mode
  useEffect(() => {
    if (open) {
      if (isEdit && role) {
        // Populate form with role data for editing
        reset({
          name: role.name || '',
          permissions: role.access_permissions || [],
        });
      } else {
        // Clear form for creating new role - explicitly clear all fields
        reset({
          name: '',
          permissions: [],
        });
      }
    } else {
      // Reset loading state when dialog closes
      setLocalLoading(false);
    }
  }, [open, role, isEdit, reset]);

  const onSubmit = async (data) => {
    setLocalLoading(true);
    try {
      if (isEdit) {
        // For edit: pass id and data separately
        await onSave({ id: role.id, data: { name: data.name, access_permissions: data.permissions } }).unwrap();
      } else {
        // For create: pass the entire object
        await onSave({ name: data.name, access_permissions: data.permissions }).unwrap();
      }

      setSnackbar({
        open: true,
        message: isEdit ? 'Role updated successfully!' : 'Role created successfully!',
        severity: 'success',
      });

      setTimeout(() => {
        setLocalLoading(false);
        onClose();
      }, 1000);
    } catch (error) {
      setLocalLoading(false);
      setSnackbar({
        open: true,
        message: error.message || 'An error occurred',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem', color: '#2c3e50' }}>
          {isEdit ? 'Edit Role' : 'Add New Role'}
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Role Name Input */}
            <TextField
              label="Role Name"
              fullWidth
              placeholder="Enter role name"
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover fieldset': {
                    borderColor: '#2c3e50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2c3e50',
                  },
                },
              }}
            />

            {/* Permissions Section */}
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontWeight: 600, marginBottom: 1.5, color: '#2c3e50' }}>
                Permissions:
              </Typography>
              <FormGroup sx={{ gap: 1 }}>
                {/* Dashboard - parent permission with expandable FilterTeam */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedPermissions?.includes('Dashboard') || false}
                          onChange={() => handleChildPermissionChange('Dashboard')}
                          sx={{
                            color: '#9e9e9e',
                            '&.Mui-checked': {
                              color: '#2c3e50',
                            },
                          }}
                        />
                      }
                      label={'Dashboard'}
                      sx={{
                        marginBottom: 0,
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.95rem',
                          fontWeight: 500,
                        },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => toggleGroup('dashboard')}
                      sx={{ padding: 0, marginLeft: 'auto', marginRight: 1 }}
                    >
                      {expandedGroups.dashboard ? (
                        <ExpandLessIcon sx={{ fontSize: '1.2rem', color: '#2c3e50' }} />
                      ) : (
                        <ExpandMoreIcon sx={{ fontSize: '1.2rem', color: '#2c3e50' }} />
                      )}
                    </IconButton>
                  </Box>

                  {/* Dashboard child permissions */}
                  <Collapse in={expandedGroups.dashboard} timeout="auto" unmountOnExit>
                    <FormGroup sx={{ paddingLeft: 3, gap: 0.5, marginTop: 1 }}>
                      {DASHBOARD_SUBCHILDREN.Dashboard?.map((subchild) => (
                        <FormControlLabel
                          key={subchild}
                          control={
                            <Checkbox
                              checked={selectedPermissions?.includes(subchild) || false}
                              onChange={() => handleSubchildPermissionChange(subchild)}
                              sx={{
                                color: '#9e9e9e',
                                '&.Mui-checked': {
                                  color: '#2c3e50',
                                },
                              }}
                            />
                          }
                          label={subchild}
                          sx={{
                            marginBottom: 0,
                            '& .MuiFormControlLabel-label': {
                              fontSize: '0.9rem',
                            },
                          }}
                        />
                      ))}
                    </FormGroup>
                  </Collapse>
                </Box>

                {/* Systems - parent permission with expandable Add */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedPermissions?.includes('Systems') || false}
                          onChange={() => handleChildPermissionChange('Systems')}
                          sx={{
                            color: '#9e9e9e',
                            '&.Mui-checked': {
                              color: '#2c3e50',
                            },
                          }}
                        />
                      }
                      label={'Systems'}
                      sx={{
                        marginBottom: 0,
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.95rem',
                          fontWeight: 500,
                        },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => toggleGroup('systems')}
                      sx={{ padding: 0, marginLeft: 'auto', marginRight: 1 }}
                    >
                      {expandedGroups.systems ? (
                        <ExpandLessIcon sx={{ fontSize: '1.2rem', color: '#2c3e50' }} />
                      ) : (
                        <ExpandMoreIcon sx={{ fontSize: '1.2rem', color: '#2c3e50' }} />
                      )}
                    </IconButton>
                  </Box>

                  {/* Systems Add sub-permission */}
                  <Collapse in={expandedGroups.systems} timeout="auto" unmountOnExit>
                    <FormGroup sx={{ paddingLeft: 3, gap: 0.5, marginTop: 1 }}>
                      {SYSTEMS_SUBCHILDREN.Systems?.map((subchild) => (
                        <FormControlLabel
                          key={subchild}
                          control={
                            <Checkbox
                              checked={selectedPermissions?.includes(subchild) || false}
                              onChange={() => handleSubchildPermissionChange(subchild)}
                              sx={{
                                color: '#9e9e9e',
                                '&.Mui-checked': {
                                  color: '#2c3e50',
                                },
                              }}
                            />
                          }
                          label={subchild}
                          sx={{
                            marginBottom: 0,
                            '& .MuiFormControlLabel-label': {
                              fontSize: '0.9rem',
                            },
                          }}
                        />
                      ))}
                    </FormGroup>
                  </Collapse>
                </Box>

                {/* Masterlist - parent with children */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isParentChecked('Masterlist')}
                          indeterminate={isParentIndeterminate('Masterlist')}
                          onChange={() => handleParentPermissionChange('Masterlist')}
                          sx={{
                            color: '#9e9e9e',
                            '&.Mui-checked': {
                              color: '#2c3e50',
                            },
                          }}
                        />
                      }
                      label={'Masterlist'}
                      sx={{
                        marginBottom: 0,
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.95rem',
                          fontWeight: 500,
                        },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => toggleGroup('masterlist')}
                      sx={{ padding: 0, marginLeft: 'auto', marginRight: 1 }}
                    >
                      {expandedGroups.masterlist ? (
                        <ExpandLessIcon sx={{ fontSize: '1.2rem', color: '#2c3e50' }} />
                      ) : (
                        <ExpandMoreIcon sx={{ fontSize: '1.2rem', color: '#2c3e50' }} />
                      )}
                    </IconButton>
                  </Box>

                  {/* Masterlist children with sub-children */}
                  <Collapse in={expandedGroups.masterlist} timeout="auto" unmountOnExit>
                    <FormGroup sx={{ paddingLeft: 3, gap: 0.5, marginTop: 1 }}>
                      {PERMISSION_STRUCTURE.Masterlist.map((permission) => (
                        <Box key={permission}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedPermissions?.includes(permission) || false}
                                  onChange={() => handleChildPermissionChange(permission)}
                                  sx={{
                                    color: '#9e9e9e',
                                    '&.Mui-checked': {
                                      color: '#2c3e50',
                                    },
                                  }}
                                />
                              }
                              label={permission}
                              sx={{
                                marginBottom: 0.5,
                                '& .MuiFormControlLabel-label': {
                                  fontSize: '0.9rem',
                                },
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => toggleGroup(permission.toLowerCase())}
                              sx={{ padding: 0, marginLeft: 'auto', marginRight: 0.5 }}
                            >
                              {expandedGroups[permission.toLowerCase()] ? (
                                <ExpandLessIcon sx={{ fontSize: '1rem', color: '#2c3e50' }} />
                              ) : (
                                <ExpandMoreIcon sx={{ fontSize: '1rem', color: '#2c3e50' }} />
                              )}
                            </IconButton>
                          </Box>

                          {/* Sub-children (Add permissions) */}
                          <Collapse in={expandedGroups[permission.toLowerCase()]} timeout="auto" unmountOnExit>
                            <FormGroup sx={{ paddingLeft: 5, gap: 0.5, marginTop: 0.5 }}>
                              {MASTERLIST_SUBCHILDREN[permission]?.map((subchild) => (
                                <FormControlLabel
                                  key={subchild}
                                  control={
                                    <Checkbox
                                      checked={selectedPermissions?.includes(subchild) || false}
                                      onChange={() => handleSubchildPermissionChange(subchild)}
                                      sx={{
                                        color: '#9e9e9e',
                                        '&.Mui-checked': {
                                          color: '#2c3e50',
                                        },
                                      }}
                                    />
                                  }
                                  label="Add"
                                  sx={{
                                    marginBottom: 0.5,
                                    '& .MuiFormControlLabel-label': {
                                      fontSize: '0.85rem',
                                    },
                                  }}
                                />
                              ))}
                            </FormGroup>
                          </Collapse>
                        </Box>
                      ))}
                    </FormGroup>
                  </Collapse>
                </Box>
              </FormGroup>
              {errors.permissions && (
                <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', mt: 1 }}>
                  {errors.permissions.message}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ padding: 2, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={isLoading || localLoading}
            sx={{
              textTransform: 'none',
              color: '#666',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={isLoading || localLoading}
            startIcon={(isLoading || localLoading) && <CircularProgress size={20} />}
            sx={{
              textTransform: 'none',
              backgroundColor: '#2c3e50',
              '&:hover': { backgroundColor: '#34495e' },
              '&:disabled': { backgroundColor: '#ccc' },
            }}
          >
            {isLoading || localLoading ? 'Saving...' : isEdit ? 'Update Role' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
